import munkres from 'munkres-js';
import { query, queryOne } from '../db/index.js';
import type { User, Idea, Match, EngineerSpecialty, MatchResult, Ranking } from '@hackr/shared';
import { getMatchableUsers } from './user.service.js';
import { getIdeas } from './idea.service.js';
import { getAllRankings } from './ranking.service.js';

interface Slot {
  ideaId: string;
  specialty: EngineerSpecialty;
  slotIndex: number;
}

interface MatchInput {
  users: User[];
  ideas: Idea[];
  rankings: Ranking[];
  swipes: { idea_id: string; user_id: string }[];
}

interface MatchOutput {
  user_id: string;
  idea_id: string;
}

const INFINITY_COST = 1000000;

/**
 * Core matching algorithm - pure function for testability
 * Takes pre-loaded data and returns match assignments
 */
export function computeMatches(
  input: MatchInput,
  randomFn: () => number = Math.random
): MatchOutput[] {
  const { users, ideas, rankings, swipes } = input;

  // Build ranking lookup: ideaId -> userId -> rank
  const rankingMap = new Map<string, Map<string, number>>();
  for (const r of rankings) {
    if (!rankingMap.has(r.idea_id)) {
      rankingMap.set(r.idea_id, new Map());
    }
    rankingMap.get(r.idea_id)!.set(r.user_id, r.rank);
  }

  // Build interested map from swipes
  const interestedMap = new Map<string, Set<string>>();
  for (const s of swipes) {
    if (!interestedMap.has(s.idea_id)) {
      interestedMap.set(s.idea_id, new Set());
    }
    interestedMap.get(s.idea_id)!.add(s.user_id);
  }

  // Run matching per specialty
  const matches: MatchOutput[] = [];
  const specialties: EngineerSpecialty[] = ['frontend', 'backend', 'infrastructure', 'ml'];

  for (const specialty of specialties) {
    const specialtyUsers = users.filter((u) => u.specialty === specialty);
    if (specialtyUsers.length === 0) continue;

    // Build slots for this specialty
    const slots: Slot[] = [];
    for (const idea of ideas) {
      const neededCount = getNeededCount(idea, specialty);
      for (let i = 0; i < neededCount; i++) {
        slots.push({ ideaId: idea.id, specialty, slotIndex: i });
      }
    }

    if (slots.length === 0) continue;

    // Build cost matrix
    const costMatrix: number[][] = [];
    for (const user of specialtyUsers) {
      const row: number[] = [];
      for (const slot of slots) {
        const interested = interestedMap.get(slot.ideaId)?.has(user.id) ?? false;
        if (!interested) {
          row.push(INFINITY_COST);
        } else {
          const rank = rankingMap.get(slot.ideaId)?.get(user.id);
          row.push(rank ?? INFINITY_COST - 1); // Interested but unranked gets high but not infinite cost
        }
      }
      costMatrix.push(row);
    }

    // Safety check - skip if matrix is empty
    if (costMatrix.length === 0 || costMatrix[0].length === 0) {
      continue;
    }

    // Pad matrix to be square if needed
    const size = Math.max(specialtyUsers.length, slots.length);
    while (costMatrix.length < size) {
      costMatrix.push(Array(size).fill(INFINITY_COST));
    }
    for (const row of costMatrix) {
      while (row.length < size) {
        row.push(INFINITY_COST);
      }
    }

    // Run Hungarian algorithm
    const assignments = munkres(costMatrix);

    // Process assignments
    for (const [userIdx, slotIdx] of assignments) {
      if (userIdx >= specialtyUsers.length) continue;
      if (slotIdx >= slots.length) continue;
      if (costMatrix[userIdx][slotIdx] >= INFINITY_COST) continue;

      const user = specialtyUsers[userIdx];
      const slot = slots[slotIdx];

      matches.push({
        user_id: user.id,
        idea_id: slot.ideaId,
      });
    }
  }

  // Find users who weren't assigned by the algorithm
  const assignedUserIds = new Set(matches.map((m) => m.user_id));
  const unassignedUsers = users.filter((u) => !assignedUserIds.has(u.id));

  // Randomly assign unassigned users to ideas they're interested in
  for (const user of unassignedUsers) {
    const interestedIdeaIds = Array.from(interestedMap.entries())
      .filter(([_, userIds]) => userIds.has(user.id))
      .map(([ideaId]) => ideaId);

    if (interestedIdeaIds.length > 0) {
      const randomIdeaId = interestedIdeaIds[Math.floor(randomFn() * interestedIdeaIds.length)];
      matches.push({
        user_id: user.id,
        idea_id: randomIdeaId,
      });
    }
    // Users with no interested ideas are left unassigned
  }

  return matches;
}

export function getNeededCount(idea: Idea, specialty: EngineerSpecialty): number {
  switch (specialty) {
    case 'frontend':
      return idea.needs_frontend;
    case 'backend':
      return idea.needs_backend;
    case 'infrastructure':
      return idea.needs_infrastructure;
    case 'ml':
      return idea.needs_ml;
  }
}

export async function runMatching(): Promise<Match[]> {
  const users = await getMatchableUsers();
  const ideas = await getIdeas();
  const rankings = await getAllRankings();
  const swipes = await query<{ idea_id: string; user_id: string }>(
    `SELECT idea_id, user_id FROM swipes WHERE interested = TRUE`
  );

  const matchOutputs = computeMatches({ users, ideas, rankings, swipes });

  // Clear existing matches and insert new ones
  await query(`DELETE FROM matches`);

  const matches: Match[] = [];
  for (const output of matchOutputs) {
    const result = await query<Match>(
      `INSERT INTO matches (user_id, idea_id) VALUES ($1, $2) RETURNING *`,
      [output.user_id, output.idea_id]
    );
    matches.push(result[0]);
  }

  return matches;
}

export async function getMatchResults(): Promise<MatchResult[]> {
  const ideas = await getIdeas();
  const matches = await query<Match>(`SELECT * FROM matches`);
  const users = await query<User>(`SELECT * FROM users`);

  const userMap = new Map(users.map((u) => [u.id, u]));
  const matchesByIdea = new Map<string, Match[]>();

  for (const match of matches) {
    if (!matchesByIdea.has(match.idea_id)) {
      matchesByIdea.set(match.idea_id, []);
    }
    matchesByIdea.get(match.idea_id)!.push(match);
  }

  return ideas.map((idea) => ({
    idea,
    team_members: (matchesByIdea.get(idea.id) || []).map((m) => {
      const user = userMap.get(m.user_id)!;
      return { id: user.id, name: user.name, specialty: user.specialty };
    }),
  }));
}

export async function getUserMatch(userId: string): Promise<Match | null> {
  return queryOne<Match>(`SELECT * FROM matches WHERE user_id = $1`, [userId]);
}

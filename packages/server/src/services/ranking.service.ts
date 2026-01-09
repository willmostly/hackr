import { query } from '../db/index.js';
import type { Ranking } from '@hackr/shared';

export async function saveRankings(
  ideaId: string,
  rankings: { user_id: string; rank: number }[]
): Promise<Ranking[]> {
  // Delete existing rankings for this idea
  await query(`DELETE FROM rankings WHERE idea_id = $1`, [ideaId]);

  if (rankings.length === 0) {
    return [];
  }

  // Insert new rankings
  const values = rankings
    .map((r, i) => `($1, $${i * 2 + 2}, $${i * 2 + 3})`)
    .join(', ');
  const params = [ideaId, ...rankings.flatMap((r) => [r.user_id, r.rank])];

  return query<Ranking>(
    `INSERT INTO rankings (idea_id, user_id, rank) VALUES ${values} RETURNING *`,
    params
  );
}

export async function getRankings(ideaId: string): Promise<Ranking[]> {
  return query<Ranking>(
    `SELECT * FROM rankings WHERE idea_id = $1 ORDER BY rank`,
    [ideaId]
  );
}

export async function getAllRankings(): Promise<Ranking[]> {
  return query<Ranking>(`SELECT * FROM rankings ORDER BY idea_id, rank`);
}

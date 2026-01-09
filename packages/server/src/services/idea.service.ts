import { query, queryOne } from '../db/index.js';
import type { Idea, CreateIdeaRequest, IdeaWithCreator, InterestedEngineer, User } from '@hackr/shared';

export async function createIdea(userId: string, data: CreateIdeaRequest): Promise<Idea> {
  const rows = await query<Idea>(
    `INSERT INTO ideas (created_by, title, description, needs_frontend, needs_backend, needs_infrastructure, needs_ml)
     VALUES ($1, $2, $3, $4, $5, $6, $7)
     RETURNING *`,
    [
      userId,
      data.title,
      data.description,
      data.needs_frontend,
      data.needs_backend,
      data.needs_infrastructure,
      data.needs_ml,
    ]
  );
  return rows[0];
}

export async function getIdeas(): Promise<IdeaWithCreator[]> {
  return query<IdeaWithCreator>(
    `SELECT i.*, json_build_object('id', u.id, 'name', u.name) as creator
     FROM ideas i
     JOIN users u ON i.created_by = u.id
     ORDER BY i.created_at DESC`
  );
}

export async function getIdeaById(id: string): Promise<IdeaWithCreator | null> {
  return queryOne<IdeaWithCreator>(
    `SELECT i.*, json_build_object('id', u.id, 'name', u.name) as creator
     FROM ideas i
     JOIN users u ON i.created_by = u.id
     WHERE i.id = $1`,
    [id]
  );
}

export async function getIdeasByCreator(userId: string): Promise<Idea[]> {
  return query<Idea>(`SELECT * FROM ideas WHERE created_by = $1 ORDER BY created_at DESC`, [userId]);
}

export async function getInterestedEngineers(ideaId: string): Promise<InterestedEngineer[]> {
  const rows = await query<{ user: User; rank: number | null }>(
    `SELECT
       json_build_object('id', u.id, 'name', u.name, 'specialty', u.specialty, 'bio', u.bio) as user,
       r.rank
     FROM swipes s
     JOIN users u ON s.user_id = u.id
     LEFT JOIN rankings r ON r.idea_id = s.idea_id AND r.user_id = s.user_id
     WHERE s.idea_id = $1 AND s.interested = TRUE
     ORDER BY r.rank NULLS LAST, u.name`,
    [ideaId]
  );
  return rows.map((r) => ({ user: r.user, rank: r.rank ?? undefined }));
}

export async function getUnswipedIdeas(userId: string): Promise<IdeaWithCreator[]> {
  return query<IdeaWithCreator>(
    `SELECT i.*, json_build_object('id', u.id, 'name', u.name) as creator
     FROM ideas i
     JOIN users u ON i.created_by = u.id
     WHERE i.id NOT IN (SELECT idea_id FROM swipes WHERE user_id = $1)
     ORDER BY i.created_at`,
    [userId]
  );
}

export interface IdeaWithSwipeCount extends IdeaWithCreator {
  swipe_count: number;
}

export async function getIdeasWithSwipeCounts(): Promise<IdeaWithSwipeCount[]> {
  return query<IdeaWithSwipeCount>(
    `SELECT i.*,
            json_build_object('id', u.id, 'name', u.name) as creator,
            COALESCE((SELECT COUNT(*) FROM swipes s WHERE s.idea_id = i.id AND s.interested = TRUE), 0)::int as swipe_count
     FROM ideas i
     JOIN users u ON i.created_by = u.id
     ORDER BY swipe_count DESC, i.created_at`
  );
}

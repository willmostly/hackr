import { query, queryOne } from '../db/index.js';
import type { Swipe } from '@hackr/shared';

export async function createSwipe(userId: string, ideaId: string, interested: boolean): Promise<Swipe> {
  const rows = await query<Swipe>(
    `INSERT INTO swipes (user_id, idea_id, interested)
     VALUES ($1, $2, $3)
     ON CONFLICT (user_id, idea_id) DO UPDATE SET interested = $3
     RETURNING *`,
    [userId, ideaId, interested]
  );
  return rows[0];
}

export async function getSwipesByUser(userId: string): Promise<Swipe[]> {
  return query<Swipe>(`SELECT * FROM swipes WHERE user_id = $1`, [userId]);
}

export async function getSwipeStats(userId: string): Promise<{ total: number; swiped: number }> {
  const totalResult = await queryOne<{ count: string }>(`SELECT COUNT(*) as count FROM ideas`);
  const swipedResult = await queryOne<{ count: string }>(
    `SELECT COUNT(*) as count FROM swipes WHERE user_id = $1`,
    [userId]
  );

  return {
    total: parseInt(totalResult?.count || '0'),
    swiped: parseInt(swipedResult?.count || '0'),
  };
}

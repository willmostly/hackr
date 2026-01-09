import { query, queryOne } from '../db/index.js';
import type { User, CreateUserRequest } from '@hackr/shared';

export async function createUser(email: string, data: CreateUserRequest): Promise<User> {
  const rows = await query<User>(
    `INSERT INTO users (email, name, role, specialty, bio)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING *`,
    [email.toLowerCase(), data.name, data.role, data.specialty || null, data.bio || null]
  );
  return rows[0];
}

export async function updateUser(
  id: string,
  data: Partial<Pick<User, 'name' | 'specialty' | 'bio'>>
): Promise<User | null> {
  const updates: string[] = [];
  const values: unknown[] = [];
  let paramCount = 1;

  if (data.name !== undefined) {
    updates.push(`name = $${paramCount++}`);
    values.push(data.name);
  }
  if (data.specialty !== undefined) {
    updates.push(`specialty = $${paramCount++}`);
    values.push(data.specialty);
  }
  if (data.bio !== undefined) {
    updates.push(`bio = $${paramCount++}`);
    values.push(data.bio);
  }

  if (updates.length === 0) {
    return queryOne<User>(`SELECT * FROM users WHERE id = $1`, [id]);
  }

  values.push(id);
  const rows = await query<User>(
    `UPDATE users SET ${updates.join(', ')} WHERE id = $${paramCount} RETURNING *`,
    values
  );
  return rows[0] || null;
}

export async function getUserById(id: string): Promise<User | null> {
  return queryOne<User>(`SELECT * FROM users WHERE id = $1`, [id]);
}

export async function getEngineers(): Promise<User[]> {
  return query<User>(`SELECT * FROM users WHERE role = 'engineer' ORDER BY name`);
}

// Get all users who can be matched to teams (engineers and team leads with specialties)
export async function getMatchableUsers(): Promise<User[]> {
  return query<User>(
    `SELECT * FROM users WHERE role IN ('engineer', 'team_lead') AND specialty IS NOT NULL ORDER BY name`
  );
}

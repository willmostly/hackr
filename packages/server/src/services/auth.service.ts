import crypto from 'crypto';
import { query, queryOne } from '../db/index.js';
import type { User } from '@hackr/shared';

interface MagicLink {
  id: string;
  token: string;
  email: string;
  used: boolean;
  expires_at: Date;
}

interface Session {
  id: string;
  user_id: string;
  token: string;
  expires_at: Date;
}

function generateToken(): string {
  return crypto.randomBytes(32).toString('hex');
}

export async function createMagicLink(email: string): Promise<string> {
  const token = generateToken();
  const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

  await query(
    `INSERT INTO magic_links (token, email, expires_at) VALUES ($1, $2, $3)`,
    [token, email.toLowerCase(), expiresAt]
  );

  return token;
}

export async function verifyMagicLink(token: string): Promise<{ email: string } | null> {
  const link = await queryOne<MagicLink>(
    `SELECT * FROM magic_links WHERE token = $1 AND used = FALSE AND expires_at > NOW()`,
    [token]
  );

  if (!link) {
    return null;
  }

  // Mark as used
  await query(`UPDATE magic_links SET used = TRUE WHERE id = $1`, [link.id]);

  return { email: link.email };
}

export async function createSession(userId: string): Promise<string> {
  const token = generateToken();
  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

  await query(
    `INSERT INTO sessions (user_id, token, expires_at) VALUES ($1, $2, $3)`,
    [userId, token, expiresAt]
  );

  return token;
}

export async function getUserFromSession(token: string): Promise<User | null> {
  const session = await queryOne<Session>(
    `SELECT * FROM sessions WHERE token = $1 AND expires_at > NOW()`,
    [token]
  );

  if (!session) {
    return null;
  }

  return queryOne<User>(`SELECT * FROM users WHERE id = $1`, [session.user_id]);
}

export async function deleteSession(token: string): Promise<void> {
  await query(`DELETE FROM sessions WHERE token = $1`, [token]);
}

export async function getUserByEmail(email: string): Promise<User | null> {
  return queryOne<User>(`SELECT * FROM users WHERE email = $1`, [email.toLowerCase()]);
}

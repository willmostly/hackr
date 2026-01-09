import { Request, Response, NextFunction } from 'express';
import { getUserFromSession } from '../services/auth.service.js';
import type { User, UserRole } from '@hackr/shared';

// Extend Express Request type
declare global {
  namespace Express {
    interface Request {
      user?: User;
    }
  }
}

export async function requireAuth(req: Request, res: Response, next: NextFunction) {
  const token = req.cookies?.session || req.headers.authorization?.replace('Bearer ', '');

  if (!token) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  const user = await getUserFromSession(token);
  if (!user) {
    return res.status(401).json({ error: 'Invalid or expired session' });
  }

  req.user = user;
  next();
}

export function requireRole(...roles: UserRole[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }

    next();
  };
}

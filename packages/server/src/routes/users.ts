import { Router } from 'express';
import { createUser, updateUser } from '../services/user.service.js';
import { createSession, verifyMagicLink } from '../services/auth.service.js';
import { requireAuth } from '../middleware/auth.js';
import type { CreateUserRequest } from '@hackr/shared';

const router = Router();

// Create new user profile (after magic link verification)
router.post('/', async (req, res) => {
  const { email, magicToken, ...profileData } = req.body as CreateUserRequest & {
    email?: string;
    magicToken?: string;
  };

  // Validate required fields
  if (!profileData.name || !profileData.role) {
    return res.status(400).json({ error: 'Name and role are required' });
  }

  if (!profileData.specialty) {
    return res.status(400).json({ error: 'Specialty is required' });
  }

  // Get email from magic token if provided
  let userEmail = email;
  if (magicToken) {
    const result = await verifyMagicLink(magicToken);
    if (result) {
      userEmail = result.email;
    }
  }

  if (!userEmail) {
    return res.status(400).json({ error: 'Email is required' });
  }

  try {
    const user = await createUser(userEmail, profileData);
    const sessionToken = await createSession(user.id);

    res.cookie('session', sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 24 * 60 * 60 * 1000,
    });

    res.status(201).json({ user });
  } catch (error) {
    if (error instanceof Error && error.message.includes('duplicate key')) {
      return res.status(400).json({ error: 'User with this email already exists' });
    }
    throw error;
  }
});

// Update current user profile
router.put('/me', requireAuth, async (req, res) => {
  const { name, specialty, bio } = req.body;

  const user = await updateUser(req.user!.id, { name, specialty, bio });
  res.json({ user });
});

export default router;

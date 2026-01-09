import { Router } from 'express';
import {
  createMagicLink,
  verifyMagicLink,
  createSession,
  deleteSession,
  getUserByEmail,
} from '../services/auth.service.js';
import { getPhase } from '../services/settings.service.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

// Request magic link
router.post('/magic-link', async (req, res) => {
  const { email } = req.body;

  if (!email || typeof email !== 'string') {
    return res.status(400).json({ error: 'Email is required' });
  }

  const token = await createMagicLink(email);

  // In production, send email. For now, return the link directly.
  const link = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/auth/verify/${token}`;

  res.json({
    message: 'Magic link created',
    // Remove this in production - only for development
    link,
  });
});

// Verify magic link and create session
router.get('/verify/:token', async (req, res) => {
  const { token } = req.params;

  const result = await verifyMagicLink(token);
  if (!result) {
    return res.status(400).json({ error: 'Invalid or expired magic link' });
  }

  // Check if user exists
  const user = await getUserByEmail(result.email);

  if (user) {
    // Existing user - create session
    const sessionToken = await createSession(user.id);
    res.cookie('session', sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
    });
    return res.json({ user, needsProfile: false });
  }

  // New user - they need to create a profile
  // Return email so frontend can include it in profile creation
  res.json({ email: result.email, needsProfile: true });
});

// Get current user and app phase
router.get('/me', requireAuth, async (req, res) => {
  const phase = await getPhase();
  res.json({ user: req.user, phase });
});

// Logout
router.post('/logout', requireAuth, async (req, res) => {
  const token = req.cookies?.session || req.headers.authorization?.replace('Bearer ', '');
  if (token) {
    await deleteSession(token);
  }
  res.clearCookie('session');
  res.json({ message: 'Logged out' });
});

export default router;

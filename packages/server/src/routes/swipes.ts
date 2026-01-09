import { Router } from 'express';
import { createSwipe, getSwipesByUser, getSwipeStats } from '../services/swipe.service.js';
import { requireAuth, requireRole } from '../middleware/auth.js';
import { getPhase } from '../services/settings.service.js';

const router = Router();

// Get swipe stats for current user
router.get('/stats', requireAuth, requireRole('engineer', 'team_lead'), async (req, res) => {
  const stats = await getSwipeStats(req.user!.id);
  res.json(stats);
});

// Get all swipes by current user
router.get('/mine', requireAuth, requireRole('engineer', 'team_lead'), async (req, res) => {
  const swipes = await getSwipesByUser(req.user!.id);
  res.json({ swipes });
});

// Create a swipe
router.post('/', requireAuth, requireRole('engineer', 'team_lead'), async (req, res) => {
  // Check if in swiping phase
  const phase = await getPhase();
  if (phase !== 'swiping') {
    return res.status(400).json({ error: 'Swiping is not currently open' });
  }

  const { idea_id, interested } = req.body;

  if (!idea_id || typeof interested !== 'boolean') {
    return res.status(400).json({ error: 'idea_id and interested (boolean) are required' });
  }

  const swipe = await createSwipe(req.user!.id, idea_id, interested);
  res.status(201).json({ swipe });
});

export default router;

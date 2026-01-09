import { Router } from 'express';
import { getPhase, advancePhase, setPhase } from '../services/settings.service.js';
import { runMatching, getMatchResults } from '../services/matching.service.js';
import { getIdeasWithSwipeCounts } from '../services/idea.service.js';
import { requireAuth, requireRole } from '../middleware/auth.js';
import type { AppPhase } from '@hackr/shared';

const router = Router();

// Get current phase
router.get('/phase', requireAuth, async (req, res) => {
  const phase = await getPhase();
  res.json({ phase });
});

// Advance to next phase (admin only)
router.post('/phase/advance', requireAuth, requireRole('admin'), async (req, res) => {
  const phase = await advancePhase();
  res.json({ phase });
});

// Set specific phase (admin only)
router.post('/phase', requireAuth, requireRole('admin'), async (req, res) => {
  const { phase } = req.body as { phase: AppPhase };

  const validPhases: AppPhase[] = ['registration', 'swiping', 'ranking', 'matching', 'complete'];
  if (!validPhases.includes(phase)) {
    return res.status(400).json({ error: 'Invalid phase' });
  }

  await setPhase(phase);
  res.json({ phase });
});

// Run matching algorithm (admin only)
router.post('/match', requireAuth, requireRole('admin'), async (req, res) => {
  const currentPhase = await getPhase();

  if (currentPhase !== 'matching') {
    return res.status(400).json({ error: 'Must be in matching phase to run matching' });
  }

  const matches = await runMatching();

  // Advance to complete phase
  await setPhase('complete');

  res.json({ matches, count: matches.length });
});

// Get match results
router.get('/results', requireAuth, async (req, res) => {
  const results = await getMatchResults();
  res.json({ results });
});

// Get ideas ranked by swipe count (for selecting top N)
router.get('/ideas/ranked', requireAuth, requireRole('admin'), async (req, res) => {
  const ideas = await getIdeasWithSwipeCounts();
  res.json({ ideas });
});

export default router;

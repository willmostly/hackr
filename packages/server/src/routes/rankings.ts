import { Router } from 'express';
import { saveRankings, getRankings } from '../services/ranking.service.js';
import { getIdeaById } from '../services/idea.service.js';
import { requireAuth, requireRole } from '../middleware/auth.js';
import { getPhase } from '../services/settings.service.js';

const router = Router();

// Get rankings for an idea
router.get('/:ideaId', requireAuth, requireRole('team_lead', 'admin'), async (req, res) => {
  const idea = await getIdeaById(req.params.ideaId);
  if (!idea) {
    return res.status(404).json({ error: 'Idea not found' });
  }

  // Only allow the idea creator or admin
  if (req.user!.role !== 'admin' && idea.created_by !== req.user!.id) {
    return res.status(403).json({ error: 'Not authorized' });
  }

  const rankings = await getRankings(req.params.ideaId);
  res.json({ rankings });
});

// Save rankings for an idea
router.post('/', requireAuth, requireRole('team_lead'), async (req, res) => {
  // Check if in ranking phase
  const phase = await getPhase();
  if (phase !== 'ranking') {
    return res.status(400).json({ error: 'Ranking is not currently open' });
  }

  const { idea_id, rankings } = req.body;

  if (!idea_id || !Array.isArray(rankings)) {
    return res.status(400).json({ error: 'idea_id and rankings array are required' });
  }

  const idea = await getIdeaById(idea_id);
  if (!idea) {
    return res.status(404).json({ error: 'Idea not found' });
  }

  // Only allow the idea creator
  if (idea.created_by !== req.user!.id) {
    return res.status(403).json({ error: 'Not authorized' });
  }

  // Validate rankings format
  for (const r of rankings) {
    if (!r.user_id || typeof r.rank !== 'number') {
      return res.status(400).json({ error: 'Each ranking must have user_id and rank' });
    }
  }

  const savedRankings = await saveRankings(idea_id, rankings);
  res.json({ rankings: savedRankings });
});

export default router;

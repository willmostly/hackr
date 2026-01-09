import { Router } from 'express';
import { createIdea, getIdeas, getIdeaById, getIdeasByCreator, getInterestedEngineers, getUnswipedIdeas } from '../services/idea.service.js';
import { requireAuth, requireRole } from '../middleware/auth.js';
import type { CreateIdeaRequest } from '@hackr/shared';

const router = Router();

// Get all ideas
router.get('/', requireAuth, async (req, res) => {
  const ideas = await getIdeas();
  res.json({ ideas });
});

// Get ideas created by current user (for team leads)
router.get('/mine', requireAuth, requireRole('team_lead'), async (req, res) => {
  const ideas = await getIdeasByCreator(req.user!.id);
  res.json({ ideas });
});

// Get unswiped ideas for current user (for swiping)
router.get('/unswiped', requireAuth, requireRole('engineer', 'team_lead'), async (req, res) => {
  const ideas = await getUnswipedIdeas(req.user!.id);
  res.json({ ideas });
});

// Get single idea
router.get('/:id', requireAuth, async (req, res) => {
  const idea = await getIdeaById(req.params.id);
  if (!idea) {
    return res.status(404).json({ error: 'Idea not found' });
  }
  res.json({ idea });
});

// Get interested engineers for an idea (team lead only)
router.get('/:id/interested', requireAuth, requireRole('team_lead', 'admin'), async (req, res) => {
  const idea = await getIdeaById(req.params.id);
  if (!idea) {
    return res.status(404).json({ error: 'Idea not found' });
  }

  // Only allow the idea creator or admin to see interested engineers
  if (req.user!.role !== 'admin' && idea.created_by !== req.user!.id) {
    return res.status(403).json({ error: 'Not authorized' });
  }

  const engineers = await getInterestedEngineers(req.params.id);
  res.json({ engineers });
});

// Create new idea
router.post('/', requireAuth, requireRole('team_lead'), async (req, res) => {
  const data = req.body as CreateIdeaRequest;

  if (!data.title || !data.description) {
    return res.status(400).json({ error: 'Title and description are required' });
  }

  const totalSlots =
    (data.needs_frontend || 0) +
    (data.needs_backend || 0) +
    (data.needs_infrastructure || 0) +
    (data.needs_ml || 0);

  if (totalSlots === 0) {
    return res.status(400).json({ error: 'Idea must need at least one team member' });
  }

  const idea = await createIdea(req.user!.id, {
    title: data.title,
    description: data.description,
    needs_frontend: data.needs_frontend || 0,
    needs_backend: data.needs_backend || 0,
    needs_infrastructure: data.needs_infrastructure || 0,
    needs_ml: data.needs_ml || 0,
  });

  res.status(201).json({ idea });
});

export default router;

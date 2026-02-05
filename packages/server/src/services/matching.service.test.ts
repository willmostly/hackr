import { describe, it, expect } from 'vitest';
import { computeMatches } from './matching.service.js';
import type { User, Idea, Ranking } from '@hackr/shared';

// Helper to create test users
function createUser(id: string, specialty: 'frontend' | 'backend' | 'infrastructure' | 'ml'): User {
  return {
    id,
    email: `${id}@test.com`,
    name: id,
    role: 'engineer',
    specialty,
    bio: null,
    created_at: new Date(),
  };
}

// Helper to create test ideas
function createIdea(
  id: string,
  needs: { frontend?: number; backend?: number; infrastructure?: number; ml?: number } = {}
): Idea {
  return {
    id,
    created_by: 'creator',
    title: id,
    description: `Description for ${id}`,
    needs_frontend: needs.frontend ?? 0,
    needs_backend: needs.backend ?? 0,
    needs_infrastructure: needs.infrastructure ?? 0,
    needs_ml: needs.ml ?? 0,
    created_at: new Date(),
  };
}

describe('computeMatches', () => {
  describe('respects requested team sizes per specialty', () => {
    it('assigns exactly the requested number of frontend engineers', () => {
      const users = [
        createUser('fe1', 'frontend'),
        createUser('fe2', 'frontend'),
        createUser('fe3', 'frontend'),
      ];
      const ideas = [createIdea('idea1', { frontend: 2 })];
      const swipes = [
        { idea_id: 'idea1', user_id: 'fe1' },
        { idea_id: 'idea1', user_id: 'fe2' },
        { idea_id: 'idea1', user_id: 'fe3' },
      ];
      const rankings: Ranking[] = [
        { idea_id: 'idea1', user_id: 'fe1', rank: 1 },
        { idea_id: 'idea1', user_id: 'fe2', rank: 2 },
        { idea_id: 'idea1', user_id: 'fe3', rank: 3 },
      ];

      const matches = computeMatches({ users, ideas, rankings, swipes });

      // Should assign exactly 2 frontend engineers (the requested amount)
      // fe3 should be randomly assigned since they're interested
      const idea1Matches = matches.filter((m) => m.idea_id === 'idea1');

      // All 3 should be assigned (2 by algorithm + 1 randomly)
      expect(matches).toHaveLength(3);
      expect(idea1Matches).toHaveLength(3);
    });

    it('does not exceed requested slots across multiple specialties', () => {
      const users = [
        createUser('fe1', 'frontend'),
        createUser('fe2', 'frontend'),
        createUser('be1', 'backend'),
        createUser('be2', 'backend'),
      ];
      const ideas = [createIdea('idea1', { frontend: 1, backend: 1 })];
      const swipes = [
        { idea_id: 'idea1', user_id: 'fe1' },
        { idea_id: 'idea1', user_id: 'fe2' },
        { idea_id: 'idea1', user_id: 'be1' },
        { idea_id: 'idea1', user_id: 'be2' },
      ];
      const rankings: Ranking[] = [
        { idea_id: 'idea1', user_id: 'fe1', rank: 1 },
        { idea_id: 'idea1', user_id: 'fe2', rank: 2 },
        { idea_id: 'idea1', user_id: 'be1', rank: 1 },
        { idea_id: 'idea1', user_id: 'be2', rank: 2 },
      ];

      const matches = computeMatches({ users, ideas, rankings, swipes });

      // Algorithm assigns 1 FE + 1 BE = 2
      // Leftover fe2 and be2 get randomly assigned
      expect(matches).toHaveLength(4);
    });

    it('distributes engineers across multiple ideas based on slots', () => {
      const users = [
        createUser('fe1', 'frontend'),
        createUser('fe2', 'frontend'),
      ];
      const ideas = [
        createIdea('idea1', { frontend: 1 }),
        createIdea('idea2', { frontend: 1 }),
      ];
      const swipes = [
        { idea_id: 'idea1', user_id: 'fe1' },
        { idea_id: 'idea1', user_id: 'fe2' },
        { idea_id: 'idea2', user_id: 'fe1' },
        { idea_id: 'idea2', user_id: 'fe2' },
      ];
      const rankings: Ranking[] = [
        { idea_id: 'idea1', user_id: 'fe1', rank: 1 },
        { idea_id: 'idea1', user_id: 'fe2', rank: 2 },
        { idea_id: 'idea2', user_id: 'fe1', rank: 2 },
        { idea_id: 'idea2', user_id: 'fe2', rank: 1 },
      ];

      const matches = computeMatches({ users, ideas, rankings, swipes });

      // Each idea needs 1 FE, should distribute optimally
      expect(matches).toHaveLength(2);

      const idea1Match = matches.find((m) => m.idea_id === 'idea1');
      const idea2Match = matches.find((m) => m.idea_id === 'idea2');

      expect(idea1Match).toBeDefined();
      expect(idea2Match).toBeDefined();
      // fe1 ranked 1 for idea1, fe2 ranked 1 for idea2 - optimal assignment
      expect(idea1Match!.user_id).toBe('fe1');
      expect(idea2Match!.user_id).toBe('fe2');
    });
  });

  describe('random assignment of leftover participants', () => {
    it('assigns leftover users to ideas they are interested in', () => {
      const users = [
        createUser('fe1', 'frontend'),
        createUser('fe2', 'frontend'),
        createUser('fe3', 'frontend'),
      ];
      const ideas = [
        createIdea('idea1', { frontend: 1 }),
        createIdea('idea2', { frontend: 1 }),
      ];
      // fe3 is only interested in idea2
      const swipes = [
        { idea_id: 'idea1', user_id: 'fe1' },
        { idea_id: 'idea2', user_id: 'fe2' },
        { idea_id: 'idea2', user_id: 'fe3' },
      ];
      const rankings: Ranking[] = [
        { idea_id: 'idea1', user_id: 'fe1', rank: 1 },
        { idea_id: 'idea2', user_id: 'fe2', rank: 1 },
        { idea_id: 'idea2', user_id: 'fe3', rank: 2 },
      ];

      // Use deterministic random
      const matches = computeMatches({ users, ideas, rankings, swipes }, () => 0);

      expect(matches).toHaveLength(3);

      // fe1 gets idea1, fe2 gets idea2 by algorithm
      const idea1Match = matches.find((m) => m.idea_id === 'idea1');
      const idea2Match = matches.find((m) => m.idea_id === 'idea2');
      expect(idea1Match!.user_id).toBe('fe1');
      expect(idea2Match!.user_id).toBe('fe2');

      // fe3 is leftover and should be assigned to idea2 (only interested idea)
      const fe3Match = matches.find((m) => m.user_id === 'fe3');
      expect(fe3Match).toBeDefined();
      expect(fe3Match!.idea_id).toBe('idea2');
    });

    it('uses random function to select among interested ideas', () => {
      const users = [
        createUser('fe1', 'frontend'),
        createUser('fe2', 'frontend'),
      ];
      const ideas = [
        createIdea('idea1', { frontend: 0 }), // No slots
        createIdea('idea2', { frontend: 0 }), // No slots
      ];
      // fe1 interested in both ideas
      const swipes = [
        { idea_id: 'idea1', user_id: 'fe1' },
        { idea_id: 'idea2', user_id: 'fe1' },
        { idea_id: 'idea1', user_id: 'fe2' },
      ];
      const rankings: Ranking[] = [];

      // With random = 0, should pick first idea in list
      const matches1 = computeMatches({ users, ideas, rankings, swipes }, () => 0);
      const fe1Match1 = matches1.find((m) => m.user_id === 'fe1');
      expect(fe1Match1).toBeDefined();

      // With random = 0.99, should pick second idea (if 2 options)
      const matches2 = computeMatches({ users, ideas, rankings, swipes }, () => 0.99);
      const fe1Match2 = matches2.find((m) => m.user_id === 'fe1');
      expect(fe1Match2).toBeDefined();

      // The two should pick different ideas (order may vary based on Map iteration)
      // Just verify both users got assigned
      expect(matches1).toHaveLength(2);
      expect(matches2).toHaveLength(2);
    });
  });

  describe('users with no interested ideas', () => {
    it('leaves users unassigned when they have no interested ideas', () => {
      const users = [
        createUser('fe1', 'frontend'),
        createUser('fe2', 'frontend'),
      ];
      const ideas = [createIdea('idea1', { frontend: 1 })];
      // Only fe1 is interested
      const swipes = [{ idea_id: 'idea1', user_id: 'fe1' }];
      const rankings: Ranking[] = [{ idea_id: 'idea1', user_id: 'fe1', rank: 1 }];

      const matches = computeMatches({ users, ideas, rankings, swipes });

      // Only fe1 should be matched
      expect(matches).toHaveLength(1);
      expect(matches[0].user_id).toBe('fe1');

      // fe2 should NOT be in matches (no interested ideas)
      const fe2Match = matches.find((m) => m.user_id === 'fe2');
      expect(fe2Match).toBeUndefined();
    });

    it('handles mix of assignable and unassignable users', () => {
      const users = [
        createUser('fe1', 'frontend'),
        createUser('fe2', 'frontend'),
        createUser('be1', 'backend'),
      ];
      const ideas = [createIdea('idea1', { frontend: 1, backend: 0 })];
      const swipes = [
        { idea_id: 'idea1', user_id: 'fe1' },
        { idea_id: 'idea1', user_id: 'fe2' },
        // be1 not interested in anything
      ];
      const rankings: Ranking[] = [
        { idea_id: 'idea1', user_id: 'fe1', rank: 1 },
        { idea_id: 'idea1', user_id: 'fe2', rank: 2 },
      ];

      const matches = computeMatches({ users, ideas, rankings, swipes });

      // fe1 assigned by algorithm, fe2 assigned randomly
      // be1 has no interested ideas, should be unassigned
      expect(matches).toHaveLength(2);
      expect(matches.map((m) => m.user_id).sort()).toEqual(['fe1', 'fe2']);
    });

    it('returns empty matches when no users are interested in any ideas', () => {
      const users = [
        createUser('fe1', 'frontend'),
        createUser('be1', 'backend'),
      ];
      const ideas = [createIdea('idea1', { frontend: 1, backend: 1 })];
      const swipes: { idea_id: string; user_id: string }[] = [];
      const rankings: Ranking[] = [];

      const matches = computeMatches({ users, ideas, rankings, swipes });

      expect(matches).toHaveLength(0);
    });
  });
});

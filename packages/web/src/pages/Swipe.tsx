import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { SwipeableStack } from '../components/SwipeableStack';
import { getUnswipedIdeas, createSwipe, getSwipeStats } from '../api/client';
import { useAuth } from '../hooks/useAuth';
import type { IdeaWithCreator } from '@hackr/shared';

export function SwipePage() {
  const navigate = useNavigate();
  const { phase } = useAuth();
  const [ideas, setIdeas] = useState<IdeaWithCreator[]>([]);
  const [stats, setStats] = useState({ total: 0, swiped: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (phase !== 'swiping') {
      navigate('/');
      return;
    }

    Promise.all([getUnswipedIdeas(), getSwipeStats()])
      .then(([ideasResult, statsResult]) => {
        setIdeas(ideasResult.ideas);
        setStats(statsResult);
      })
      .finally(() => setLoading(false));
  }, [phase, navigate]);

  const handleSwipe = async (idea: IdeaWithCreator, interested: boolean) => {
    try {
      await createSwipe(idea.id, interested);
      setStats((s) => ({ ...s, swiped: s.swiped + 1 }));
    } catch (err) {
      console.error('Failed to save swipe:', err);
    }
  };

  if (loading) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Loading ideas...</p>
      </div>
    );
  }

  return (
    <div>
      <div className="text-center mb-6">
        <p className="text-sm text-gray-500">
          {stats.swiped} of {stats.total} ideas reviewed
        </p>
        <div className="w-full bg-gray-200 rounded-full h-2 mt-2 max-w-md mx-auto">
          <div
            className="bg-primary-500 h-2 rounded-full transition-all"
            style={{ width: `${stats.total ? (stats.swiped / stats.total) * 100 : 0}%` }}
          />
        </div>
      </div>

      <SwipeableStack ideas={ideas} onSwipe={handleSwipe} />

      <p className="text-center text-sm text-gray-500 mt-6">
        Swipe right to show interest, left to pass
      </p>
    </div>
  );
}

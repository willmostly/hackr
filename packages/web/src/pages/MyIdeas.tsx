import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getMyIdeas } from '../api/client';
import type { Idea } from '@hackr/shared';

export function MyIdeasPage() {
  const [ideas, setIdeas] = useState<Idea[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getMyIdeas()
      .then((result) => setIdeas(result.ideas))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Loading...</p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">My Ideas</h1>
        <Link to="/ideas/new" className="btn btn-primary">
          Create New
        </Link>
      </div>

      {ideas.length === 0 ? (
        <div className="card text-center py-8">
          <p className="text-gray-500 mb-4">You haven't created any ideas yet.</p>
          <Link to="/ideas/new" className="btn btn-primary">
            Create Your First Idea
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {ideas.map((idea) => (
            <IdeaCard key={idea.id} idea={idea} />
          ))}
        </div>
      )}
    </div>
  );
}

function IdeaCard({ idea }: { idea: Idea }) {
  const roleNeeds = [
    { label: 'Frontend', count: idea.needs_frontend },
    { label: 'Backend', count: idea.needs_backend },
    { label: 'Infra', count: idea.needs_infrastructure },
    { label: 'ML', count: idea.needs_ml },
  ].filter((r) => r.count > 0);

  return (
    <div className="card">
      <h3 className="text-xl font-semibold mb-2">{idea.title}</h3>
      <p className="text-gray-600 mb-4 line-clamp-2">{idea.description}</p>

      <div className="flex flex-wrap gap-2">
        {roleNeeds.map((role) => (
          <span key={role.label} className="px-3 py-1 bg-gray-100 rounded-full text-sm">
            {role.count}× {role.label}
          </span>
        ))}
      </div>
    </div>
  );
}

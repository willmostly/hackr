import { useState, useEffect } from 'react';
import { getIdeas } from '../api/client';
import type { IdeaWithCreator } from '@hackr/shared';

export function IdeasPage() {
  const [ideas, setIdeas] = useState<IdeaWithCreator[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getIdeas()
      .then((result) => setIdeas(result.ideas))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Loading ideas...</p>
      </div>
    );
  }

  if (ideas.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">No ideas have been submitted yet.</p>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">All Ideas</h1>
      <div className="space-y-4">
        {ideas.map((idea) => (
          <IdeaCard key={idea.id} idea={idea} />
        ))}
      </div>
    </div>
  );
}

function IdeaCard({ idea }: { idea: IdeaWithCreator }) {
  const roleNeeds = [
    { label: 'Frontend', count: idea.needs_frontend },
    { label: 'Backend', count: idea.needs_backend },
    { label: 'Infra', count: idea.needs_infrastructure },
    { label: 'ML', count: idea.needs_ml },
  ].filter((r) => r.count > 0);

  return (
    <div className="card">
      <h3 className="text-xl font-semibold mb-1">{idea.title}</h3>
      <p className="text-sm text-gray-500 mb-3">by {idea.creator.name}</p>
      <p className="text-gray-600 mb-4">{idea.description}</p>
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

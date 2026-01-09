import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getMyIdeas, getInterestedEngineers, saveRankings } from '../api/client';
import { useAuth } from '../hooks/useAuth';
import type { Idea, InterestedEngineer } from '@hackr/shared';

export function RankPage() {
  const navigate = useNavigate();
  const { phase } = useAuth();
  const [ideas, setIdeas] = useState<Idea[]>([]);
  const [selectedIdea, setSelectedIdea] = useState<Idea | null>(null);
  const [engineers, setEngineers] = useState<InterestedEngineer[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (phase !== 'ranking') {
      navigate('/');
      return;
    }

    getMyIdeas()
      .then((result) => {
        setIdeas(result.ideas);
        if (result.ideas.length > 0) {
          setSelectedIdea(result.ideas[0]);
        }
      })
      .finally(() => setLoading(false));
  }, [phase, navigate]);

  useEffect(() => {
    if (!selectedIdea) return;

    setLoading(true);
    getInterestedEngineers(selectedIdea.id)
      .then((result) => setEngineers(result.engineers))
      .finally(() => setLoading(false));
  }, [selectedIdea]);

  const moveEngineer = (fromIndex: number, toIndex: number) => {
    const newEngineers = [...engineers];
    const [removed] = newEngineers.splice(fromIndex, 1);
    newEngineers.splice(toIndex, 0, removed);
    setEngineers(newEngineers);
  };

  const handleSave = async () => {
    if (!selectedIdea) return;

    setSaving(true);
    try {
      await saveRankings(
        selectedIdea.id,
        engineers.map((e, i) => ({ user_id: e.user.id, rank: i + 1 }))
      );
      alert('Rankings saved!');
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  if (loading && !selectedIdea) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Loading...</p>
      </div>
    );
  }

  if (ideas.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">You don't have any ideas to rank engineers for.</p>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Rank Interested Engineers</h1>

      {/* Idea selector */}
      {ideas.length > 1 && (
        <div className="mb-6">
          <label className="label">Select Idea</label>
          <select
            value={selectedIdea?.id}
            onChange={(e) => setSelectedIdea(ideas.find((i) => i.id === e.target.value) || null)}
            className="input max-w-md"
          >
            {ideas.map((idea) => (
              <option key={idea.id} value={idea.id}>
                {idea.title}
              </option>
            ))}
          </select>
        </div>
      )}

      {selectedIdea && (
        <div className="card mb-6">
          <h2 className="font-semibold">{selectedIdea.title}</h2>
          <p className="text-sm text-gray-500">{selectedIdea.description}</p>
        </div>
      )}

      {engineers.length === 0 ? (
        <div className="text-center py-8 card">
          <p className="text-gray-500">No engineers have shown interest in this idea yet.</p>
        </div>
      ) : (
        <>
          <p className="text-sm text-gray-500 mb-4">
            Drag to reorder. #1 is your top choice.
          </p>

          <div className="space-y-2 mb-6">
            {engineers.map((eng, index) => (
              <div
                key={eng.user.id}
                className="card flex items-center gap-4 cursor-move"
              >
                <span className="text-2xl font-bold text-gray-300 w-8">
                  {index + 1}
                </span>
                <div className="flex-grow">
                  <p className="font-medium">{eng.user.name}</p>
                  <p className="text-sm text-gray-500">
                    {eng.user.specialty} {eng.user.bio && `• ${eng.user.bio}`}
                  </p>
                </div>
                <div className="flex gap-1">
                  <button
                    onClick={() => index > 0 && moveEngineer(index, index - 1)}
                    disabled={index === 0}
                    className="p-2 text-gray-400 hover:text-gray-600 disabled:opacity-30"
                  >
                    ▲
                  </button>
                  <button
                    onClick={() => index < engineers.length - 1 && moveEngineer(index, index + 1)}
                    disabled={index === engineers.length - 1}
                    className="p-2 text-gray-400 hover:text-gray-600 disabled:opacity-30"
                  >
                    ▼
                  </button>
                </div>
              </div>
            ))}
          </div>

          <button onClick={handleSave} className="btn btn-primary" disabled={saving}>
            {saving ? 'Saving...' : 'Save Rankings'}
          </button>
        </>
      )}
    </div>
  );
}

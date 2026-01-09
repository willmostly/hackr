import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createIdea } from '../api/client';

export function CreateIdeaPage() {
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [needsFrontend, setNeedsFrontend] = useState(0);
  const [needsBackend, setNeedsBackend] = useState(0);
  const [needsInfra, setNeedsInfra] = useState(0);
  const [needsMl, setNeedsMl] = useState(0);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const totalNeeded = needsFrontend + needsBackend + needsInfra + needsMl;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (totalNeeded === 0) {
      setError('You must need at least one team member');
      return;
    }

    setLoading(true);
    try {
      await createIdea({
        title,
        description,
        needs_frontend: needsFrontend,
        needs_backend: needsBackend,
        needs_infrastructure: needsInfra,
        needs_ml: needsMl,
      });
      navigate('/ideas/mine');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create idea');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Create Your Idea</h1>

      <form onSubmit={handleSubmit} className="card">
        <div className="mb-4">
          <label className="label">Project Title</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="input"
            placeholder="An amazing hackathon project"
            required
          />
        </div>

        <div className="mb-6">
          <label className="label">Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="input min-h-[120px]"
            placeholder="Describe your project idea, what problem it solves, and what makes it exciting..."
            required
          />
        </div>

        <div className="mb-6">
          <label className="label">Team Requirements</label>
          <p className="text-sm text-gray-500 mb-4">
            How many of each role do you need? (Total: {totalNeeded})
          </p>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm text-gray-600">Frontend Engineers</label>
              <input
                type="number"
                min="0"
                max="10"
                value={needsFrontend}
                onChange={(e) => setNeedsFrontend(parseInt(e.target.value) || 0)}
                className="input"
              />
            </div>
            <div>
              <label className="text-sm text-gray-600">Backend Engineers</label>
              <input
                type="number"
                min="0"
                max="10"
                value={needsBackend}
                onChange={(e) => setNeedsBackend(parseInt(e.target.value) || 0)}
                className="input"
              />
            </div>
            <div>
              <label className="text-sm text-gray-600">Infrastructure Engineers</label>
              <input
                type="number"
                min="0"
                max="10"
                value={needsInfra}
                onChange={(e) => setNeedsInfra(parseInt(e.target.value) || 0)}
                className="input"
              />
            </div>
            <div>
              <label className="text-sm text-gray-600">ML Engineers</label>
              <input
                type="number"
                min="0"
                max="10"
                value={needsMl}
                onChange={(e) => setNeedsMl(parseInt(e.target.value) || 0)}
                className="input"
              />
            </div>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-danger-50 text-danger-700 rounded-lg text-sm">
            {error}
          </div>
        )}

        <button type="submit" className="btn btn-primary w-full" disabled={loading}>
          {loading ? 'Creating...' : 'Create Idea'}
        </button>
      </form>
    </div>
  );
}

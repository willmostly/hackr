import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { createUser } from '../api/client';
import { useAuth } from '../hooks/useAuth';
import type { UserRole, EngineerSpecialty } from '@hackr/shared';

export function RegisterPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { setUser, refresh } = useAuth();

  const email = (location.state as { email?: string })?.email || '';

  const [name, setName] = useState('');
  const [role, setRole] = useState<UserRole>('engineer');
  const [specialty, setSpecialty] = useState<EngineerSpecialty>('frontend');
  const [bio, setBio] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (!email) {
    navigate('/login');
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const result = await createUser({
        email,
        name,
        role,
        specialty,
        bio: bio || undefined,
      });
      setUser(result.user);
      refresh();
      navigate('/');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create account');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto">
      <div className="card">
        <h1 className="text-2xl font-bold mb-2">Create Your Profile</h1>
        <p className="text-gray-600 mb-6">Welcome! Tell us about yourself.</p>

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="label">Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="input"
              placeholder="Your name"
              required
            />
          </div>

          <div className="mb-4">
            <label className="label">I am a...</label>
            <div className="flex gap-4">
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  name="role"
                  value="engineer"
                  checked={role === 'engineer'}
                  onChange={() => setRole('engineer')}
                />
                <span>Engineer</span>
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  name="role"
                  value="team_lead"
                  checked={role === 'team_lead'}
                  onChange={() => setRole('team_lead')}
                />
                <span>Team Lead</span>
              </label>
            </div>
          </div>

          <div className="mb-4">
            <label className="label">Specialty</label>
            <select
              value={specialty}
              onChange={(e) => setSpecialty(e.target.value as EngineerSpecialty)}
              className="input"
            >
              <option value="frontend">Frontend</option>
              <option value="backend">Backend</option>
              <option value="infrastructure">Infrastructure</option>
              <option value="ml">Machine Learning</option>
            </select>
          </div>

          <div className="mb-6">
            <label className="label">Bio (optional)</label>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              className="input min-h-[80px]"
              placeholder="Tell us about your skills and interests..."
            />
          </div>

          {error && (
            <div className="mb-4 p-3 bg-danger-50 text-danger-700 rounded-lg text-sm">
              {error}
            </div>
          )}

          <button type="submit" className="btn btn-primary w-full" disabled={loading}>
            {loading ? 'Creating...' : 'Create Profile'}
          </button>
        </form>
      </div>
    </div>
  );
}

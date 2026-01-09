import { useState } from 'react';
import { requestMagicLink } from '../api/client';

export function LoginPage() {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [magicLink, setMagicLink] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const result = await requestMagicLink(email);
      setSent(true);
      // Dev mode: show the link directly
      if (result.link) {
        setMagicLink(result.link);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send magic link');
    } finally {
      setLoading(false);
    }
  };

  if (sent) {
    return (
      <div className="max-w-md mx-auto">
        <div className="card text-center">
          <h1 className="text-2xl font-bold mb-4">Check your email!</h1>
          <p className="text-gray-600 mb-4">
            We sent a magic link to <strong>{email}</strong>
          </p>

          {magicLink && (
            <div className="mt-6 p-4 bg-yellow-50 rounded-lg">
              <p className="text-sm text-yellow-800 mb-2">Dev mode: Click the link below</p>
              <a href={magicLink} className="text-primary-600 hover:underline break-all">
                {magicLink}
              </a>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto">
      <div className="card">
        <h1 className="text-2xl font-bold mb-6 text-center">Welcome to hackr</h1>
        <p className="text-gray-600 mb-6 text-center">
          Enter your email to get started
        </p>

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="label">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="input"
              placeholder="you@example.com"
              required
            />
          </div>

          {error && (
            <div className="mb-4 p-3 bg-danger-50 text-danger-700 rounded-lg text-sm">
              {error}
            </div>
          )}

          <button type="submit" className="btn btn-primary w-full" disabled={loading}>
            {loading ? 'Sending...' : 'Send Magic Link'}
          </button>
        </form>
      </div>
    </div>
  );
}

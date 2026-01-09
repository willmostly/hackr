import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { verifyMagicLink } from '../api/client';
import { useAuth } from '../hooks/useAuth';

export function VerifyMagicLinkPage() {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const { setUser, refresh } = useAuth();
  const [error, setError] = useState('');

  useEffect(() => {
    if (!token) return;

    verifyMagicLink(token)
      .then((result) => {
        if (result.needsProfile) {
          // New user - redirect to registration
          navigate('/register', { state: { email: result.email } });
        } else {
          // Existing user - logged in
          setUser(result.user!);
          refresh();
          navigate('/');
        }
      })
      .catch((err) => {
        setError(err instanceof Error ? err.message : 'Invalid or expired link');
      });
  }, [token, navigate, setUser, refresh]);

  if (error) {
    return (
      <div className="max-w-md mx-auto">
        <div className="card text-center">
          <h1 className="text-2xl font-bold mb-4 text-danger-600">Link Expired</h1>
          <p className="text-gray-600 mb-6">{error}</p>
          <button onClick={() => navigate('/login')} className="btn btn-primary">
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto">
      <div className="card text-center">
        <h1 className="text-2xl font-bold mb-4">Verifying...</h1>
        <p className="text-gray-600">Please wait while we verify your link.</p>
      </div>
    </div>
  );
}

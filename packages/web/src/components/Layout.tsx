import { Link, Outlet } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

const phaseLabels = {
  registration: 'Registration',
  swiping: 'Swiping',
  ranking: 'Ranking',
  matching: 'Matching',
  complete: 'Complete',
};

export function Layout() {
  const { user, phase, logout } = useAuth();

  return (
    <div className="min-h-screen">
      <nav className="bg-white shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link to="/" className="text-2xl font-bold text-primary-600">
            hackr
          </Link>

          <div className="flex items-center gap-4">
            <span className="text-sm bg-gray-100 px-3 py-1 rounded-full">
              {phaseLabels[phase]}
            </span>

            {user ? (
              <div className="flex items-center gap-3">
                <span className="text-sm text-gray-600">{user.name}</span>
                <button onClick={logout} className="text-sm text-gray-500 hover:text-gray-700">
                  Logout
                </button>
              </div>
            ) : (
              <Link to="/login" className="btn btn-primary text-sm">
                Login
              </Link>
            )}
          </div>
        </div>
      </nav>

      <main className="max-w-4xl mx-auto px-4 py-8">
        <Outlet />
      </main>
    </div>
  );
}

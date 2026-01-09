import { useAuth } from '../hooks/useAuth';
import { Link } from 'react-router-dom';

export function HomePage() {
  const { user, phase, loading } = useAuth();

  if (loading) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Loading...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="text-center py-12">
        <h1 className="text-4xl font-bold mb-4">Find Your Hackathon Team</h1>
        <p className="text-xl text-gray-600 mb-8">
          Swipe right on ideas you love, get matched with your dream team.
        </p>
        <Link to="/login" className="btn btn-primary text-lg px-8 py-3">
          Get Started
        </Link>
      </div>
    );
  }

  // Different views based on role and phase
  if (user.role === 'engineer') {
    return <EngineerHome phase={phase} />;
  }

  if (user.role === 'team_lead') {
    return <TeamLeadHome phase={phase} />;
  }

  if (user.role === 'admin') {
    return <AdminHome phase={phase} />;
  }

  return null;
}

function EngineerHome({ phase }: { phase: string }) {
  switch (phase) {
    case 'registration':
      return (
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold mb-4">Registration Phase</h2>
          <p className="text-gray-600 mb-4">
            Team leads are submitting their ideas. Swiping will start soon!
          </p>
          <Link to="/ideas" className="btn btn-outline">
            Browse Ideas
          </Link>
        </div>
      );

    case 'swiping':
      return (
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold mb-4">Time to Swipe!</h2>
          <p className="text-gray-600 mb-6">
            Browse ideas and swipe right on the ones you'd like to work on.
          </p>
          <Link to="/swipe" className="btn btn-primary text-lg px-8 py-3">
            Start Swiping
          </Link>
        </div>
      );

    case 'ranking':
      return (
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold mb-4">Ranking Phase</h2>
          <p className="text-gray-600">
            Team leads are ranking interested engineers. Results coming soon!
          </p>
        </div>
      );

    case 'matching':
      return (
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold mb-4">Matching in Progress</h2>
          <p className="text-gray-600">
            The algorithm is working its magic. Results coming soon!
          </p>
        </div>
      );

    case 'complete':
      return (
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold mb-4">Matching Complete!</h2>
          <p className="text-gray-600 mb-6">Check out your team assignment.</p>
          <Link to="/results" className="btn btn-primary text-lg px-8 py-3">
            View Results
          </Link>
        </div>
      );

    default:
      return null;
  }
}

function TeamLeadHome({ phase }: { phase: string }) {
  switch (phase) {
    case 'registration':
      return (
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold mb-4">Submit Your Idea</h2>
          <p className="text-gray-600 mb-6">
            Create your hackathon project idea and specify what roles you need.
          </p>
          <div className="flex gap-4 justify-center">
            <Link to="/ideas/new" className="btn btn-primary text-lg px-8 py-3">
              Create Idea
            </Link>
            <Link to="/ideas/mine" className="btn btn-outline text-lg px-8 py-3">
              My Ideas
            </Link>
          </div>
        </div>
      );

    case 'swiping':
      return (
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold mb-4">Time to Vote!</h2>
          <p className="text-gray-600 mb-6">
            Swipe right on ideas you'd like to see at the hackathon. Top voted ideas will be selected!
          </p>
          <div className="flex gap-4 justify-center">
            <Link to="/swipe" className="btn btn-primary text-lg px-8 py-3">
              Start Swiping
            </Link>
            <Link to="/ideas/mine" className="btn btn-outline text-lg px-8 py-3">
              My Ideas
            </Link>
          </div>
        </div>
      );

    case 'ranking':
      return (
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold mb-4">Time to Rank!</h2>
          <p className="text-gray-600 mb-6">
            Rank the engineers who showed interest in your ideas.
          </p>
          <Link to="/rank" className="btn btn-primary text-lg px-8 py-3">
            Start Ranking
          </Link>
        </div>
      );

    case 'matching':
      return (
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold mb-4">Matching in Progress</h2>
          <p className="text-gray-600">
            The algorithm is working its magic. Results coming soon!
          </p>
        </div>
      );

    case 'complete':
      return (
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold mb-4">Matching Complete!</h2>
          <p className="text-gray-600 mb-6">See who's on your team!</p>
          <Link to="/results" className="btn btn-primary text-lg px-8 py-3">
            View Results
          </Link>
        </div>
      );

    default:
      return null;
  }
}

function AdminHome({ phase }: { phase: string }) {
  return (
    <div className="py-8">
      <h2 className="text-2xl font-bold mb-6">Admin Dashboard</h2>
      <p className="text-gray-600 mb-4">
        Current phase: <strong>{phase}</strong>
      </p>
      <Link to="/admin" className="btn btn-primary">
        Admin Panel
      </Link>
    </div>
  );
}

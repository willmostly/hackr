import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getResults } from '../api/client';
import { useAuth } from '../hooks/useAuth';
import type { MatchResult } from '@hackr/shared';

export function ResultsPage() {
  const navigate = useNavigate();
  const { user, phase } = useAuth();
  const [results, setResults] = useState<MatchResult[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (phase !== 'complete') {
      navigate('/');
      return;
    }

    getResults()
      .then((data) => setResults(data.results))
      .finally(() => setLoading(false));
  }, [phase, navigate]);

  if (loading) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Loading results...</p>
      </div>
    );
  }

  // Find user's team
  const userTeam = results.find((r) =>
    r.team_members.some((m) => m.id === user?.id)
  );

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Matching Results</h1>

      {user?.role === 'engineer' && userTeam && (
        <div className="card mb-8 border-2 border-primary-500">
          <h2 className="text-xl font-bold text-primary-600 mb-2">Your Team!</h2>
          <h3 className="text-lg font-semibold mb-2">{userTeam.idea.title}</h3>
          <p className="text-gray-600 mb-4">{userTeam.idea.description}</p>
          <div className="flex flex-wrap gap-2">
            {userTeam.team_members.map((member) => (
              <span
                key={member.id}
                className={`px-3 py-1 rounded-full text-sm ${
                  member.id === user.id
                    ? 'bg-primary-100 text-primary-700'
                    : 'bg-gray-100 text-gray-700'
                }`}
              >
                {member.name} ({member.specialty})
              </span>
            ))}
          </div>
        </div>
      )}

      {user?.role === 'engineer' && !userTeam && (
        <div className="card mb-8 bg-yellow-50 border border-yellow-200">
          <p className="text-yellow-800">
            Unfortunately, you weren't matched to a team this time.
            Consider reaching out to teams directly!
          </p>
        </div>
      )}

      <h2 className="text-xl font-semibold mb-4">All Teams</h2>
      <div className="space-y-4">
        {results.map((result) => (
          <TeamCard
            key={result.idea.id}
            result={result}
            isUserTeam={result === userTeam}
          />
        ))}
      </div>
    </div>
  );
}

function TeamCard({ result, isUserTeam }: { result: MatchResult; isUserTeam: boolean }) {
  const { idea, team_members } = result;

  const roleNeeds = [
    { label: 'Frontend', count: idea.needs_frontend },
    { label: 'Backend', count: idea.needs_backend },
    { label: 'Infra', count: idea.needs_infrastructure },
    { label: 'ML', count: idea.needs_ml },
  ].filter((r) => r.count > 0);

  const totalNeeded = roleNeeds.reduce((sum, r) => sum + r.count, 0);
  const filled = team_members.length;

  return (
    <div className={`card ${isUserTeam ? 'ring-2 ring-primary-500' : ''}`}>
      <div className="flex justify-between items-start mb-2">
        <h3 className="text-lg font-semibold">{idea.title}</h3>
        <span className="text-sm text-gray-500">
          {filled}/{totalNeeded} filled
        </span>
      </div>

      <p className="text-gray-600 text-sm mb-4 line-clamp-2">{idea.description}</p>

      {team_members.length > 0 ? (
        <div className="flex flex-wrap gap-2">
          {team_members.map((member) => (
            <span
              key={member.id}
              className="px-3 py-1 bg-primary-50 text-primary-700 rounded-full text-sm"
            >
              {member.name} ({member.specialty})
            </span>
          ))}
        </div>
      ) : (
        <p className="text-sm text-gray-400 italic">No team members matched</p>
      )}
    </div>
  );
}

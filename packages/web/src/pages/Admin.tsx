import { useState, useEffect } from 'react';
import { advancePhase, runMatching, getRankedIdeas, getResults, IdeaWithSwipeCount } from '../api/client';
import { useAuth } from '../hooks/useAuth';
import type { AppPhase, MatchResult } from '@hackr/shared';

const phaseInfo: Record<AppPhase, { label: string; description: string; next?: string }> = {
  registration: {
    label: 'Registration',
    description: 'Team leads create ideas, engineers create profiles.',
    next: 'Start Swiping Phase',
  },
  swiping: {
    label: 'Swiping',
    description: 'Engineers swipe on ideas to show interest.',
    next: 'Start Ranking Phase',
  },
  ranking: {
    label: 'Ranking',
    description: 'Team leads rank interested engineers.',
    next: 'Start Matching',
  },
  matching: {
    label: 'Matching',
    description: 'Ready to run the matching algorithm.',
    next: 'Run Matching Algorithm',
  },
  complete: {
    label: 'Complete',
    description: 'Matching is complete. Results are available.',
  },
};

export function AdminPage() {
  const { phase, setPhase, user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [matchCount, setMatchCount] = useState<number | null>(null);
  const [rankedIdeas, setRankedIdeas] = useState<IdeaWithSwipeCount[]>([]);
  const [results, setResults] = useState<MatchResult[]>([]);

  useEffect(() => {
    if (user?.role === 'admin') {
      getRankedIdeas()
        .then((data) => setRankedIdeas(data.ideas))
        .catch(console.error);

      if (phase === 'complete') {
        getResults()
          .then((data) => setResults(data.results))
          .catch(console.error);
      }
    }
  }, [user, phase]);

  if (user?.role !== 'admin') {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Admin access required.</p>
      </div>
    );
  }

  const info = phaseInfo[phase];

  const handleAdvance = async () => {
    setLoading(true);
    try {
      if (phase === 'matching') {
        const result = await runMatching();
        setMatchCount(result.count);
        setPhase('complete');
      } else {
        const result = await advancePhase();
        setPhase(result.phase);
      }
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Admin Panel</h1>

      <div className="card mb-6">
        <h2 className="text-xl font-semibold mb-2">Current Phase: {info.label}</h2>
        <p className="text-gray-600 mb-4">{info.description}</p>

        {/* Phase progress */}
        <div className="flex gap-2 mb-6">
          {Object.keys(phaseInfo).map((p) => (
            <div
              key={p}
              className={`flex-1 h-2 rounded ${
                p === phase
                  ? 'bg-primary-500'
                  : Object.keys(phaseInfo).indexOf(p) < Object.keys(phaseInfo).indexOf(phase)
                  ? 'bg-primary-200'
                  : 'bg-gray-200'
              }`}
            />
          ))}
        </div>

        {info.next && (
          <button
            onClick={handleAdvance}
            className="btn btn-primary"
            disabled={loading}
          >
            {loading ? 'Processing...' : info.next}
          </button>
        )}

        {matchCount !== null && (
          <div className="mt-4 p-4 bg-primary-50 rounded-lg">
            <p className="text-primary-700 font-medium">
              Matching complete! {matchCount} engineers matched to teams.
            </p>
          </div>
        )}
      </div>

      {results.length > 0 && (
        <div className="card mb-6">
          <h3 className="font-semibold mb-4">Team Assignments</h3>
          <div className="space-y-4">
            {results.map((result) => (
              <div key={result.idea.id} className="p-4 bg-gray-50 rounded-lg">
                <div className="flex justify-between items-start mb-2">
                  <h4 className="font-medium">{result.idea.title}</h4>
                  <span className="text-sm text-gray-500">
                    {result.team_members.length} matched
                  </span>
                </div>
                {result.team_members.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {result.team_members.map((member) => (
                      <span
                        key={member.id}
                        className="px-2 py-1 bg-primary-100 text-primary-700 rounded text-sm"
                      >
                        {member.name} ({member.specialty})
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-400 italic">No matches</p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {rankedIdeas.length > 0 && (
        <div className="card mb-6">
          <h3 className="font-semibold mb-4">Ideas by Popularity</h3>
          <div className="space-y-3">
            {rankedIdeas.map((idea, index) => (
              <div key={idea.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <span className="text-lg font-bold text-gray-400 w-6">
                    {index + 1}
                  </span>
                  <div>
                    <p className="font-medium">{idea.title}</p>
                    <p className="text-sm text-gray-500">by {idea.creator.name}</p>
                  </div>
                </div>
                <span className="px-3 py-1 bg-primary-100 text-primary-700 rounded-full text-sm font-medium">
                  {idea.swipe_count} votes
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="card">
        <h3 className="font-semibold mb-4">Phase Descriptions</h3>
        <ul className="space-y-3 text-sm">
          <li>
            <strong>Registration:</strong> Users sign up, team leads create ideas
          </li>
          <li>
            <strong>Swiping:</strong> Everyone swipes on ideas to vote
          </li>
          <li>
            <strong>Ranking:</strong> Team leads rank interested engineers
          </li>
          <li>
            <strong>Matching:</strong> Admin runs the matching algorithm
          </li>
          <li>
            <strong>Complete:</strong> Everyone can see their team assignments
          </li>
        </ul>
      </div>
    </div>
  );
}

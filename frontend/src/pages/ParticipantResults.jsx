import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axiosInstance from '../axiosConfig';
import ParticipantTopNav from '../components/ParticipantTopNav';

// STS-18 (Participant view): every completed match, with its recorded result,
// across every tournament the current user has joined — its own page/route,
// reachable from the top nav, rather than a section on the Dashboard.
const ParticipantResults = () => {
  const { user } = useAuth();
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchMatches = async () => {
      try {
        const response = await axiosInstance.get('/api/matches/mine', {
          headers: { Authorization: `Bearer ${user.token}` },
        });
        const completed = response.data
          .filter((m) => m.status === 'Completed')
          .sort((a, b) => new Date(b.date) - new Date(a.date));
        setMatches(completed);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load your results.');
      } finally {
        setLoading(false);
      }
    };

    if (user) fetchMatches();
  }, [user]);

  return (
    <ParticipantTopNav>
      <h1 className="text-3xl font-black text-white uppercase mb-1">Results</h1>
      <p className="text-[#94a3b8] text-sm mb-6">
        Results from your completed matches across every tournament you've joined.
      </p>

      {loading ? (
        <p className="text-[#94a3b8]">Loading...</p>
      ) : error ? (
        <div className="max-w-md bg-[#2c1e1a] border border-[rgba(239,68,68,0.2)] text-[#ef4444] text-sm px-3 py-2 rounded-lg">
          {error}
        </div>
      ) : matches.length === 0 ? (
        <p className="text-[#94a3b8]">
          No results yet. Once one of your matches is completed and the organizer
          records the result, it'll show up here.
        </p>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {matches.map((m) => {
            const won = m.winner && user && m.winner._id === user.id;
            const lost = m.winner && user && m.winner._id !== user.id;
            return (
              <Link
                to={`/tournaments/${m.tournamentId?._id}`}
                key={m._id}
                className="bg-[#171e2c] border border-[#2a3547] rounded-2xl p-4 hover:border-[#cf0] transition"
              >
                <div className="flex items-center justify-between">
                  <span className="bg-[#232d3f] border border-[#2a3547] text-white text-[10px] font-bold uppercase px-2 py-1 rounded-md">
                    {m.tournamentId?.sport}
                  </span>
                  {won && (
                    <span className="bg-[#1e3b2f] text-[#10b981] text-[10px] font-bold uppercase px-2 py-1 rounded-md">
                      Win
                    </span>
                  )}
                  {lost && (
                    <span className="bg-[#2c1e1a] text-[#ef4444] text-[10px] font-bold uppercase px-2 py-1 rounded-md">
                      Loss
                    </span>
                  )}
                </div>
                <p className="text-[#94a3b8] text-xs uppercase mt-2">{m.tournamentId?.name}</p>
                <p className="font-bold text-white">
                  {(m.participants || []).map((p) => p.name).join(' vs ')}
                </p>
                {m.winner && <p className="text-sm text-[#94a3b8] mt-1">Winner: {m.winner.name}</p>}
                <p className="text-xs text-[#64748b] mt-1">{new Date(m.date).toLocaleDateString()}</p>
              </Link>
            );
          })}
        </div>
      )}
    </ParticipantTopNav>
  );
};

export default ParticipantResults;

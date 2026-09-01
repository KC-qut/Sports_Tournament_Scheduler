import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axiosInstance from '../axiosConfig';
import ParticipantTopNav from '../components/ParticipantTopNav';

// STS-15 (Participant view): every upcoming (Scheduled) match across every
// tournament the current user has joined — its own page/route, reachable from
// the top nav, rather than a section on the Dashboard.
const ParticipantSchedule = () => {
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
        setMatches(response.data.filter((m) => m.status === 'Scheduled'));
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load your schedule.');
      } finally {
        setLoading(false);
      }
    };

    if (user) fetchMatches();
  }, [user]);

  return (
    <ParticipantTopNav>
      <h1 className="text-3xl font-black text-white uppercase mb-1">Schedule</h1>
      <p className="text-[#94a3b8] text-sm mb-6">
        Upcoming matches across every tournament you've joined.
      </p>

      {loading ? (
        <p className="text-[#94a3b8]">Loading...</p>
      ) : error ? (
        <div className="max-w-md bg-[#2c1e1a] border border-[rgba(239,68,68,0.2)] text-[#ef4444] text-sm px-3 py-2 rounded-lg">
          {error}
        </div>
      ) : matches.length === 0 ? (
        <p className="text-[#94a3b8]">
          You have no upcoming matches. Once an organizer schedules a match for a
          tournament you've joined, it'll show up here.{' '}
          <Link to="/" className="text-[#cf0] underline">
            Discover tournaments
          </Link>{' '}
          to join one.
        </p>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {matches.map((m) => (
            <Link
              to={`/tournaments/${m.tournamentId?._id}`}
              key={m._id}
              className="bg-[#171e2c] border border-[#2a3547] rounded-2xl p-4 hover:border-[#cf0] transition"
            >
              <span className="bg-[#232d3f] border border-[#2a3547] text-white text-[10px] font-bold uppercase px-2 py-1 rounded-md">
                {m.tournamentId?.sport}
              </span>
              <p className="text-[#94a3b8] text-xs uppercase mt-2">{m.tournamentId?.name}</p>
              <p className="font-bold text-white">
                {(m.participants || []).map((p) => p.name).join(' vs ')}
              </p>
              <p className="text-sm text-[#94a3b8] mt-1">
                {new Date(m.date).toLocaleString()} {m.venue && `\u2022 ${m.venue}`}
              </p>
            </Link>
          ))}
        </div>
      )}
    </ParticipantTopNav>
  );
};

export default ParticipantSchedule;

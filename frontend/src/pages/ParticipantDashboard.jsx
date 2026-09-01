import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axiosInstance from '../axiosConfig';
import ParticipantTopNav from '../components/ParticipantTopNav';

const statusStyles = {
  Pending: 'bg-[#3a2f14] text-[#eab308]',
  Accepted: 'bg-[#1e3b2f] text-[#10b981]',
  Rejected: 'bg-[#2c1e1a] text-[#ef4444]',
};

// STS-12: View Joined Tournaments — Participant's dashboard, styled after the
// GameDay Figma design. Uses a top-nav layout (ParticipantTopNav), not the
// sidebar shared by Organizer/Admin — matching the verified Figma export,
// which fixes this layout distinction as early as the low-fidelity wireframe.
const ParticipantDashboard = () => {
  const { user } = useAuth();
  const [tournaments, setTournaments] = useState([]);
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      const authHeader = { headers: { Authorization: `Bearer ${user.token}` } };
      try {
        const [tRes, mRes] = await Promise.all([
          axiosInstance.get('/api/tournaments/joined/list', authHeader),
          axiosInstance.get('/api/matches/mine', authHeader),
        ]);
        setTournaments(tRes.data);
        setMatches(mRes.data);
      } catch (error) {
        alert('Failed to load your dashboard.');
      } finally {
        setLoading(false);
      }
    };

    if (user) fetchData();
  }, [user]);

  const now = new Date();
  const upcomingMatches = matches.filter((m) => m.status === 'Scheduled');
  const recentResults = matches
    .filter((m) => m.status === 'Completed')
    .sort((a, b) => new Date(b.date) - new Date(a.date));

  return (
    <ParticipantTopNav>
      <h1 className="text-3xl font-black text-white uppercase mb-1">My Tournaments</h1>
      <p className="text-[#94a3b8] text-sm mb-6">Tournaments you've registered for.</p>

      {loading ? (
        <p className="text-[#94a3b8]">Loading...</p>
      ) : tournaments.length === 0 ? (
        <p className="text-[#94a3b8]">
          You haven't joined any tournaments yet.{' '}
          <Link to="/" className="text-[#cf0] underline">
            Discover tournaments
          </Link>{' '}
          to get started.
        </p>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 mb-8">
          {tournaments.map((t) => (
            <Link
              to={`/tournaments/${t._id}`}
              key={t._id}
              className="bg-[#171e2c] border border-[#2a3547] p-4 rounded-2xl hover:border-[#cf0] transition"
            >
              <div className="flex items-center justify-between">
                <span className="bg-[#232d3f] border border-[#2a3547] text-white text-[10px] font-bold uppercase px-2 py-1 rounded-md">
                  {t.sport}
                </span>
                {t.myStatus && (
                  <span className={`text-[10px] font-bold uppercase px-2 py-1 rounded-md ${statusStyles[t.myStatus]}`}>
                    {t.myStatus}
                  </span>
                )}
              </div>
              <h2 className="font-bold text-white text-lg mt-2">{t.name}</h2>
              <p className="text-sm text-[#94a3b8]">
                {new Date(t.date).toLocaleDateString()} {new Date(t.date) < now && '(Completed)'}
              </p>
              <p className="text-sm text-white mt-1">
                Organized by {t.organizerId?.name || 'Unknown'} &middot; {t.status}
              </p>
            </Link>
          ))}
        </div>
      )}

      <div className="flex items-center justify-between mb-3">
        <h2 className="text-xl font-bold text-white uppercase">Upcoming Schedule</h2>
        <Link to="/schedule" className="text-[#cf0] text-sm font-semibold hover:underline">
          View Full Schedule &rarr;
        </Link>
      </div>
      {upcomingMatches.length === 0 ? (
        <p className="text-[#94a3b8] mb-8">You have no upcoming matches scheduled.</p>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 mb-8">
          {upcomingMatches.slice(0, 3).map((m) => (
            <div key={m._id} className="bg-[#171e2c] border border-[#2a3547] rounded-2xl p-4">
              <p className="text-[#94a3b8] text-xs uppercase">{m.tournamentId?.name}</p>
              <p className="font-bold text-white">
                {(m.participants || []).map((p) => p.name).join(' vs ')}
              </p>
              <p className="text-sm text-[#94a3b8] mt-1">
                {new Date(m.date).toLocaleString()} {m.venue && `\u2022 ${m.venue}`}
              </p>
            </div>
          ))}
        </div>
      )}

      <div className="flex items-center justify-between mb-3">
        <h2 className="text-xl font-bold text-white uppercase">Recent Results</h2>
        <Link to="/results" className="text-[#cf0] text-sm font-semibold hover:underline">
          View All Results &rarr;
        </Link>
      </div>
      {recentResults.length === 0 ? (
        <p className="text-[#94a3b8]">You have no results yet — they'll show up here once one of your matches is completed.</p>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {recentResults.slice(0, 3).map((m) => (
            <div key={m._id} className="bg-[#171e2c] border border-[#2a3547] rounded-2xl p-4">
              <p className="text-[#94a3b8] text-xs uppercase">{m.tournamentId?.name}</p>
              <p className="font-bold text-white">
                {(m.participants || []).map((p) => p.name).join(' vs ')}
              </p>
              {m.winner && <p className="text-sm text-[#10b981] mt-1">Winner: {m.winner.name}</p>}
            </div>
          ))}
        </div>
      )}
    </ParticipantTopNav>
  );
};

export default ParticipantDashboard;

import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axiosInstance from '../axiosConfig';

const statusStyles = {
  Pending: 'bg-[#3a2f14] text-[#eab308]',
  Accepted: 'bg-[#1e3b2f] text-[#10b981]',
  Rejected: 'bg-[#2c1e1a] text-[#ef4444]',
};

// STS-12: View Joined Tournaments — a Participant can see every tournament
// they've requested to join, regardless of who organized it or whether the
// organizer has accepted the request yet.
const JoinedTournaments = () => {
  const { user } = useAuth();
  const [tournaments, setTournaments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchJoined = async () => {
      try {
        const response = await axiosInstance.get('/api/tournaments/joined/list', {
          headers: { Authorization: `Bearer ${user.token}` },
        });
        setTournaments(response.data);
      } catch (error) {
        alert('Failed to load your joined tournaments.');
      } finally {
        setLoading(false);
      }
    };

    if (user) fetchJoined();
  }, [user]);

  if (loading) return <div className="text-center mt-20 text-white">Loading...</div>;

  return (
    <div className="min-h-screen bg-[#0b0e14] p-8">
      <h1 className="text-3xl font-black text-white uppercase mb-6">Tournaments You've Joined</h1>

      {tournaments.length === 0 ? (
        <p className="text-[#94a3b8]">
          You haven't joined any tournaments yet. Head to{' '}
          <Link to="/" className="text-[#cf0] underline">
            Discover
          </Link>{' '}
          to find one.
        </p>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {tournaments.map((t) => (
            <Link
              to={`/tournaments/${t._id}`}
              key={t._id}
              className="bg-[#171e2c] border border-[#2a3547] p-4 rounded-2xl hover:border-[#cf0] transition"
            >
              <div className="flex items-center justify-between mb-1">
                <h2 className="font-bold text-white text-lg">{t.name}</h2>
                {t.myStatus && (
                  <span className={`text-[10px] font-bold uppercase px-2 py-1 rounded-md ${statusStyles[t.myStatus]}`}>
                    {t.myStatus}
                  </span>
                )}
              </div>
              <p className="text-sm text-[#94a3b8]">{t.sport}</p>
              <p className="text-sm text-[#94a3b8]">
                {new Date(t.date).toLocaleDateString()}
              </p>
              <p className="text-sm mt-1 text-white">
                Organized by {t.organizerId?.name || 'Unknown'} &middot; {t.status}
              </p>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default JoinedTournaments;

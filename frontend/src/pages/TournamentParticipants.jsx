import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axiosInstance from '../axiosConfig';

const statusStyles = {
  Pending: 'bg-[#3a2f14] text-[#eab308]',
  Accepted: 'bg-[#1e3b2f] text-[#10b981]',
  Rejected: 'bg-[#2c1e1a] text-[#ef4444]',
};

// STS-13: Organizer Views Participants — Organizer (or Admin) can see who has
// requested to join a tournament they own, and accept or deny each request.
const TournamentParticipants = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionError, setActionError] = useState('');
  const [actingOn, setActingOn] = useState(null);

  const fetchParticipants = async () => {
    try {
      const response = await axiosInstance.get(`/api/tournaments/${id}/participants`, {
        headers: { Authorization: `Bearer ${user.token}` },
      });
      setData(response.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load participants.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) fetchParticipants();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, user]);

  const handleDecision = async (participantUserId, status) => {
    setActionError('');
    setActingOn(participantUserId);
    try {
      await axiosInstance.put(
        `/api/tournaments/${id}/participants/${participantUserId}`,
        { status },
        { headers: { Authorization: `Bearer ${user.token}` } }
      );
      await fetchParticipants();
    } catch (err) {
      setActionError(err.response?.data?.message || `Failed to ${status === 'Accepted' ? 'accept' : 'deny'} this request.`);
    } finally {
      setActingOn(null);
    }
  };

  if (loading) return <div className="text-center mt-20 text-white">Loading...</div>;
  if (error) return <div className="text-center mt-20 text-[#ef4444]">{error}</div>;

  // Defensive: skip any legacy/malformed entry missing a populated user
  // (see backend/scripts/fixParticipants.js) instead of crashing on it.
  const participants = (data.participants || []).filter((p) => p.user);
  const acceptedCount = participants.filter((p) => p.status === 'Accepted').length;
  const atCapacity = acceptedCount >= data.maxCapacity;

  return (
    <div className="min-h-screen bg-[#0b0e14] p-8">
      <Link to="/dashboard" className="text-sm text-[#cf0] underline">
        &larr; Back to Dashboard
      </Link>
      <h1 className="text-3xl font-black text-white uppercase mt-2 mb-1">{data.tournamentName}</h1>
      <p className="text-[#94a3b8] mb-6">
        {acceptedCount}/{data.maxCapacity} registered
      </p>

      {actionError && (
        <div className="mb-4 max-w-md bg-[#2c1e1a] border border-[rgba(239,68,68,0.2)] text-[#ef4444] text-sm px-3 py-2 rounded-lg">
          {actionError}
        </div>
      )}

      {participants.length === 0 ? (
        <p className="text-[#94a3b8]">No one has requested to join this tournament yet.</p>
      ) : (
        <div className="bg-[#171e2c] border border-[#2a3547] rounded-2xl divide-y divide-[#2a3547]">
          {participants.map((p) => (
            <div key={p.user._id} className="p-4 flex items-center justify-between gap-4 flex-wrap">
              <div>
                <span className="font-medium text-white">{p.user.name}</span>{' '}
                <span className="text-[#94a3b8] text-sm">{p.user.email}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className={`text-[10px] font-bold uppercase px-2 py-1 rounded-md ${statusStyles[p.status]}`}>
                  {p.status}
                </span>
                {p.status === 'Pending' && (
                  <>
                    <button
                      onClick={() => handleDecision(p.user._id, 'Accepted')}
                      disabled={actingOn === p.user._id || atCapacity}
                      title={atCapacity ? 'Tournament is at full capacity' : undefined}
                      className="bg-[#cf0] text-[#0b0e14] font-bold px-3 py-1.5 rounded-lg text-sm disabled:bg-[#2a3547] disabled:text-[#94a3b8]"
                    >
                      Accept
                    </button>
                    <button
                      onClick={() => handleDecision(p.user._id, 'Rejected')}
                      disabled={actingOn === p.user._id}
                      className="bg-[#2c1e1a] border border-[rgba(239,68,68,0.2)] text-[#ef4444] px-3 py-1.5 rounded-lg text-sm"
                    >
                      Deny
                    </button>
                  </>
                )}
                {p.status === 'Accepted' && (
                  <button
                    onClick={() => handleDecision(p.user._id, 'Rejected')}
                    disabled={actingOn === p.user._id}
                    className="bg-[#2c1e1a] border border-[rgba(239,68,68,0.2)] text-[#ef4444] px-3 py-1.5 rounded-lg text-sm"
                  >
                    Remove
                  </button>
                )}
                {p.status === 'Rejected' && (
                  <button
                    onClick={() => handleDecision(p.user._id, 'Accepted')}
                    disabled={actingOn === p.user._id || atCapacity}
                    title={atCapacity ? 'Tournament is at full capacity' : undefined}
                    className="bg-[#cf0] text-[#0b0e14] font-bold px-3 py-1.5 rounded-lg text-sm disabled:bg-[#2a3547] disabled:text-[#94a3b8]"
                  >
                    Accept
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default TournamentParticipants;

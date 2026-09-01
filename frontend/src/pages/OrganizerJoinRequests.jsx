import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import axiosInstance from '../axiosConfig';
import Sidebar from '../components/Sidebar';
import { useAuth } from '../context/AuthContext';

const statusStyles = {
  Pending: 'bg-[#3a2f14] text-[#eab308]',
  Accepted: 'bg-[#1e3b2f] text-[#10b981]',
  Rejected: 'bg-[#2c1e1a] text-[#ef4444]',
};

const OrganizerJoinRequests = () => {
  const { user } = useAuth();
  const [tournaments, setTournaments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actingOn, setActingOn] = useState('');

  const navItems = [
    { to: '/dashboard', label: 'Dashboard' },
    { to: '/tournaments/new', label: 'Create Tournament' },
    { to: '/join-requests', label: 'Join Requests' },
  ];

  const fetchTournaments = async () => {
    try {
      setError('');
      const response = await axiosInstance.get('/api/tournaments/mine/list', {
        headers: { Authorization: `Bearer ${user.token}` },
      });
      setTournaments(response.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load join requests.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) fetchTournaments();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const pendingCount = useMemo(
    () => tournaments.reduce(
      (total, tournament) => total + (tournament.participants || []).filter((p) => p.status === 'Pending').length,
      0
    ),
    [tournaments]
  );

  const tournamentsWithRequests = useMemo(
    () => tournaments.filter((tournament) => (tournament.participants || []).length > 0),
    [tournaments]
  );

  const updateParticipantStatus = async (tournamentId, participantId, status) => {
    const actionKey = `${tournamentId}-${participantId}`;
    setActingOn(actionKey);
    setError('');

    try {
      await axiosInstance.put(
        `/api/tournaments/${tournamentId}/participants/${participantId}`,
        { status },
        { headers: { Authorization: `Bearer ${user.token}` } }
      );
      await fetchTournaments();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update participant.');
    } finally {
      setActingOn('');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0b0e14] text-white flex items-center justify-center">
        Loading join requests...
      </div>
    );
  }

  return (
    <Sidebar title="Organizer Workspace" navItems={navItems}>
      <h1 className="text-3xl font-black text-white uppercase mb-1">Join Requests</h1>
      <p className="text-[#94a3b8] text-sm mb-2">
        Review participants who have requested to join your tournaments.
      </p>
      {pendingCount > 0 && (
        <p className="text-[#eab308] text-sm mb-6">
          {pendingCount} pending {pendingCount === 1 ? 'request' : 'requests'}
        </p>
      )}

      {error && (
        <div className="mb-5 bg-[#2c1e1a] border border-[rgba(239,68,68,0.2)] text-[#ef4444] px-4 py-3 rounded-xl">
          {error}
        </div>
      )}

      {tournamentsWithRequests.length === 0 ? (
        <div className="bg-[#171e2c] border border-[#2a3547] rounded-2xl p-8">
          <h2 className="text-white font-bold text-lg mb-2">No join requests</h2>
          <p className="text-[#94a3b8]">No participants have requested to join your tournaments yet.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {tournamentsWithRequests.map((tournament) => {
            const participants = [...(tournament.participants || [])].sort((a, b) => {
              if (a.status === 'Pending' && b.status !== 'Pending') return -1;
              if (a.status !== 'Pending' && b.status === 'Pending') return 1;
              return 0;
            });
            const acceptedCount = participants.filter((p) => p.status === 'Accepted').length;
            const atCapacity = acceptedCount >= tournament.maxCapacity;

            return (
              <section key={tournament._id} className="bg-[#171e2c] border border-[#2a3547] rounded-2xl overflow-hidden">
                <div className="p-5 border-b border-[#2a3547] flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <h2 className="text-xl font-bold text-white">{tournament.name}</h2>
                    <p className="text-sm text-[#94a3b8]">
                      {tournament.sport} • {acceptedCount}/{tournament.maxCapacity} accepted
                    </p>
                  </div>
                  <Link to={`/tournaments/${tournament._id}/participants`} className="text-[#cf0] text-sm font-semibold">
                    Manage Participants
                  </Link>
                </div>

                <div className="divide-y divide-[#2a3547]">
                  {participants.map((participant) => {
                    if (!participant.user) return null;
                    const participantId = participant.user._id || participant.user;
                    const actionKey = `${tournament._id}-${participantId}`;
                    const isWorking = actingOn === actionKey;
                    const name = participant.user.name || 'Participant';
                    const email = participant.user.email || '';

                    return (
                      <div key={participantId} className="p-5 flex flex-wrap items-center justify-between gap-4">
                        <div>
                          <p className="font-bold text-white">{name}</p>
                          {email && <p className="text-sm text-[#94a3b8]">{email}</p>}
                          {participant.joinedAt && (
                            <p className="text-xs text-[#64748b] mt-1">
                              Requested: {new Date(participant.joinedAt).toLocaleDateString()}
                            </p>
                          )}
                        </div>

                        <div className="flex flex-wrap items-center gap-2">
                          <span className={`text-[10px] font-bold uppercase px-2 py-1 rounded-md ${statusStyles[participant.status] || ''}`}>
                            {participant.status}
                          </span>

                          {participant.status === 'Pending' && (
                            <>
                              <button
                                type="button"
                                disabled={isWorking || atCapacity}
                                onClick={() => updateParticipantStatus(tournament._id, participantId, 'Accepted')}
                                className="bg-[#cf0] text-[#0b0e14] font-bold px-3 py-2 rounded-lg text-sm disabled:bg-[#2a3547] disabled:text-[#64748b]"
                              >
                                {isWorking ? 'Updating...' : 'Accept'}
                              </button>
                              <button
                                type="button"
                                disabled={isWorking}
                                onClick={() => updateParticipantStatus(tournament._id, participantId, 'Rejected')}
                                className="bg-[#2c1e1a] border border-[rgba(239,68,68,0.2)] text-[#ef4444] px-3 py-2 rounded-lg text-sm disabled:opacity-50"
                              >
                                Deny
                              </button>
                            </>
                          )}

                          {participant.status === 'Accepted' && (
                            <button
                              type="button"
                              disabled={isWorking}
                              onClick={() => updateParticipantStatus(tournament._id, participantId, 'Rejected')}
                              className="bg-[#2c1e1a] border border-[rgba(239,68,68,0.2)] text-[#ef4444] px-3 py-2 rounded-lg text-sm disabled:opacity-50"
                            >
                              Remove
                            </button>
                          )}

                          {participant.status === 'Rejected' && (
                            <button
                              type="button"
                              disabled={isWorking || atCapacity}
                              onClick={() => updateParticipantStatus(tournament._id, participantId, 'Accepted')}
                              className="bg-[#232d3f] border border-[#2a3547] text-white px-3 py-2 rounded-lg text-sm disabled:opacity-50"
                            >
                              Accept
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>
            );
          })}
        </div>
      )}
    </Sidebar>
  );
};

export default OrganizerJoinRequests;

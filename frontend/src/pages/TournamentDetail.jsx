import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axiosInstance from '../axiosConfig';
import MatchForm from '../components/MatchForm';
import RecordResultForm from '../components/RecordResultForm';

// REQ-1.3: Tournament Display
// REQ-3.2: Join Tournament — Participant can request to join an upcoming, open
// tournament before its deadline; the request is Pending until the organizer
// accepts/denies it on the Manage Participants page (STS-13).
// REQ-4: Scheduling & Results — shows matches for this tournament; organizer can
// create/edit matches (STS-14, STS-16) and record results (STS-17).
const TournamentDetail = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const [tournament, setTournament] = useState(null);
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [joinError, setJoinError] = useState('');
  const [editingMatch, setEditingMatch] = useState(null);
  const [recordingMatchId, setRecordingMatchId] = useState(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [tRes, mRes] = await Promise.all([
        axiosInstance.get(`/api/tournaments/${id}`),
        axiosInstance.get(`/api/matches/tournament/${id}`),
      ]);
      setTournament(tRes.data);
      setMatches(mRes.data);
    } catch (error) {
      alert('Failed to load tournament.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const handleJoin = async () => {
    setJoinError('');
    try {
      await axiosInstance.post(
        `/api/tournaments/${id}/join`,
        {},
        { headers: { Authorization: `Bearer ${user.token}` } }
      );
      fetchData();
    } catch (error) {
      setJoinError(error.response?.data?.message || 'Failed to join tournament.');
    }
  };

  const handleWithdraw = async () => {
    setJoinError('');
    try {
      await axiosInstance.post(
        `/api/tournaments/${id}/withdraw`,
        {},
        { headers: { Authorization: `Bearer ${user.token}` } }
      );
      fetchData();
    } catch (error) {
      setJoinError(error.response?.data?.message || 'Failed to withdraw from tournament.');
    }
  };

  if (loading) return <div className="text-center mt-20 text-white bg-[#0b0e14] min-h-screen">Loading...</div>;
  if (!tournament) return <div className="text-center mt-20 text-white bg-[#0b0e14] min-h-screen">Tournament not found.</div>;

  // Defensive: falls back to [] if this tournament has unreadable/legacy
  // participant data (see backend/scripts/fixParticipants.js). Also drop any
  // entry missing a populated `user` for the same reason.
  const participants = (tournament.participants || []).filter((p) => p.user);
  const acceptedParticipants = participants.filter((p) => p.status === 'Accepted');
  const myEntry = user && participants.find((p) => p.user._id === user.id);
  const isOwner =
    user && tournament.organizerId && (tournament.organizerId._id === user.id || user.role === 'Admin');
  const hasPassed = new Date(tournament.date) < new Date();

  const handleDeleteMatch = async (matchId) => {
    try {
      await axiosInstance.delete(`/api/matches/${matchId}`, {
        headers: { Authorization: `Bearer ${user.token}` },
      });
      setMatches(matches.filter((m) => m._id !== matchId));
    } catch (error) {
      alert('Failed to delete match.');
    }
  };

  return (
    <div className="min-h-screen bg-[#0b0e14] px-8 md:px-[120px] py-10">
      <span className="bg-[#232d3f] border border-[#2a3547] text-white text-[10px] font-bold uppercase px-2 py-1 rounded-md">
        {tournament.sport}
      </span>
      <h1 className="text-3xl font-black text-white mt-2">{tournament.name}</h1>
      <p className="text-[#94a3b8] mb-4">{tournament.description}</p>
      <p className="text-sm text-[#94a3b8]">
        Date: {new Date(tournament.date).toLocaleDateString()}
      </p>
      <p className="text-sm text-[#94a3b8] mb-4">
        Capacity: {acceptedParticipants.length}/{tournament.maxCapacity} &middot; Status: {tournament.status}
      </p>

      {joinError && (
        <div className="mb-4 max-w-md bg-[#2c1e1a] border border-[rgba(239,68,68,0.2)] text-[#ef4444] text-sm px-3 py-2 rounded-lg">
          {joinError}
        </div>
      )}

      {user && user.role === 'Participant' && (
        <>
          {myEntry && myEntry.status !== 'Rejected' ? (
            <>
              <button
                onClick={handleWithdraw}
                disabled={hasPassed}
                className="bg-[#2c1e1a] border border-[rgba(239,68,68,0.2)] text-[#ef4444] font-bold px-4 py-2 rounded-lg disabled:opacity-40"
              >
                {myEntry.status === 'Pending' ? 'Cancel Request' : 'Withdraw'}
              </button>
              {myEntry.status === 'Pending' && (
                <p className="text-xs text-[#94a3b8] mt-2">Waiting for the organizer to accept your request.</p>
              )}
            </>
          ) : (
            <>
              <button
                onClick={handleJoin}
                disabled={tournament.status !== 'Open' || hasPassed}
                className="bg-[#cf0] text-[#0b0e14] font-bold px-4 py-2 rounded-lg disabled:bg-[#2a3547] disabled:text-[#94a3b8]"
              >
                {hasPassed ? 'Tournament Has Passed' : myEntry ? 'Request Again' : 'Join Tournament'}
              </button>
              {myEntry && myEntry.status === 'Rejected' && (
                <p className="text-xs text-[#94a3b8] mt-2">Your previous request was denied — you can request again.</p>
              )}
            </>
          )}
        </>
      )}
      {!user && <p className="text-sm text-[#94a3b8]">Log in as a Participant to join.</p>}

      {isOwner && (
        <div className="mt-6">
          <div className="flex items-center justify-between max-w-xl mb-3">
            <h2 className="text-xl font-bold text-white">
              Participants ({acceptedParticipants.length}/{tournament.maxCapacity})
            </h2>
            <Link to={`/tournaments/${tournament._id}/participants`} className="text-sm text-[#cf0] underline">
              Manage Participants
            </Link>
          </div>
          {participants.some((p) => p.status === 'Pending') && (
            <p className="text-sm text-[#eab308] mb-2">
              {participants.filter((p) => p.status === 'Pending').length} request(s) awaiting your review.
            </p>
          )}
          {acceptedParticipants.length === 0 ? (
            <p className="text-[#94a3b8]">No one has joined yet.</p>
          ) : (
            <div className="bg-[#171e2c] border border-[#2a3547] rounded-2xl divide-y divide-[#2a3547] max-w-xl">
              {acceptedParticipants.map((p) => (
                <div key={p.user._id} className="p-3 flex justify-between">
                  <span className="text-white font-medium">{p.user.name}</span>
                  <span className="text-[#94a3b8] text-sm">{p.user.email}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      <h2 className="text-2xl font-bold text-white mt-8 mb-4">Matches</h2>

      {isOwner && (
        <MatchForm
          tournamentId={tournament._id}
          participants={acceptedParticipants.map((p) => p.user)}
          matches={matches}
          setMatches={setMatches}
          editingMatch={editingMatch}
          setEditingMatch={setEditingMatch}
        />
      )}

      {matches.length === 0 ? (
        <p className="text-[#94a3b8]">No matches scheduled yet.</p>
      ) : (
        <div className="space-y-3">
          {matches.map((m) => (
            <div key={m._id} className="bg-[#171e2c] border border-[#2a3547] p-4 rounded-2xl">
              <p className="font-semibold text-white">
                {new Date(m.date).toLocaleString()} {m.venue && `@ ${m.venue}`}
              </p>
              <p className="text-sm text-[#94a3b8]">
                {(m.participants || []).map((p) => p.name).join(' vs ')}
              </p>
              <p className="text-sm text-[#94a3b8]">
                Status: {m.status}
                {m.status === 'Completed' && m.winner && ` — Winner: ${m.winner.name}`}
              </p>

              {isOwner && (
                <div className="flex gap-2 mt-3">
                  <button
                    onClick={() => setEditingMatch(m)}
                    className="bg-[#232d3f] border border-[#2a3547] text-white px-3 py-1.5 rounded-lg text-sm"
                  >
                    Edit
                  </button>
                  {m.status === 'Scheduled' && (
                    <button
                      onClick={() => setRecordingMatchId(m._id)}
                      className="bg-[#cf0] text-[#0b0e14] font-bold px-3 py-1.5 rounded-lg text-sm"
                    >
                      Record Result
                    </button>
                  )}
                  <button
                    onClick={() => handleDeleteMatch(m._id)}
                    className="bg-[#2c1e1a] border border-[rgba(239,68,68,0.2)] text-[#ef4444] px-3 py-1.5 rounded-lg text-sm"
                  >
                    Delete
                  </button>
                </div>
              )}

              {isOwner && recordingMatchId === m._id && (
                <RecordResultForm
                  match={m}
                  matches={matches}
                  setMatches={setMatches}
                  onClose={() => setRecordingMatchId(null)}
                />
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default TournamentDetail;

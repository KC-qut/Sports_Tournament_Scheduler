import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import axiosInstance from '../axiosConfig';

// REQ-4.2 / STS-17: Record Results — record scores and winners for completed matches.
const RecordResultForm = ({ match, matches, setMatches, onClose }) => {
  const { user } = useAuth();
  const matchParticipants = match.participants || [];
  const [scores, setScores] = useState(
    matchParticipants.map((p) => ({ participant: p._id, score: '' }))
  );
  const [winner, setWinner] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!winner) {
      setError('Select a winner.');
      return;
    }
    try {
      const response = await axiosInstance.put(
        `/api/matches/${match._id}/result`,
        { scores: scores.map((s) => ({ ...s, score: Number(s.score) || 0 })), winner },
        { headers: { Authorization: `Bearer ${user.token}` } }
      );
      const winnerObj = matchParticipants.find((p) => p._id === winner);
      const updated = { ...response.data, participants: matchParticipants, winner: winnerObj };
      setMatches(matches.map((m) => (m._id === updated._id ? updated : m)));
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to record result.');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-[#0f141b] border border-[#2a3547] p-4 rounded-xl mt-2">
      <h4 className="text-white font-semibold mb-2 text-sm">Record Result</h4>
      {error && (
        <div className="mb-2 bg-[#2c1e1a] border border-[rgba(239,68,68,0.2)] text-[#ef4444] text-xs px-2 py-1.5 rounded-lg">
          {error}
        </div>
      )}
      {matchParticipants.map((p, i) => (
        <div key={p._id} className="flex items-center gap-2 mb-2">
          <span className="text-white text-sm w-28 truncate">{p.name}</span>
          <input
            type="number"
            placeholder="Score"
            value={scores[i].score}
            onChange={(e) => {
              const next = [...scores];
              next[i] = { ...next[i], score: e.target.value };
              setScores(next);
            }}
            className="flex-1 p-1.5 bg-[#171e2c] border border-[#2a3547] text-white rounded-lg text-sm"
          />
        </div>
      ))}
      <label className="block mb-1 text-xs text-[#94a3b8]">Winner</label>
      <select
        value={winner}
        onChange={(e) => setWinner(e.target.value)}
        className="w-full mb-3 p-1.5 bg-[#171e2c] border border-[#2a3547] text-white rounded-lg text-sm"
      >
        <option value="">Select winner</option>
        {matchParticipants.map((p) => (
          <option key={p._id} value={p._id}>{p.name}</option>
        ))}
      </select>
      <div className="flex gap-2">
        <button type="submit" className="bg-[#cf0] text-[#0b0e14] font-bold px-3 py-1.5 rounded-lg text-sm">
          Save Result
        </button>
        <button
          type="button"
          onClick={onClose}
          className="bg-[#232d3f] border border-[#2a3547] text-white px-3 py-1.5 rounded-lg text-sm"
        >
          Cancel
        </button>
      </div>
    </form>
  );
};

export default RecordResultForm;

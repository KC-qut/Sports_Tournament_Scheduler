import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import axiosInstance from '../axiosConfig';

// REQ-4.1 / STS-14: Create Match — Organizer can assign match date, venue and participants.
// STS-16: Edit Match — same form, pre-filled, PUTs instead of POSTs.
const MatchForm = ({ tournamentId, participants, matches, setMatches, editingMatch, setEditingMatch }) => {
  const { user } = useAuth();
  const emptyForm = { date: '', venue: '', participantIds: [] };
  const [formData, setFormData] = useState(emptyForm);
  const [error, setError] = useState('');

  useEffect(() => {
    if (editingMatch) {
      setFormData({
        date: editingMatch.date ? editingMatch.date.slice(0, 16) : '',
        venue: editingMatch.venue || '',
        participantIds: (editingMatch.participants || []).map((p) => p._id),
      });
    } else {
      setFormData(emptyForm);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editingMatch]);

  const toggleParticipant = (id) => {
    setFormData((prev) => ({
      ...prev,
      participantIds: prev.participantIds.includes(id)
        ? prev.participantIds.filter((p) => p !== id)
        : [...prev.participantIds, id],
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    const payload = { tournamentId, date: formData.date, venue: formData.venue, participants: formData.participantIds };
    try {
      if (editingMatch) {
        const response = await axiosInstance.put(`/api/matches/${editingMatch._id}`, payload, {
          headers: { Authorization: `Bearer ${user.token}` },
        });
        const populated = { ...response.data, participants: participants.filter((p) => formData.participantIds.includes(p._id)) };
        setMatches(matches.map((m) => (m._id === populated._id ? populated : m)));
      } else {
        const response = await axiosInstance.post('/api/matches', payload, {
          headers: { Authorization: `Bearer ${user.token}` },
        });
        const populated = { ...response.data, participants: participants.filter((p) => formData.participantIds.includes(p._id)) };
        setMatches([...matches, populated]);
      }
      setEditingMatch(null);
      setFormData(emptyForm);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save match.');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-[#171e2c] border border-[#2a3547] p-5 rounded-2xl mb-4">
      <h3 className="text-lg font-bold text-white mb-3">
        {editingMatch ? 'Edit Match' : 'Create Match'}
      </h3>
      {error && (
        <div className="mb-3 bg-[#2c1e1a] border border-[rgba(239,68,68,0.2)] text-[#ef4444] text-sm px-3 py-2 rounded-lg">
          {error}
        </div>
      )}
      <label className="block mb-1 text-sm text-[#94a3b8]">Date &amp; Time</label>
      <input
        type="datetime-local"
        value={formData.date}
        onChange={(e) => setFormData({ ...formData, date: e.target.value })}
        className="w-full mb-3 p-2 bg-[#0f141b] border border-[#2a3547] text-white rounded-lg"
      />
      <label className="block mb-1 text-sm text-[#94a3b8]">Venue</label>
      <input
        type="text"
        placeholder="Venue"
        value={formData.venue}
        onChange={(e) => setFormData({ ...formData, venue: e.target.value })}
        className="w-full mb-3 p-2 bg-[#0f141b] border border-[#2a3547] text-white placeholder-[#64748b] rounded-lg"
      />
      <label className="block mb-1 text-sm text-[#94a3b8]">Participants (registered only)</label>
      <div className="mb-3 max-h-32 overflow-y-auto bg-[#0f141b] border border-[#2a3547] rounded-lg p-2">
        {participants.length === 0 ? (
          <p className="text-[#64748b] text-sm">No registered participants yet.</p>
        ) : (
          participants.map((p) => (
            <label key={p._id} className="flex items-center gap-2 text-sm text-white py-1">
              <input
                type="checkbox"
                checked={formData.participantIds.includes(p._id)}
                onChange={() => toggleParticipant(p._id)}
              />
              {p.name}
            </label>
          ))
        )}
      </div>
      <div className="flex gap-2">
        <button type="submit" className="bg-[#cf0] text-[#0b0e14] font-bold px-4 py-2 rounded-lg">
          {editingMatch ? 'Update Match' : 'Create Match'}
        </button>
        {editingMatch && (
          <button
            type="button"
            onClick={() => setEditingMatch(null)}
            className="bg-[#232d3f] border border-[#2a3547] text-white px-4 py-2 rounded-lg"
          >
            Cancel
          </button>
        )}
      </div>
    </form>
  );
};

export default MatchForm;

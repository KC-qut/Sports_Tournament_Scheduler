import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import axiosInstance from '../axiosConfig';

// REQ-3.1.1: Create Tournament — set fields like details, date, and max capacity.
// REQ-3.1.2: Edit Tournament — change fields like details, date, and max capacity.
const TournamentForm = ({ tournaments, setTournaments, editingTournament, setEditingTournament }) => {
  const { user } = useAuth();
  const emptyForm = {
    name: '',
    sport: '',
    description: '',
    date: '',
    registrationDeadline: '',
    maxCapacity: '',
  };
  const [formData, setFormData] = useState(emptyForm);

  useEffect(() => {
    if (editingTournament) {
      setFormData({
        name: editingTournament.name,
        sport: editingTournament.sport,
        description: editingTournament.description || '',
        date: editingTournament.date ? editingTournament.date.slice(0, 10) : '',
        registrationDeadline: editingTournament.registrationDeadline
          ? editingTournament.registrationDeadline.slice(0, 10)
          : '',
        maxCapacity: editingTournament.maxCapacity,
      });
    } else {
      setFormData(emptyForm);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editingTournament]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingTournament) {
        const response = await axiosInstance.put(
          `/api/tournaments/${editingTournament._id}`,
          formData,
          { headers: { Authorization: `Bearer ${user.token}` } }
        );
        setTournaments(
          tournaments.map((t) => (t._id === response.data._id ? response.data : t))
        );
      } else {
        const response = await axiosInstance.post('/api/tournaments', formData, {
          headers: { Authorization: `Bearer ${user.token}` },
        });
        setTournaments([...tournaments, response.data]);
      }
      setEditingTournament(null);
      setFormData(emptyForm);
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to save tournament.');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-[#171e2c] border border-[#2a3547] p-6 rounded-2xl mb-6">
      <h1 className="text-2xl font-bold mb-4 text-white">
        {editingTournament ? 'Edit Tournament' : 'Create Tournament'}
      </h1>
      <input
        type="text"
        placeholder="Tournament Name"
        value={formData.name}
        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
        className="w-full mb-4 p-2 bg-[#0f141b] border border-[#2a3547] text-white placeholder-[#64748b] rounded-lg"
      />
      <input
        type="text"
        placeholder="Sport"
        value={formData.sport}
        onChange={(e) => setFormData({ ...formData, sport: e.target.value })}
        className="w-full mb-4 p-2 bg-[#0f141b] border border-[#2a3547] text-white placeholder-[#64748b] rounded-lg"
      />
      <textarea
        placeholder="Description"
        value={formData.description}
        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
        className="w-full mb-4 p-2 bg-[#0f141b] border border-[#2a3547] text-white placeholder-[#64748b] rounded-lg"
      />
      <label className="block mb-1 text-sm text-[#94a3b8]">Tournament Date</label>
      <input
        type="date"
        value={formData.date}
        onChange={(e) => setFormData({ ...formData, date: e.target.value })}
        className="w-full mb-4 p-2 bg-[#0f141b] border border-[#2a3547] text-white rounded-lg"
      />
      <label className="block mb-1 text-sm text-[#94a3b8]">Registration Deadline</label>
      <input
        type="date"
        value={formData.registrationDeadline}
        onChange={(e) => setFormData({ ...formData, registrationDeadline: e.target.value })}
        className="w-full mb-4 p-2 bg-[#0f141b] border border-[#2a3547] text-white rounded-lg"
      />
      <input
        type="number"
        placeholder="Max Capacity"
        min="1"
        value={formData.maxCapacity}
        onChange={(e) => setFormData({ ...formData, maxCapacity: e.target.value })}
        className="w-full mb-4 p-2 bg-[#0f141b] border border-[#2a3547] text-white placeholder-[#64748b] rounded-lg"
      />
      <button type="submit" className="w-full bg-[#cf0] text-[#0b0e14] font-bold p-2 rounded-lg">
        {editingTournament ? 'Update Tournament' : 'Create Tournament'}
      </button>
    </form>
  );
};

export default TournamentForm;

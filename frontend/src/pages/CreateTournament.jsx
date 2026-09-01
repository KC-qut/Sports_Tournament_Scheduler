import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axiosInstance from '../axiosConfig';
import Sidebar from '../components/Sidebar';

// REQ-3.1.1: Create Tournament — Organizer can create tournament, setting fields
// like details, date, and max capacity. Split out into its own page/route so it's
// reachable directly from the sidebar nav, matching the Figma "create-tournament"
// frame (a distinct screen from the Dashboard, not an inline form on it).
const CreateTournament = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    sport: '',
    description: '',
    date: '',
    registrationDeadline: '',
    maxCapacity: '',
  });
  const [error, setError] = useState('');

  const navItems = [
    { to: '/dashboard', label: 'Dashboard' },
    { to: '/tournaments/new', label: 'Create Tournament' },
    { to: '/joined-tournaments', label: 'Joined Tournaments' },
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await axiosInstance.post('/api/tournaments', formData, {
        headers: { Authorization: `Bearer ${user.token}` },
      });
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create tournament.');
    }
  };

  return (
    <Sidebar title="Organizer Workspace" navItems={navItems}>
      <h1 className="text-3xl font-black text-white uppercase mb-1">Create Tournament</h1>
      <p className="text-[#94a3b8] text-sm mb-6">Set up a new tournament for participants to discover and join.</p>

      <form onSubmit={handleSubmit} className="max-w-xl bg-[#171e2c] border border-[#2a3547] p-6 rounded-2xl">
        {error && (
          <div className="mb-4 bg-[#2c1e1a] border border-[rgba(239,68,68,0.2)] text-[#ef4444] text-sm px-3 py-2 rounded-lg">
            {error}
          </div>
        )}
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
        <div className="flex gap-2">
          <button type="submit" className="bg-[#cf0] text-[#0b0e14] font-bold px-6 py-2 rounded-lg">
            Create Tournament
          </button>
          <button
            type="button"
            onClick={() => navigate('/dashboard')}
            className="bg-[#232d3f] border border-[#2a3547] text-white px-6 py-2 rounded-lg"
          >
            Cancel
          </button>
        </div>
      </form>
    </Sidebar>
  );
};

export default CreateTournament;

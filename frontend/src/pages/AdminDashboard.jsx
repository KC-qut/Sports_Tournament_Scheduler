import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import axiosInstance from '../axiosConfig';
import Sidebar from '../components/Sidebar';
import TournamentForm from '../components/TournamentForm';
import TournamentList from '../components/TournamentList';

const roleStyles = {
  Admin: 'bg-[#3a1e2c] text-[#f472b6]',
  Organizer: 'bg-[#1e293b] text-[#38bdf8]',
  Participant: 'bg-[#1e3b2f] text-[#10b981]',
};

// STS-20: Admin Dashboard — summary counts.
// STS-21: Manage Users — view all users (with role), change role, delete.
// STS-22: Manage Tournaments — view/edit/delete every tournament platform-wide.
// Both lists render directly on the page (rather than behind a tab toggle) so
// they're visible as soon as the dashboard loads.
const AdminDashboard = () => {
  const { user } = useAuth();
  const [summary, setSummary] = useState(null);
  const [users, setUsers] = useState([]);
  const [tournaments, setTournaments] = useState([]);
  const [editingTournament, setEditingTournament] = useState(null);
  const [error, setError] = useState('');

  const authHeader = { headers: { Authorization: `Bearer ${user.token}` } };

  const fetchAll = async () => {
    try {
      const [summaryRes, usersRes, tournamentsRes] = await Promise.all([
        axiosInstance.get('/api/admin/summary', authHeader),
        axiosInstance.get('/api/admin/users', authHeader),
        axiosInstance.get('/api/admin/tournaments', authHeader),
      ]);
      setSummary(summaryRes.data);
      setUsers(usersRes.data);
      setTournaments(tournamentsRes.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load admin data.');
    }
  };

  useEffect(() => {
    if (user) fetchAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const handleRoleChange = async (userId, role) => {
    try {
      await axiosInstance.put(`/api/admin/users/${userId}/role`, { role }, authHeader);
      setUsers(users.map((u) => (u._id === userId ? { ...u, role } : u)));
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update role.');
    }
  };

  const handleDeleteUser = async (userId) => {
    try {
      await axiosInstance.delete(`/api/admin/users/${userId}`, authHeader);
      setUsers(users.filter((u) => u._id !== userId));
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete user.');
    }
  };

  const navItems = [{ to: '/', label: 'Discover Tournaments' }];

  return (
    <Sidebar title="Administrator" navItems={navItems}>
      <h1 className="text-3xl font-black text-white uppercase mb-1">Admin Dashboard</h1>
      <p className="text-[#94a3b8] text-sm mb-6">Platform-wide user and tournament oversight.</p>

      {error && (
        <div className="mb-4 bg-[#2c1e1a] border border-[rgba(239,68,68,0.2)] text-[#ef4444] text-sm px-3 py-2 rounded-lg">
          {error}
        </div>
      )}

      {summary && (
        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="bg-[#171e2c] border border-[#2a3547] rounded-2xl p-4">
            <p className="text-[#94a3b8] text-xs uppercase">Total Users</p>
            <p className="text-white text-2xl font-black">{summary.userCount}</p>
          </div>
          <div className="bg-[#171e2c] border border-[#2a3547] rounded-2xl p-4">
            <p className="text-[#94a3b8] text-xs uppercase">Total Tournaments</p>
            <p className="text-white text-2xl font-black">{summary.tournamentCount}</p>
          </div>
          <div className="bg-[#171e2c] border border-[#2a3547] rounded-2xl p-4">
            <p className="text-[#94a3b8] text-xs uppercase">Open Tournaments</p>
            <p className="text-white text-2xl font-black">{summary.openTournaments}</p>
          </div>
        </div>
      )}

      <h2 className="text-xl font-bold text-white uppercase mb-3">Users ({users.length})</h2>
      {users.length === 0 ? (
        <p className="text-[#94a3b8] mb-8">No users yet.</p>
      ) : (
        <div className="bg-[#171e2c] border border-[#2a3547] rounded-2xl divide-y divide-[#2a3547] mb-8">
          {users.map((u) => (
            <div key={u._id} className="p-4 flex items-center justify-between gap-4 flex-wrap">
              <div>
                <p className="text-white font-semibold">
                  {u.name} {u._id === user.id && <span className="text-[#94a3b8] text-xs font-normal">(you)</span>}
                </p>
                <p className="text-[#94a3b8] text-sm">{u.email}</p>
              </div>
              <div className="flex items-center gap-2">
                <span className={`text-[10px] font-bold uppercase px-2 py-1 rounded-md ${roleStyles[u.role]}`}>
                  {u.role}
                </span>
                <select
                  value={u.role}
                  onChange={(e) => handleRoleChange(u._id, e.target.value)}
                  disabled={u._id === user.id}
                  className="bg-[#0f141b] border border-[#2a3547] text-white text-sm rounded-lg p-1.5 disabled:opacity-40"
                >
                  <option value="Participant">Participant</option>
                  <option value="Organizer">Organizer</option>
                  <option value="Admin">Admin</option>
                </select>
                <button
                  onClick={() => handleDeleteUser(u._id)}
                  disabled={u._id === user.id}
                  className="bg-[#2c1e1a] border border-[rgba(239,68,68,0.2)] text-[#ef4444] px-3 py-1.5 rounded-lg text-sm disabled:opacity-40"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <h2 className="text-xl font-bold text-white uppercase mb-3">Tournaments ({tournaments.length})</h2>
      <TournamentForm
        tournaments={tournaments}
        setTournaments={setTournaments}
        editingTournament={editingTournament}
        setEditingTournament={setEditingTournament}
      />
      {tournaments.length === 0 ? (
        <p className="text-[#94a3b8]">No tournaments yet.</p>
      ) : (
        <TournamentList
          tournaments={tournaments}
          setTournaments={setTournaments}
          setEditingTournament={setEditingTournament}
        />
      )}
    </Sidebar>
  );
};

export default AdminDashboard;

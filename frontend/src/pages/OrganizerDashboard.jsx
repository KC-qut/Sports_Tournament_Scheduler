import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axiosInstance from '../axiosConfig';
import Sidebar from '../components/Sidebar';
import TournamentForm from '../components/TournamentForm';
import TournamentList from '../components/TournamentList';
import { useAuth } from '../context/AuthContext';

// REQ-3: Tournament Operations — Organizer's dashboard, styled after the
// GameDay Figma "Organizer - Dashboard" design (dark theme + sidebar).
// Data logic is unchanged from the original MyTournaments page — only the
// page chrome around it is new.
//
// Create Tournament now lives on its own page/route (/tournaments/new,
// reachable from the sidebar) rather than as an inline form here, matching
// the Figma design's separate "create-tournament" frame. TournamentForm is
// still used inline, but only for editing an existing tournament.
const OrganizerDashboard = () => {
  const { user } = useAuth();
  const [tournaments, setTournaments] = useState([]);
  const [editingTournament, setEditingTournament] = useState(null);

  useEffect(() => {
    const fetchTournaments = async () => {
      try {
        const response = await axiosInstance.get('/api/tournaments/mine/list', {
          headers: { Authorization: `Bearer ${user.token}` },
        });
        setTournaments(response.data);
      } catch (error) {
        alert('Failed to fetch your tournaments.');
      }
    };

    if (user) fetchTournaments();
  }, [user]);

  const navItems = [
    { to: '/dashboard', label: 'Dashboard' },
    { to: '/tournaments/new', label: 'Create Tournament' },
    { to: '/join-requests', label: 'Join Requests' },
  ];

  return (
    <Sidebar title="Organizer Workspace" navItems={navItems}>
      <h1 className="text-3xl font-black text-white uppercase mb-1">Dashboard</h1>
      <p className="text-[#94a3b8] text-sm mb-6">
        Manage tournaments, participants, and results from one place.
      </p>

      {editingTournament && (
        <TournamentForm
          tournaments={tournaments}
          setTournaments={setTournaments}
          editingTournament={editingTournament}
          setEditingTournament={setEditingTournament}
        />
      )}

      <div className="flex items-center justify-between mb-3">
        <h2 className="text-xl font-bold text-white uppercase">My Tournaments</h2>
        <Link
          to="/tournaments/new"
          className="bg-[#cf0] text-[#0b0e14] font-bold px-4 py-2 rounded-lg text-sm"
        >
          + New
        </Link>
      </div>
      <TournamentList
        tournaments={tournaments}
        setTournaments={setTournaments}
        setEditingTournament={setEditingTournament}
      />
    </Sidebar>
  );
};

export default OrganizerDashboard;

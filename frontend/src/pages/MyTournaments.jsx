import { useState, useEffect } from 'react';
import axiosInstance from '../axiosConfig';
import TournamentForm from '../components/TournamentForm';
import TournamentList from '../components/TournamentList';
import { useAuth } from '../context/AuthContext';

// REQ-3: Tournament Operations — Organizer's management view.
const MyTournaments = () => {
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

  return (
    <div className="container mx-auto p-6">
      <TournamentForm
        tournaments={tournaments}
        setTournaments={setTournaments}
        editingTournament={editingTournament}
        setEditingTournament={setEditingTournament}
      />
      <TournamentList
        tournaments={tournaments}
        setTournaments={setTournaments}
        setEditingTournament={setEditingTournament}
      />
    </div>
  );
};

export default MyTournaments;

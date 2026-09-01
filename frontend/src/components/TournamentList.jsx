import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axiosInstance from '../axiosConfig';
import ConfirmDeleteModal from './ConfirmDeleteModal';

// REQ-3.1.3: Delete Tournament — Organizer can delete/cancel tournament.
// Deletion is destructive (removes participants, matches, results with it),
// so it's gated behind a confirmation modal rather than firing immediately.
const TournamentList = ({ tournaments, setTournaments, setEditingTournament }) => {
  const { user } = useAuth();
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleteError, setDeleteError] = useState('');
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    setDeleteError('');
    try {
      await axiosInstance.delete(`/api/tournaments/${deleteTarget._id}`, {
        headers: { Authorization: `Bearer ${user.token}` },
      });
      setTournaments(tournaments.filter((t) => t._id !== deleteTarget._id));
      setDeleteTarget(null);
    } catch (error) {
      setDeleteError(error.response?.data?.message || 'Failed to delete tournament.');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div>
      {tournaments.map((t) => (
        <div key={t._id} className="bg-[#171e2c] border border-[#2a3547] p-4 mb-4 rounded-2xl">
          <div className="flex items-center justify-between mb-1">
            <span className="bg-[#232d3f] border border-[#2a3547] text-white text-[10px] font-bold uppercase px-2 py-1 rounded-md">
              {t.sport}
            </span>
            <span className="bg-[#1e3b2f] text-[#10b981] text-[10px] font-bold uppercase px-2 py-1 rounded-md">
              {t.status}
            </span>
          </div>
          <h2 className="font-bold text-white text-lg">{t.name}</h2>
          <p className="text-[#94a3b8] text-sm">{t.description}</p>
          <p className="text-sm text-[#94a3b8]">
            {new Date(t.date).toLocaleDateString()}
          </p>
          <p className="text-sm text-[#94a3b8] mb-3">
            {(t.participants || []).filter((p) => p.status === 'Accepted').length}/{t.maxCapacity} registered
            {(t.participants || []).some((p) => p.status === 'Pending') && (
              <span className="ml-2 text-[#eab308]">
                ({(t.participants || []).filter((p) => p.status === 'Pending').length} pending)
              </span>
            )}
          </p>
          <div className="flex flex-wrap gap-2">
            <Link
              to={`/tournaments/${t._id}`}
              className="bg-[#cf0] text-[#0b0e14] font-bold px-4 py-2 rounded-lg"
            >
              View
            </Link>
            <Link
              to={`/tournaments/${t._id}/participants`}
              className="bg-[#232d3f] border border-[#2a3547] text-white px-4 py-2 rounded-lg"
            >
              Manage Participants
            </Link>
            <button
              onClick={() => setEditingTournament(t)}
              className="bg-[#232d3f] border border-[#2a3547] text-white px-4 py-2 rounded-lg"
            >
              Edit
            </button>
            <button
              onClick={() => {
                setDeleteError('');
                setDeleteTarget(t);
              }}
              className="bg-[#2c1e1a] border border-[rgba(239,68,68,0.2)] text-[#ef4444] px-4 py-2 rounded-lg"
            >
              Delete
            </button>
          </div>
        </div>
      ))}

      {deleteTarget && (
        <ConfirmDeleteModal
          title="Delete Tournament?"
          message={`This action cannot be undone. All participants, matches and results for "${deleteTarget.name}" will be removed.`}
          confirmLabel="Delete Tournament"
          error={deleteError}
          deleting={deleting}
          onCancel={() => {
            if (deleting) return;
            setDeleteTarget(null);
            setDeleteError('');
          }}
          onConfirm={handleDelete}
        />
      )}
    </div>
  );
};

export default TournamentList;

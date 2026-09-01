const express = require('express');
const {
    getPublicTournaments,
    searchTournaments,
    getTournamentById,
    getMyTournaments,
    getJoinedTournaments,
    getTournamentParticipants,
    updateParticipantStatus,
    createTournament,
    updateTournament,
    deleteTournament,
    joinTournament,
    withdrawFromTournament,
} = require('../controllers/tournamentController');
const { protect, authorize } = require('../middleware/authMiddleware');
const router = express.Router();

// REQ-1: Public routes — no auth (Homepage, Search, Display)
router.get('/', getPublicTournaments);
router.get('/search', searchTournaments);

// Fixed routes must come before /:id so Express does not treat "mine" or
// "joined" as a tournament id.
router.get('/mine/list', protect, authorize('Organizer', 'Admin'), getMyTournaments);
router.get('/joined/list', protect, getJoinedTournaments);

// REQ-3: Organizer-only management routes
router.post('/', protect, authorize('Organizer', 'Admin'), createTournament);
router.put('/:id', protect, authorize('Organizer', 'Admin'), updateTournament);
router.delete('/:id', protect, authorize('Organizer', 'Admin'), deleteTournament);

// REQ-3.2: Participant join / withdraw routes
router.post('/:id/join', protect, joinTournament);
router.post('/:id/withdraw', protect, withdrawFromTournament);

// STS-13: Organizer Views Participants — Organizer/Admin only, ownership checked in controller
router.get('/:id/participants', protect, authorize('Organizer', 'Admin'), getTournamentParticipants);
// STS-13: Organizer Accepts/Denies a Join Request — Organizer/Admin only, ownership checked in controller
router.put('/:id/participants/:userId', protect, authorize('Organizer', 'Admin'), updateParticipantStatus);

// Generic tournament detail route must remain last.
router.get('/:id', getTournamentById);

module.exports = router;

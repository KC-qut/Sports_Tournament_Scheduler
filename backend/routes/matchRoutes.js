const express = require('express');
const {
    getMatchesByTournament,
    getRecentResults,
    getMyMatches,
    createMatch,
    updateMatch,
    recordResult,
    deleteMatch,
} = require('../controllers/matchController');
const { protect, authorize } = require('../middleware/authMiddleware');
const router = express.Router();

// REQ-4: Scheduling & Results — viewing matches is public (REQ-1 style discovery),
// creating/editing/recording results is Organizer/Admin only.
// STS-19: recent results, no auth required (Home.jsx public homepage)
router.get('/recent', getRecentResults);
// Participant Dashboard: matches across every tournament the current user has joined
router.get('/mine', protect, getMyMatches);
router.get('/tournament/:tournamentId', getMatchesByTournament);
router.post('/', protect, authorize('Organizer', 'Admin'), createMatch);
router.put('/:id', protect, authorize('Organizer', 'Admin'), updateMatch);
router.put('/:id/result', protect, authorize('Organizer', 'Admin'), recordResult);
router.delete('/:id', protect, authorize('Organizer', 'Admin'), deleteMatch);

module.exports = router;

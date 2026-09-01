const express = require('express');
const {
    getAllUsers,
    updateUserRole,
    deleteUser,
    getAllTournaments,
    getDashboardSummary,
} = require('../controllers/adminController');
const { protect, authorize } = require('../middleware/authMiddleware');
const router = express.Router();

// REQ-5 / Epic 7 — every route here is Administrator-only.
router.use(protect, authorize('Admin'));

router.get('/summary', getDashboardSummary);
router.get('/users', getAllUsers);
router.put('/users/:id/role', updateUserRole);
router.delete('/users/:id', deleteUser);
router.get('/tournaments', getAllTournaments);

module.exports = router;

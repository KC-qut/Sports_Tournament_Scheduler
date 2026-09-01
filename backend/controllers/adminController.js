const User = require('../models/User');
const Tournament = require('../models/Tournament');

// STS-21: Manage Users — Administrator can view all users platform-wide.
const getAllUsers = async (req, res) => {
    try {
        const users = await User.find().select('-password').sort({ name: 1 });
        res.json(users);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// STS-21: change a user's role (e.g. promote a Participant to Organizer, or to Admin).
const updateUserRole = async (req, res) => {
    const { role } = req.body;
    const allowedRoles = ['Admin', 'Organizer', 'Participant'];
    if (!allowedRoles.includes(role)) {
        return res.status(400).json({ message: 'Role must be Admin, Organizer, or Participant' });
    }
    if (req.params.id === req.user.id) {
        return res.status(400).json({ message: 'You cannot change your own role' });
    }
    try {
        const user = await User.findById(req.params.id);
        if (!user) return res.status(404).json({ message: 'User not found' });

        user.role = role;
        await user.save();
        res.json({ id: user.id, name: user.name, email: user.email, role: user.role });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// STS-21: Manage Users — remove a user.
const deleteUser = async (req, res) => {
    if (req.params.id === req.user.id) {
        return res.status(400).json({ message: 'You cannot delete your own account' });
    }
    try {
        const user = await User.findById(req.params.id);
        if (!user) return res.status(404).json({ message: 'User not found' });

        await User.findByIdAndDelete(req.params.id);
        res.json({ message: 'User deleted' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// STS-22: Manage Tournaments — Administrator sees every tournament platform-wide,
// regardless of who organized it or its status (including Cancelled).
const getAllTournaments = async (req, res) => {
    try {
        const tournaments = await Tournament.find()
            .populate('organizerId', 'name email')
            .sort({ date: -1 });
        res.json(tournaments);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// STS-20: Admin Dashboard — summary counts for the landing view.
const getDashboardSummary = async (req, res) => {
    try {
        const [userCount, tournamentCount, openTournaments] = await Promise.all([
            User.countDocuments(),
            Tournament.countDocuments(),
            Tournament.countDocuments({ status: 'Open' }),
        ]);
        res.json({ userCount, tournamentCount, openTournaments });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { getAllUsers, updateUserRole, deleteUser, getAllTournaments, getDashboardSummary };

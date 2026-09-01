const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Reused as-is from Taskmanager: verifies JWT and attaches req.user
const protect = async (req, res, next) => {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            token = req.headers.authorization.split(' ')[1];
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            req.user = await User.findById(decoded.id).select('-password');
            return next();
        } catch (error) {
            return res.status(401).json({ message: 'Not authorized, token failed' });
        }
    }

    if (!token) {
        return res.status(401).json({ message: 'Not authorized, no token' });
    }
};

// New for Sports Tournament Scheduler — REQ-2.2 Role-Based Access
// Usage: router.post('/', protect, authorize('Organizer', 'Admin'), createTournament)
const authorize = (...roles) => {
    return (req, res, next) => {
        if (!req.user || !roles.includes(req.user.role)) {
            return res.status(403).json({ message: 'Not authorized for this action' });
        }
        next();
    };
};

module.exports = { protect, authorize };

const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });
};

// STS-23: basic input validation for registration
const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

// Normalize email so it is always stored/searched in lowercase
const normalizeEmail = (email) => email.trim().toLowerCase();

// REQ-2.1: User Login/Registration — user can submit unique email and password securely.
// Extended from Taskmanager to accept an optional role at signup (defaults to Participant).
const registerUser = async (req, res) => {
    const { name, email, password, role } = req.body;

    try {
        if (!name || !name.trim()) {
            return res.status(400).json({
                message: 'Name is required'
            });
        }

        if (!email || !isValidEmail(email.trim())) {
            return res.status(400).json({
                message: 'A valid email is required'
            });
        }

        if (!password || password.length < 6) {
            return res.status(400).json({
                message: 'Password must be at least 6 characters'
            });
        }

        // Convert email to lowercase before checking the database
        const normalizedEmail = normalizeEmail(email);

        const userExists = await User.findOne({
            email: normalizedEmail
        });

        if (userExists) {
            return res.status(400).json({
                message: 'User already exists'
            });
        }

        const allowedRoles = ['Organizer', 'Participant'];
        const assignedRole = allowedRoles.includes(role)
            ? role
            : 'Participant';

        const user = await User.create({
            name: name.trim(),
            email: normalizedEmail,
            password,
            role: assignedRole
        });

        res.status(201).json({
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            token: generateToken(user.id),
        });

    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
};

const loginUser = async (req, res) => {
    const { email, password } = req.body;

    try {
        if (!email || !password) {
            return res.status(400).json({
                message: 'Email and password are required'
            });
        }

        // IMPORTANT:
        // Convert whatever the user typed to lowercase before searching.
        // Example:
        // John@Gmail.com -> john@gmail.com
        // JOHN@GMAIL.COM -> john@gmail.com
        const normalizedEmail = normalizeEmail(email);

        const user = await User.findOne({
            email: normalizedEmail
        });

        if (user && (await bcrypt.compare(password, user.password))) {
            res.json({
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
                token: generateToken(user.id),
            });
        } else {
            res.status(401).json({
                message: 'Invalid email or password'
            });
        }

    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
};

const getProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);

        if (!user) {
            return res.status(404).json({
                message: 'User not found'
            });
        }

        res.status(200).json({
            name: user.name,
            email: user.email,
            role: user.role,
        });

    } catch (error) {
        res.status(500).json({
            message: 'Server error',
            error: error.message
        });
    }
};

const updateUserProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);

        if (!user) {
            return res.status(404).json({
                message: 'User not found'
            });
        }

        const { name, email } = req.body;

        if (name) {
            user.name = name.trim();
        }

        if (email) {
            const normalizedEmail = normalizeEmail(email);

            if (!isValidEmail(normalizedEmail)) {
                return res.status(400).json({
                    message: 'A valid email is required'
                });
            }

            // Check whether another user already has this email
            const emailExists = await User.findOne({
                email: normalizedEmail,
                _id: { $ne: user._id }
            });

            if (emailExists) {
                return res.status(400).json({
                    message: 'Email is already in use'
                });
            }

            user.email = normalizedEmail;
        }

        // Note: role is intentionally not user-editable here.
        // Role changes should go through a dedicated Admin-only endpoint (REQ-5).

        const updatedUser = await user.save();

        res.json({
            id: updatedUser.id,
            name: updatedUser.name,
            email: updatedUser.email,
            role: updatedUser.role,
            token: generateToken(updatedUser.id),
        });

    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
};

module.exports = {
    registerUser,
    loginUser,
    updateUserProfile,
    getProfile
};
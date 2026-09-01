const Tournament = require('../models/Tournament');

// Defensive helper: a tournament's `participants` can come back `undefined`
// instead of `[]` if the stored document has data in a shape this schema
// can't cast (e.g. leftover data from a different version of the app pointed
// at the same database). Never let that turn into a crash — treat it as
// "no readable participants" everywhere we display/validate it. Run
// `node backend/scripts/fixParticipants.js` to permanently repair the
// underlying documents.
const asParticipantList = (tournament) => tournament.participants || [];

// A participant entry can itself be malformed (missing `user`) if it came
// from data this schema couldn't fully cast — see fixParticipants.js. Strip
// those out of anything sent to the client rather than exposing a broken row.
const cleanParticipants = (tournament) => asParticipantList(tournament).filter((p) => p && p.user);

const acceptedCountOf = (tournament) => cleanParticipants(tournament).filter((p) => p.status === 'Accepted').length;

// REQ-1.1 / REQ-1.3: Public Homepage & Tournament Display
// No auth required — homepage must be accessible without authentication.
const getPublicTournaments = async (req, res) => {
    try {
        const tournaments = await Tournament.find({ status: { $ne: 'Cancelled' } })
            .populate('organizerId', 'name')
            .sort({ date: 1 });
        res.json(tournaments.map((t) => ({ ...t.toObject(), participants: cleanParticipants(t) })));
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// REQ-1.2: Tournament Search — visitor can search by sport name or tournament name
const searchTournaments = async (req, res) => {
    try {
        const { q, sport } = req.query;
        const filter = { status: { $ne: 'Cancelled' } };

        if (sport) filter.sport = { $regex: sport, $options: 'i' };
        if (q) {
            filter.$or = [
                { name: { $regex: q, $options: 'i' } },
                { sport: { $regex: q, $options: 'i' } },
            ];
        }

        const tournaments = await Tournament.find(filter).populate('organizerId', 'name').sort({ date: 1 });
        res.json(tournaments.map((t) => ({ ...t.toObject(), participants: cleanParticipants(t) })));
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Single tournament detail view (supports REQ-1.3)
const getTournamentById = async (req, res) => {
    try {
        const tournament = await Tournament.findById(req.params.id)
            .populate('organizerId', 'name')
            .populate('participants.user', 'name email');
        if (!tournament) return res.status(404).json({ message: 'Tournament not found' });
        res.json({ ...tournament.toObject(), participants: cleanParticipants(tournament) });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// REQ-3: Organizer's own tournaments (management view, requires auth)
const getMyTournaments = async (req, res) => {
    try {
        const tournaments = await Tournament.find({ organizerId: req.user.id })
            .populate('participants.user', 'name email')
            .sort({ date: 1 });
        res.json(tournaments.map((t) => ({ ...t.toObject(), participants: cleanParticipants(t) })));
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// STS-12: View Joined Tournaments — a Participant can see every tournament
// they've requested/joined, regardless of who organized it or the request's
// status (Pending/Accepted/Rejected).
const getJoinedTournaments = async (req, res) => {
    try {
        const tournaments = await Tournament.find({ 'participants.user': req.user.id })
            .populate('organizerId', 'name')
            .sort({ date: 1 });
        const withStatus = tournaments.map((t) => {
            const participants = cleanParticipants(t);
            const mine = participants.find((p) => p.user.toString() === req.user.id);
            return { ...t.toObject(), participants, myStatus: mine ? mine.status : null };
        });
        res.json(withStatus);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// STS-13: Organizer Views Participants — Organizer (or Admin) can see who has
// requested to join a tournament they own, and accept/deny each request.
const getTournamentParticipants = async (req, res) => {
    try {
        const tournament = await Tournament.findById(req.params.id).populate('participants.user', 'name email');
        if (!tournament) return res.status(404).json({ message: 'Tournament not found' });

        if (tournament.organizerId.toString() !== req.user.id && req.user.role !== 'Admin') {
            return res.status(403).json({ message: 'Not authorized to view participants for this tournament' });
        }

        res.json({
            tournamentId: tournament._id,
            tournamentName: tournament.name,
            maxCapacity: tournament.maxCapacity,
            acceptedCount: acceptedCountOf(tournament),
            participants: cleanParticipants(tournament),
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// STS-13: Organizer Accepts/Denies a Join Request.
const updateParticipantStatus = async (req, res) => {
    try {
        const { status } = req.body;
        if (!['Accepted', 'Rejected'].includes(status)) {
            return res.status(400).json({ message: "Status must be 'Accepted' or 'Rejected'" });
        }

        const tournament = await Tournament.findById(req.params.id);
        if (!tournament) return res.status(404).json({ message: 'Tournament not found' });
        if (tournament.participants === undefined || tournament.participants === null) {
            return res.status(409).json({
                message: 'This tournament has unreadable participant data and needs to be repaired first. Run backend/scripts/fixParticipants.js.',
            });
        }

        if (tournament.organizerId.toString() !== req.user.id && req.user.role !== 'Admin') {
            return res.status(403).json({ message: 'Not authorized to manage participants for this tournament' });
        }

        const entry = tournament.participants.find((p) => p.user && p.user.toString() === req.params.userId);
        if (!entry) return res.status(404).json({ message: 'Join request not found' });

        if (status === 'Accepted' && entry.status !== 'Accepted' && acceptedCountOf(tournament) >= tournament.maxCapacity) {
            return res.status(400).json({ message: 'Tournament is at full capacity' });
        }

        entry.status = status;

        // Keep tournament status in sync with capacity now that acceptance drives it.
        const acceptedCount = acceptedCountOf(tournament);
        if (acceptedCount >= tournament.maxCapacity && tournament.status === 'Open') {
            tournament.status = 'Closed';
        } else if (acceptedCount < tournament.maxCapacity && tournament.status === 'Closed') {
            tournament.status = 'Open';
        }

        await tournament.save();
        await tournament.populate('participants.user', 'name email');
        res.json({ ...tournament.toObject(), participants: cleanParticipants(tournament) });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// STS-23: basic input validation shared by create/update
const validateTournamentInput = ({ name, sport, date, maxCapacity }, res) => {
    if (!name || !name.trim()) {
        res.status(400).json({ message: 'Tournament name is required' });
        return false;
    }
    if (!sport || !sport.trim()) {
        res.status(400).json({ message: 'Sport is required' });
        return false;
    }
    if (!date || isNaN(new Date(date).getTime())) {
        res.status(400).json({ message: 'A valid tournament date is required' });
        return false;
    }
    if (maxCapacity === undefined || maxCapacity === null || Number(maxCapacity) <= 0) {
        res.status(400).json({ message: 'Max capacity must be a number greater than 0' });
        return false;
    }
    return true;
};

// REQ-3.1.1: Create Tournament — Organizer can create tournament, setting fields
// like details, date, and max capacity.
const createTournament = async (req, res) => {
    const { name, sport, description, date, registrationDeadline, maxCapacity } = req.body;
    if (!validateTournamentInput({ name, sport, date, maxCapacity }, res)) return;
    try {
        const tournament = await Tournament.create({
            organizerId: req.user.id,
            name,
            sport,
            description,
            date,
            registrationDeadline,
            maxCapacity,
        });
        res.status(201).json(tournament);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// REQ-3.1.2: Edit Tournament — Organizer can edit tournament, changing fields
// like details, date, and max capacity.
const updateTournament = async (req, res) => {
    try {
        const tournament = await Tournament.findById(req.params.id);
        if (!tournament) return res.status(404).json({ message: 'Tournament not found' });

        // Only the organizer who created it (or an Admin) may edit it
        if (tournament.organizerId.toString() !== req.user.id && req.user.role !== 'Admin') {
            return res.status(403).json({ message: 'Not authorized to edit this tournament' });
        }

        const { name, sport, description, date, registrationDeadline, maxCapacity, status } = req.body;
        if (!validateTournamentInput(
            {
                name: name || tournament.name,
                sport: sport || tournament.sport,
                date: date || tournament.date,
                maxCapacity: maxCapacity ?? tournament.maxCapacity,
            },
            res
        )) return;

        tournament.name = name || tournament.name;
        tournament.sport = sport || tournament.sport;
        tournament.description = description || tournament.description;
        tournament.date = date || tournament.date;
        tournament.registrationDeadline = registrationDeadline || tournament.registrationDeadline;
        tournament.maxCapacity = maxCapacity ?? tournament.maxCapacity;
        tournament.status = status || tournament.status;

        const updated = await tournament.save();
        res.json(updated);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// REQ-3.1.3: Delete Tournament — Organizer can delete/cancel tournament.
const deleteTournament = async (req, res) => {
    try {
        const tournament = await Tournament.findById(req.params.id);
        if (!tournament) return res.status(404).json({ message: 'Tournament not found' });

        if (tournament.organizerId.toString() !== req.user.id && req.user.role !== 'Admin') {
            return res.status(403).json({ message: 'Not authorized to delete this tournament' });
        }

        await Tournament.findByIdAndDelete(req.params.id);
        res.json({ message: 'Tournament deleted' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// REQ-3.2: Join Tournament — Participant can request to join an upcoming, open
// tournament before its deadline. This creates a `Pending` request; it only
// becomes a confirmed slot once the organizer accepts it (STS-13).
const joinTournament = async (req, res) => {
    try {
        const tournament = await Tournament.findById(req.params.id);
        if (!tournament) return res.status(404).json({ message: 'Tournament not found' });
        if (tournament.participants === undefined || tournament.participants === null) {
            return res.status(409).json({
                message: 'This tournament has unreadable participant data and needs to be repaired before anyone can join. Run backend/scripts/fixParticipants.js.',
            });
        }

        if (tournament.status !== 'Open') {
            return res.status(400).json({ message: 'Tournament is not open for registration' });
        }
        if (new Date(tournament.date) < new Date()) {
            return res.status(400).json({ message: 'Cannot join a tournament that has already taken place' });
        }
        if (tournament.registrationDeadline && new Date() > new Date(tournament.registrationDeadline)) {
            return res.status(400).json({ message: 'Registration deadline has passed' });
        }
        if (acceptedCountOf(tournament) >= tournament.maxCapacity) {
            return res.status(400).json({ message: 'Tournament is at full capacity' });
        }

        const existing = tournament.participants.find((p) => p.user && p.user.toString() === req.user.id);
        if (existing) {
            if (existing.status === 'Rejected') {
                // Allow requesting again after a prior denial.
                existing.status = 'Pending';
                existing.joinedAt = new Date();
            } else {
                return res.status(400).json({
                    message: existing.status === 'Accepted' ? 'Already joined this tournament' : 'Join request already pending',
                });
            }
        } else {
            tournament.participants.push({ user: req.user.id, status: 'Pending' });
        }

        await tournament.save();
        res.json({ ...tournament.toObject(), participants: cleanParticipants(tournament) });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// REQ-3.2: Withdraw from Tournament — Participant can cancel their own request
// or leave a tournament they were already accepted into, as long as it hasn't
// already taken place. Frees a capacity slot if they were Accepted, so a
// tournament that had auto-closed on reaching capacity reopens.
const withdrawFromTournament = async (req, res) => {
    try {
        const tournament = await Tournament.findById(req.params.id);
        if (!tournament) return res.status(404).json({ message: 'Tournament not found' });
        if (tournament.participants === undefined || tournament.participants === null) {
            return res.status(409).json({
                message: 'This tournament has unreadable participant data and needs to be repaired before it can be updated. Run backend/scripts/fixParticipants.js.',
            });
        }

        if (!tournament.participants.some((p) => p.user && p.user.toString() === req.user.id)) {
            return res.status(400).json({ message: 'You have not joined this tournament' });
        }
        if (new Date(tournament.date) < new Date()) {
            return res.status(400).json({ message: 'Cannot withdraw from a tournament that has already taken place' });
        }

        tournament.participants = tournament.participants.filter(
            (p) => !(p.user && p.user.toString() === req.user.id)
        );
        if (tournament.status === 'Closed' && acceptedCountOf(tournament) < tournament.maxCapacity) {
            tournament.status = 'Open';
        }
        await tournament.save();
        res.json({ ...tournament.toObject(), participants: cleanParticipants(tournament) });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
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
};

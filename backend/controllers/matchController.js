const Match = require('../models/Match');
const Tournament = require('../models/Tournament');

// List matches for a tournament (used by REQ-4 scheduling/results views)
const getMatchesByTournament = async (req, res) => {
    try {
        const matches = await Match.find({ tournamentId: req.params.tournamentId })
            .populate('participants', 'name')
            .populate('winner', 'name')
            .sort({ date: 1 });
        res.json(matches);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// STS-19: Show Results on Homepage — most recently completed matches, platform-wide.
const getRecentResults = async (req, res) => {
    try {
        const results = await Match.find({ status: 'Completed' })
            .populate('tournamentId', 'name sport')
            .populate('participants', 'name')
            .populate('winner', 'name')
            .sort({ updatedAt: -1 })
            .limit(6);
        res.json(results);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Task-05: Scheduling validation — match participants must already be registered
// (and accepted, not just pending/denied) for the tournament; can't schedule
// someone who never joined or whose join request hasn't been approved yet.
const validateMatchParticipants = (tournament, participantIds, res) => {
    if (!participantIds || participantIds.length === 0) {
        res.status(400).json({ message: 'At least one participant is required' });
        return false;
    }
    if (tournament.participants === undefined || tournament.participants === null) {
        res.status(409).json({
            message: 'This tournament has unreadable participant data and needs to be repaired first. Run backend/scripts/fixParticipants.js.',
        });
        return false;
    }
    const registered = new Set(
        tournament.participants
            .filter((p) => p.user && p.status === 'Accepted')
            .map((p) => p.user.toString())
    );
    const invalid = participantIds.filter((id) => !registered.has(id.toString()));
    if (invalid.length > 0) {
        res.status(400).json({ message: 'All match participants must already be registered (and accepted) for the tournament' });
        return false;
    }
    return true;
};

// REQ-4.1: Create Match — Organizer can assign match date, venue and participants.
const createMatch = async (req, res) => {
    const { tournamentId, participants, date, venue } = req.body;
    try {
        const tournament = await Tournament.findById(tournamentId);
        if (!tournament) return res.status(404).json({ message: 'Tournament not found' });

        if (tournament.organizerId.toString() !== req.user.id && req.user.role !== 'Admin') {
            return res.status(403).json({ message: 'Not authorized to schedule matches for this tournament' });
        }
        if (!date) return res.status(400).json({ message: 'Match date is required' });
        if (!validateMatchParticipants(tournament, participants, res)) return;

        const match = await Match.create({ tournamentId, participants, date, venue });
        res.status(201).json(match);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const updateMatch = async (req, res) => {
    try {
        const match = await Match.findById(req.params.id).populate('tournamentId');
        if (!match) return res.status(404).json({ message: 'Match not found' });

        const tournament = match.tournamentId;
        if (tournament.organizerId.toString() !== req.user.id && req.user.role !== 'Admin') {
            return res.status(403).json({ message: 'Not authorized to edit this match' });
        }

        const { date, venue, participants, status } = req.body;
        if (participants && !validateMatchParticipants(tournament, participants, res)) return;

        match.date = date || match.date;
        match.venue = venue || match.venue;
        match.participants = participants || match.participants;
        match.status = status || match.status;

        const updated = await match.save();
        res.json(updated);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// REQ-4.2: Record Results — record scores and winners for completed matches.
const recordResult = async (req, res) => {
    const { scores, winner } = req.body;
    try {
        const match = await Match.findById(req.params.id).populate('tournamentId');
        if (!match) return res.status(404).json({ message: 'Match not found' });

        const tournament = match.tournamentId;
        if (tournament.organizerId.toString() !== req.user.id && req.user.role !== 'Admin') {
            return res.status(403).json({ message: 'Not authorized to record results for this match' });
        }

        match.scores = scores || match.scores;
        match.winner = winner || match.winner;
        match.status = 'Completed';

        const updated = await match.save();
        res.json(updated);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const deleteMatch = async (req, res) => {
    try {
        const match = await Match.findById(req.params.id).populate('tournamentId');
        if (!match) return res.status(404).json({ message: 'Match not found' });

        const tournament = match.tournamentId;
        if (tournament.organizerId.toString() !== req.user.id && req.user.role !== 'Admin') {
            return res.status(403).json({ message: 'Not authorized to delete this match' });
        }

        await Match.findByIdAndDelete(req.params.id);
        res.json({ message: 'Match deleted' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// STS-15/18 (Participant view): matches for tournaments the current user has
// joined — used to populate the Participant Dashboard's Upcoming Schedule and
// Recent Results sections in one call, split by status on the frontend.
const getMyMatches = async (req, res) => {
    try {
        const matches = await Match.find({ participants: req.user.id })
            .populate('tournamentId', 'name sport')
            .populate('participants', 'name')
            .populate('winner', 'name')
            .sort({ date: 1 });
        res.json(matches);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { getMatchesByTournament, getRecentResults, getMyMatches, createMatch, updateMatch, recordResult, deleteMatch };

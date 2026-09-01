const mongoose = require('mongoose');

// REQ-4.1: Create Match — Organizer can assign match date, venue and participants.
// REQ-4.2: Record Results — record scores and winners for completed matches.
const matchSchema = new mongoose.Schema(
    {
        tournamentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Tournament', required: true },
        participants: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }],
        date: { type: Date, required: true },
        venue: { type: String },
        status: {
            type: String,
            enum: ['Scheduled', 'Completed', 'Cancelled'],
            default: 'Scheduled',
        },
        scores: [
            {
                participant: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
                score: { type: Number },
            },
        ],
        winner: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    },
    { timestamps: true }
);

module.exports = mongoose.model('Match', matchSchema);

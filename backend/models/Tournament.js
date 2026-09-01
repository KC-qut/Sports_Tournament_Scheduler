const mongoose = require('mongoose');

// REQ-3.1: Create and Manage Tournament
// Organizer can create, edit, and delete tournament. Fields: details, date, max capacity.
// REQ-3.2: Join Tournament — tracked via `participants`. A join is a `Pending`
// request until the organizer accepts/denies it (STS-13); it only counts
// against `maxCapacity` and only becomes match-eligible once `Accepted`.
const tournamentSchema = new mongoose.Schema(
    {
        organizerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
        name: { type: String, required: true },
        sport: { type: String, required: true },
        description: { type: String },
        date: { type: Date, required: true },
        registrationDeadline: { type: Date },
        maxCapacity: { type: Number, required: true },
        status: {
            type: String,
            enum: ['Open', 'Closed', 'Completed', 'Cancelled'],
            default: 'Open',
        },
        participants: [
            {
                user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
                status: {
                    type: String,
                    enum: ['Pending', 'Accepted', 'Rejected'],
                    default: 'Pending',
                },
                joinedAt: { type: Date, default: Date.now },
            },
        ],
    },
    { timestamps: true }
);

module.exports = mongoose.model('Tournament', tournamentSchema);

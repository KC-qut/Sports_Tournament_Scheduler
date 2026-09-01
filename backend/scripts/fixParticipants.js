// One-time repair script for the `tournaments` collection.
//
// Why this exists: this app's Tournament schema stores `participants` as
// `[{ user, status, joinedAt }]` — a join request that's Pending until the
// organizer accepts or denies it. If a document in your database was ever
// written by a *different* version of this app that stored participants as
// a flat array of user ObjectIds instead (no accept/deny concept), the
// current schema can't cast that shape into subdocuments when reading it —
// each malformed entry ends up with `user: undefined`, `status: 'Pending'`
// (the schema default), and a freshly-generated `_id` that has nothing to
// do with the original user. That's what causes accept/deny actions, joins,
// and match scheduling to either silently skip that participant or return
// "unreadable participant data" errors.
//
// This script talks to the raw MongoDB collection (bypassing Mongoose
// schema casting entirely) so it can see the *actual* stored shape of every
// document, and rewrites `participants` into the `{ user, status,
// joinedAt }` shape this app's schema expects:
//   - already `{ user, status, joinedAt }` objects  -> left alone
//   - missing / null                                -> set to []
//   - flat ObjectIds (old simpler-join-model shape)  -> wrapped as
//                                                       { user: id, status:
//                                                       'Accepted' }, since
//                                                       being in that flat
//                                                       array meant they
//                                                       were already a
//                                                       confirmed
//                                                       registration under
//                                                       that model
//
// Usage (from the backend/ directory, with your .env MONGO_URI set):
//   node scripts/fixParticipants.js
//   (or: npm run fix:participants)
//
// It only writes to documents that actually need fixing, and prints a
// summary of what it changed. Safe to run more than once.

require('dotenv').config();
const mongoose = require('mongoose');

const isAlreadyCorrectEntry = (entry) =>
    entry &&
    typeof entry === 'object' &&
    !(entry instanceof mongoose.Types.ObjectId) &&
    'user' in entry &&
    'status' in entry;

const normalizeParticipants = (raw) => {
    if (raw === undefined || raw === null) return { changed: true, value: [] };
    if (!Array.isArray(raw)) return { changed: true, value: [] };

    let changed = false;
    const value = [];
    for (const entry of raw) {
        if (isAlreadyCorrectEntry(entry)) {
            value.push(entry);
        } else if (entry) {
            // A bare ObjectId (or ObjectId-like string) from the flat-array
            // model — treat prior membership as an already-confirmed join.
            changed = true;
            value.push({ user: entry, status: 'Accepted', joinedAt: new Date() });
        } else {
            changed = true; // dropped a null/undefined element
        }
    }
    return { changed, value };
};

const run = async () => {
    if (!process.env.MONGO_URI) {
        console.error('MONGO_URI is not set — copy backend/.env.example to backend/.env and fill it in first.');
        process.exit(1);
    }

    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB.');

    const collection = mongoose.connection.db.collection('tournaments');
    const cursor = collection.find({});

    let inspected = 0;
    let fixed = 0;

    for await (const doc of cursor) {
        inspected += 1;
        const { changed, value } = normalizeParticipants(doc.participants);
        if (changed) {
            await collection.updateOne({ _id: doc._id }, { $set: { participants: value } });
            fixed += 1;
            console.log(`Fixed "${doc.name || doc._id}" — ${value.length} participant(s) kept.`);
        }
    }

    console.log(`\nDone. Inspected ${inspected} tournament(s), fixed ${fixed}.`);
    await mongoose.disconnect();
    process.exit(0);
};

run().catch((err) => {
    console.error('Migration failed:', err);
    process.exit(1);
});

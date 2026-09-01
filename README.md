# Sports Tournament Scheduler

A MERN-stack scaffold adapted from the `taskmanager` reference repo, mapped to the
Sport Tournament Scheduler requirement diagram (REQ-1 through REQ-5).

## What's reused from Taskmanager (unchanged or near-unchanged)
- `backend/config/db.js` — MongoDB connection
- `backend/middleware/authMiddleware.js` — JWT `protect`; added a new `authorize(...roles)` helper
- `backend/routes/authRoutes.js`, `backend/controllers/authController.js` — register/login/profile (REQ-2.1)
- `frontend/src/axiosConfig.jsx`, `frontend/src/context/AuthContext.js`
- Tailwind/CRA build setup (`tailwind.config.js`, `index.css`, `public/`)

## Design system
The Homepage, Organizer Dashboard, and Participant Dashboard are styled after the
GameDay Figma design (dark theme, lime `#cf0` accent) — bare-minimum implementation:
plain Tailwind arbitrary-value classes (no new dependencies, no design-token file).
- `components/Sidebar.jsx` — shared shell for both post-login dashboards
- `pages/Dashboard.jsx` — single `/dashboard` route, renders Organizer or Participant
  dashboard based on `user.role`
- `pages/OrganizerDashboard.jsx` — sidebar + the existing tournament CRUD (unchanged logic)
- `pages/CreateTournament.jsx` — Create Tournament split out onto its own page/route
  (`/tournaments/new`), reachable from the sidebar, matching the Figma design's separate
  "create-tournament" frame rather than being an inline form on the Dashboard. Editing an
  existing tournament still happens inline on the Dashboard via `TournamentForm.jsx`.
- `pages/ParticipantDashboard.jsx` — sidebar + joined tournaments
- The public top-`Navbar` is hidden on sidebar-driven routes (`/dashboard`,
  `/joined-tournaments`, `/tournaments/:id/participants`) to avoid a double nav bar —
  see `AppLayout` in `App.js`
- `pages/MyTournaments.jsx` was retired — superseded by `OrganizerDashboard.jsx`

## What's new for this app
- `Tournament` and `Match` models, controllers, and routes (REQ-1, REQ-3, REQ-4)
- Role field on `User` (Admin / Organizer / Participant) — REQ-2.2
- Public, unauthenticated discovery + search endpoints — REQ-1
- Join-tournament logic with capacity/deadline checks — REQ-3.2
- Withdraw from a tournament after joining — frees the capacity slot and reopens the
  tournament if it had auto-closed; blocked once the tournament date has passed
- Join is now blocked for tournaments whose date has already passed, even if no
  registration deadline was set (previously only the deadline was checked)
- Organizer can see the actual list of participants (name + email) directly on
  `TournamentDetail.jsx`, not just a capacity count — complements the dedicated
  `TournamentParticipants.jsx` page (STS-13)
- Joined-tournaments view for participants — STS-12
- Organizer's participant-list view per tournament — STS-13
- Upcoming/Recent split on the homepage — STS-02 / STS-03
- Basic input validation on registration and tournament create/edit — STS-23
- Match scheduling validation — match participants must already be registered for the
  tournament — Task-05 (Sprint 3)
- Organizer match management on `TournamentDetail.jsx` — create match (STS-14), edit
  match (STS-16), record result (STS-17), delete match — visible only to the tournament's
  owning organizer (or Admin)
- Recent Results section on the homepage — STS-19 — `GET /api/matches/recent`
- Admin Dashboard — `AdminDashboard.jsx`, `adminController.js`, `adminRoutes.js` — user
  management (list, change role, delete — STS-21) and platform-wide tournament
  management (STS-22), plus a summary of user/tournament counts (STS-20)
- Participant Dashboard rebuilt with a top-nav layout (`ParticipantTopNav.jsx`) instead
  of the shared Organizer/Admin sidebar — matches the verified Figma design, which fixes
  this as a top-nav (Dashboard/Schedule/Results/Tournaments) as early as the low-fidelity
  wireframe.
- Schedule (`ParticipantSchedule.jsx`) and Results (`ParticipantResults.jsx`) are now
  their own pages/routes (`/schedule`, `/results`), reachable directly from the top nav —
  not aliased to the Dashboard. Both list every matching match across every tournament
  the user has joined, backed by a new `GET /api/matches/mine` endpoint, and both show a
  specific empty-state message (not just a blank page) when there's nothing to show.
  `ParticipantDashboard.jsx` keeps short previews of each (top 3) with "View Full
  Schedule" / "View All Results" links through to the full pages.
- Inline error messages instead of generic `alert()`s on Login, Register, Profile, and
  Join Tournament — the real backend message (e.g. "Password must be at least 6
  characters") now reaches the user instead of a blanket "failed, try again"
- `ProtectedRoute` component for client-side route gating (Taskmanager had none)
- `Home.jsx`, `TournamentDetail.jsx`, `TournamentForm.jsx`, `TournamentList.jsx`,
  `JoinedTournaments.jsx`, `TournamentParticipants.jsx`, `OrganizerDashboard.jsx`,
  `CreateTournament.jsx`, `ParticipantDashboard.jsx`, `ParticipantTopNav.jsx`,
  `ParticipantSchedule.jsx`, `ParticipantResults.jsx`,
  `AdminDashboard.jsx`, `Dashboard.jsx`, `Sidebar.jsx`,
  `MatchForm.jsx`, `RecordResultForm.jsx`

## Requirement coverage

| Req | Description | Status |
|---|---|---|
| REQ-1.1 | Public Homepage | ✅ `Home.jsx` + `GET /api/tournaments` |
| REQ-1.2 | Tournament Search | ✅ `GET /api/tournaments/search?q=` |
| REQ-1.3 | Tournament Display (recent + upcoming) | ✅ `Home.jsx` splits into Upcoming/Recent sections |
| REQ-2.1 | Login/Registration | ✅ reused from Taskmanager, now with input validation |
| REQ-2.2 | Role-Based Access | ✅ `User.role` + `authorize()` middleware |
| REQ-3.1.1–3 | Create/Edit/Delete Tournament | ✅ `tournamentController.js`, validated fields |
| REQ-3.2 | Join Tournament | ✅ `joinTournament` (checks status, deadline, capacity) |
| STS-12 | View Joined Tournaments | ✅ `getJoinedTournaments` + `JoinedTournaments.jsx` |
| STS-13 | Organizer Views Participants | ✅ `getTournamentParticipants` + `TournamentParticipants.jsx` — includes Accept/Deny actions on each `Pending` request |
| STS-14 | Create Match | ✅ `createMatch` + `MatchForm.jsx` (organizer-only, on `TournamentDetail.jsx`) |
| STS-15 | View Tournament Schedule | ✅ `getMatchesByTournament`, read-only list on `TournamentDetail.jsx` |
| STS-16 | Edit Match | ✅ `updateMatch` + `MatchForm.jsx` (edit mode) |
| STS-17 | Record Match Result | ✅ `recordResult` + `RecordResultForm.jsx` |
| STS-18 | View Tournament Results | ✅ winner/status shown inline per match on `TournamentDetail.jsx` |
| STS-19 | Show Results on Homepage | ✅ `getRecentResults` + Recent Results section on `Home.jsx` |
| Task-05 | Scheduling validation | ✅ match participants must be registered tournament participants |
| STS-20 | Admin Dashboard | ✅ `getDashboardSummary` + summary cards on `AdminDashboard.jsx` |
| STS-21 | Manage Users | ✅ `getAllUsers`/`updateUserRole`/`deleteUser` + user table on `AdminDashboard.jsx` |
| STS-22 | Manage Tournaments | ✅ `getAllTournaments` + reused `TournamentForm`/`TournamentList` on `AdminDashboard.jsx` |
| REQ-5 | Admin platform-wide management | ✅ see STS-20/21/22 above — Epic 7 is now functionally complete |

**Sprint 1, 2, and 3 are fully implemented.** Sprint 4 (automated tests, EC2 deployment,
and the Admin bootstrap fix noted below) remains outstanding.

## Known gaps / things to check before relying on this

- **Admin bootstrap problem**: `registerUser` deliberately only allows self-registration
  as `Organizer` or `Participant` (correct security practice — nobody should be able to
  grant themselves platform-wide admin rights via the public signup form). This means
  **no Admin account can exist until one is created manually** — see Setup below. Once
  the first Admin exists, they can promote any other user to Admin via Manage Users.
- **Deleting a user does not cascade.** If an Organizer who owns tournaments is deleted,
  their tournaments are not reassigned or removed — `Tournament.organizerId` will point
  to a user that no longer exists, and that tournament's detail/edit/delete calls will
  start failing their ownership check. Not handled — flagging rather than guessing at
  the right cascade behaviour (reassign to Admin? soft-delete? block the deletion?) that's
  worth agreeing on before this is used with real data.
- **Session persistence**: `AuthContext` holds the user only in memory (`useState`), same as
  the original Taskmanager — a page refresh logs the user out. Consider persisting to
  `localStorage` and rehydrating on load if you want sessions to survive a refresh.
- **Input validation** is intentionally lightweight (required fields, basic email format,
  password length, capacity > 0) rather than a full validation library — good enough for
  Sprint 2, worth revisiting with `express-validator` if the grading rubric wants more.
- **Participant/Admin Figma frames are now verified** (confirmed via direct screenshot
  export, since the Figma API remained rate-limited) — `ParticipantDashboard.jsx` was
  rebuilt with a top-nav layout to match, and Schedule/Results now have their own
  dedicated pages (`/schedule`, `/results`). Remaining known divergence from the verified
  design, not yet closed: Organizer Dashboard is missing the stat block/Recent
  Results/Upcoming Matches widgets shown in Figma; Admin Manage Users has no Suspend/Ban
  (only role change and delete — the design implies a status field the `User` model
  doesn't have). Full detail in the UI/UX Design Report.
- A bug in the original `User.js` (`pre('save')` hook never called `next()`, which could hang
  requests) has been fixed in this scaffold's version.
- A gap in the Admin Dashboard was fixed: the role dropdown in Manage Users had no
  guard against an admin accidentally changing their own role (the delete button already
  correctly disabled itself for the current user, but the role selector didn't match it).
  Both the frontend (`disabled` on the select) and the backend (`updateUserRole` now
  rejects `req.params.id === req.user.id`) now block this.
- A leftover bug from Taskmanager was fixed: `Login.jsx` redirected to `/tasks` (a route that
  never existed in this app) after a successful login — every login silently landed on a blank
  page. It now redirects to `/dashboard`.
- `Task.remove()` (deprecated Mongoose API) was replaced with `findByIdAndDelete` throughout.

## Changes in this pass (crash fix + data repair + confirmation modal)
- **Root cause of the "Cannot read properties of undefined (reading 'length')"
  crash on the homepage**: this database has `tournaments` documents saved
  under two incompatible shapes for `participants` — some as a flat array of
  user IDs (this app's current schema), others as `[{ user, status,
  joinedAt }]` objects (from a different build of this app). When this
  schema tries to read the second shape, Mongoose can't cast it and silently
  returns `undefined` instead of `[]`, which crashed anything doing
  `tournament.participants.length`.
- **Fix — backend**: `getPublicTournaments`, `searchTournaments`,
  `getTournamentById`, `getMyTournaments`, `getJoinedTournaments`, and
  `getTournamentParticipants` now always normalize `participants` to `[]`
  before responding, so the API can never send `undefined` again.
  `joinTournament`/`withdrawFromTournament` (which write to the document)
  return a clear 409 instead of silently saving over unreadable data.
  `validateMatchParticipants` does the same for match scheduling.
- **Fix — frontend**: `Home.jsx`, `TournamentDetail.jsx`,
  `TournamentParticipants.jsx`, `TournamentList.jsx` all guard with `|| []`
  as defense in depth, even though the backend should never send `undefined`
  now.
- **New: `backend/scripts/fixParticipants.js`** — a one-time repair script
  (run via `npm run fix:participants` from `backend/`) that talks to the raw
  MongoDB collection directly (bypassing Mongoose casting) so it can see the
  true stored shape of every tournament document, and rewrites `participants`
  into the flat-ID shape this schema expects — keeping only users whose
  legacy status was `Accepted`. **Run this once against your real database**;
  until you do, any tournament with corrupted data will refuse joins/
  withdrawals/match-scheduling with a 409 rather than crash.
- **Delete Tournament confirmation**: deleting a tournament (Organizer/Admin)
  no longer fires immediately on click — it now opens a confirmation modal
  (`ConfirmDeleteModal.jsx`) naming the tournament, since deletion also
  removes its participants, matches, and results.
- **Admin Dashboard**: Users and Tournaments sections now render directly on
  page load instead of being hidden behind tab buttons (the default tab had
  no button of its own, so neither list was reachable without already
  knowing to click one). Users list now also shows a color-coded role badge.

## Changes in this pass (Organizer accept/deny join requests)
- **Feature**: joining a tournament is no longer instant registration —
  `participants` is now `[{ user, status: Pending/Accepted/Rejected,
  joinedAt }]` instead of a flat array of user ids. A join creates a
  `Pending` request; it only counts against `maxCapacity` and only becomes
  match-eligible once the organizer accepts it from the "Manage
  Participants" page (`TournamentParticipants.jsx`, reached via
  `/tournaments/:id/participants`), which now shows Accept/Deny buttons per
  request instead of a read-only list.
- `joinTournament` unchanged in spirit (still checks Open/upcoming/deadline/
  capacity) but now pushes a `Pending` entry; re-requesting after a prior
  `Rejected` is allowed. `withdrawFromTournament` removes the participant's
  own entry regardless of status (cancels a pending request, or leaves after
  being accepted) and reopens the tournament if that frees a capacity slot.
- New endpoint `PUT /api/tournaments/:id/participants/:userId` (Organizer/
  Admin only, ownership checked) accepts or denies a request; capacity is
  now measured against **accepted** participants only, and the tournament
  auto-closes/reopens as accepted count crosses `maxCapacity`.
- `validateMatchParticipants` (match scheduling) now requires `Accepted`
  status, not just "ever requested to join".
- Every place reading `tournament.participants` as a flat list of users
  (`TournamentDetail.jsx`, `TournamentParticipants.jsx`, `Home.jsx`,
  `TournamentList.jsx`, `JoinedTournaments.jsx`, `ParticipantDashboard.jsx`,
  `MatchForm.jsx`'s participants prop) was updated for the new
  `{ user, status }` shape — accepted counts for capacity, status badges on
  the participant's own joined-tournaments views.
- **`backend/scripts/fixParticipants.js` flipped direction again**: since
  the schema now targets `{ user, status, joinedAt }`, the script normalizes
  the opposite way from the previous pass — any flat ObjectId left over from
  the simpler join model is wrapped as `{ user: id, status: 'Accepted' }`
  (being in that old array meant an already-confirmed registration).
  Already-correct subdocuments and missing/null are handled as before. Run
  it again (`npm run fix:participants`) if you have tournaments predating
  this change.

## Changes in this pass (reconciled Match-participants null guards)
- A parallel edit (made outside this conversation, on a copy of the app
  taken before the accept/deny pass above) had added `(x.participants || [])`
  guards around **Match** document participants — a different field from
  `Tournament.participants` covered above — in `MatchForm.jsx`,
  `RecordResultForm.jsx`, `ParticipantResults.jsx`, `ParticipantSchedule.jsx`,
  `Home.jsx`, `ParticipantDashboard.jsx`, and `TournamentDetail.jsx`. This
  pass merges those guards back in so both fixes are present together —
  they don't conflict with the accept/deny work since they touch a
  different field.

## Setup

```bash
npm run install-all      # installs root, backend, and frontend deps
```

Create `backend/.env` from `backend/.env.example` and fill in your MongoDB URI and JWT secret:

```
MONGO_URI=<your MongoDB connection string>
JWT_SECRET=<a long random string>
PORT=5001
```

Then run both servers together:

```bash
npm run dev
```

Backend runs on `http://localhost:5001`, frontend on `http://localhost:3000`.

### Creating the first Admin account

Register normally as an Organizer or Participant, then promote that user directly in
MongoDB (there is no seed script yet):

```js
// mongosh, or MongoDB Compass
db.users.updateOne({ email: "you@example.com" }, { $set: { role: "Admin" } })
```

Log out and back in for the new role to take effect (the JWT/role is set at login time).
Every Admin after the first can be created through Manage Users instead.

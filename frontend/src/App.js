import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import Home from './pages/Home';
import TournamentDetail from './pages/TournamentDetail';
import Login from './pages/Login';
import Register from './pages/Register';
import Profile from './pages/Profile';
import Dashboard from './pages/Dashboard';
import CreateTournament from './pages/CreateTournament';
import ParticipantSchedule from './pages/ParticipantSchedule';
import ParticipantResults from './pages/ParticipantResults';
import JoinedTournaments from './pages/JoinedTournaments';
import TournamentParticipants from './pages/TournamentParticipants';
import OrganizerJoinRequests from './pages/OrganizerJoinRequests';

// The Sidebar-based dashboards have their own nav/logout — only show the
// public top-nav on pages that use the plain page layout.
const sidebarRoutes = [/^\/dashboard/, /^\/joined-tournaments/, /^\/join-requests/, /^\/schedule$/, /^\/results$/, /^\/tournaments\/new$/, /^\/tournaments\/[^/]+\/participants$/];

function AppLayout() {
  const location = useLocation();
  const showNavbar = !sidebarRoutes.some((pattern) => pattern.test(location.pathname));

  return (
    <>
      {showNavbar && <Navbar />}
      <Routes>
        {/* REQ-1: Public discovery — no auth required */}
        <Route path="/" element={<Home />} />
        <Route path="/tournaments/:id" element={<TournamentDetail />} />

        {/* REQ-2: Authentication */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Authenticated */}
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          }
        />

        {/* REQ-3: post-login landing — Organizer or Participant dashboard by role */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />

        {/* REQ-3.1.1: Create Tournament — its own page, reachable from the sidebar,
            not an inline form on the dashboard (matches the Figma "create-tournament" frame) */}
        <Route
          path="/tournaments/new"
          element={
            <ProtectedRoute roles={['Organizer', 'Admin']}>
              <CreateTournament />
            </ProtectedRoute>
          }
        />

        {/* STS-13: Organizer Views Participants */}
        <Route
          path="/tournaments/:id/participants"
          element={
            <ProtectedRoute roles={['Organizer', 'Admin']}>
              <TournamentParticipants />
            </ProtectedRoute>
          }
        />

        {/* Organizer join-request overview across all tournaments */}
        <Route
          path="/join-requests"
          element={
            <ProtectedRoute roles={['Organizer', 'Admin']}>
              <OrganizerJoinRequests />
            </ProtectedRoute>
          }
        />

        {/* STS-12: View Joined Tournaments — any authenticated user */}
        <Route
          path="/joined-tournaments"
          element={
            <ProtectedRoute>
              <JoinedTournaments />
            </ProtectedRoute>
          }
        />

        {/* STS-15 (Participant view): Schedule — own page, reachable from ParticipantTopNav */}
        <Route
          path="/schedule"
          element={
            <ProtectedRoute>
              <ParticipantSchedule />
            </ProtectedRoute>
          }
        />

        {/* STS-18 (Participant view): Results — own page, reachable from ParticipantTopNav */}
        <Route
          path="/results"
          element={
            <ProtectedRoute>
              <ParticipantResults />
            </ProtectedRoute>
          }
        />
      </Routes>
    </>
  );
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppLayout />
      </Router>
    </AuthProvider>
  );
}

export default App;

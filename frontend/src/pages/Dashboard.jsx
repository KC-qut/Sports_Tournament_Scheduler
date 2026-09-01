import { useAuth } from '../context/AuthContext';
import OrganizerDashboard from './OrganizerDashboard';
import ParticipantDashboard from './ParticipantDashboard';
import AdminDashboard from './AdminDashboard';

// A single /dashboard route so login can redirect to one place regardless of
// role, and each dashboard stays a separate, independently readable file.
const Dashboard = () => {
  const { user } = useAuth();

  if (user?.role === 'Admin') {
    return <AdminDashboard />;
  }
  if (user?.role === 'Organizer') {
    return <OrganizerDashboard />;
  }
  return <ParticipantDashboard />;
};

export default Dashboard;

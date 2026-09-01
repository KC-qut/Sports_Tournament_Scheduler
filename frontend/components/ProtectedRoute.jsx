import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// New for Sports Tournament Scheduler — Taskmanager had no client-side route
// gating (it relied on the API alone). Wrap routes that require login,
// optionally restricted to specific roles (REQ-2.2).
const ProtectedRoute = ({ children, roles }) => {
  const { user } = useAuth();

  if (!user) return <Navigate to="/login" replace />;
  if (roles && !roles.includes(user.role)) return <Navigate to="/" replace />;

  return children;
};

export default ProtectedRoute;

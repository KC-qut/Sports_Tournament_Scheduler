import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// Styled after the GameDay Figma Participant Dashboard: a top-nav layout,
// distinct from the sidebar shared by Organizer/Admin. This was a real gap
// found when comparing the verified Figma export against the implementation —
// the design fixes this top-nav as early as the low-fidelity wireframe.
const ParticipantTopNav = ({ children }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  // Each nav item now has its own dedicated route/page — Schedule and Results
  // are no longer aliased to the Dashboard.
  const navItems = [
    { to: '/dashboard', label: 'Dashboard' },
    { to: '/schedule', label: 'Schedule' },
    { to: '/results', label: 'Results' },
    { to: '/', label: 'Tournaments' },
  ];

  return (
    <div className="min-h-screen bg-[#0b0e14]">
      <nav className="bg-[#0b0e14] border-b border-[#2a3547] px-8 py-3 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-3">
          <div className="bg-[#cf0] rounded-[10px] size-9 flex items-center justify-center text-[#0b0e14] font-black">
            GD
          </div>
          <span className="font-black text-white text-lg uppercase">GameDay</span>
        </Link>

        <div className="flex items-center gap-6">
          {navItems.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className={
                location.pathname === item.to
                  ? 'text-[#cf0] font-bold text-sm'
                  : 'text-[#94a3b8] font-semibold text-sm hover:text-white'
              }
            >
              {item.label}
            </Link>
          ))}
        </div>

        <div className="flex items-center gap-3">
          <div className="text-right">
            <p className="text-white text-sm font-bold leading-tight">{user?.name}</p>
            <p className="text-[#94a3b8] text-xs leading-tight">{user?.role}</p>
          </div>
          <button
            onClick={handleLogout}
            className="border border-[#2a3547] text-white text-sm font-bold px-3 py-1.5 rounded-lg"
          >
            Logout
          </button>
        </div>
      </nav>

      <main className="p-8">{children}</main>
    </div>
  );
};

export default ParticipantTopNav;

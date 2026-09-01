import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// Bare-minimum shared sidebar shell for the post-login dashboards, styled after
// the GameDay Figma design (dark theme, lime accent). `navItems` is supplied by
// each dashboard so Organizer and Participant get different links without
// duplicating the whole shell.
const Sidebar = ({ title, navItems, children }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-[#0b0e14] flex">
      <aside className="w-[240px] bg-[#0f141b] border-r border-[#2a3547] flex flex-col gap-6 p-5 shrink-0">
        <Link to="/" className="flex items-center gap-3">
          <div className="bg-[#cf0] rounded-[10px] size-9 flex items-center justify-center text-[#0b0e14] font-black">
            GD
          </div>
          <div>
            <p className="font-black text-white text-lg uppercase leading-none">GameDay</p>
            <p className="text-[#94a3b8] text-xs">{title}</p>
          </div>
        </Link>

        <nav className="flex flex-col gap-2">
          {navItems.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className="rounded-xl px-3 py-2 text-sm font-semibold text-[#94a3b8] border border-[#2a3547] bg-[#171e2c] hover:text-white"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="mt-auto pt-3 border-t border-[#2a3547]">
          <p className="text-white text-sm font-bold">{user?.name}</p>
          <p className="text-[#94a3b8] text-xs mb-3">{user?.role}</p>
          <button
            onClick={handleLogout}
            className="w-full bg-[#2c1e1a] border border-[rgba(239,68,68,0.2)] text-[#ef4444] text-sm font-semibold rounded-lg py-2"
          >
            Logout
          </button>
        </div>
      </aside>

      <main className="flex-1 p-8">{children}</main>
    </div>
  );
};

export default Sidebar;

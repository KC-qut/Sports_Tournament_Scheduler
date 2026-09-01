import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// Styled after the GameDay Figma "top-nav": dark background, lime brand
// accent. Kept to one shared component for both logged-out and logged-in
// states, rather than a separate design per state.
const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className="bg-[#0b0e14] border-b border-[#2a3547] px-8 py-3 flex items-center justify-between">
      <Link to="/" className="flex items-center gap-3">
        <div className="bg-[#cf0] rounded-[10px] size-9 flex items-center justify-center text-[#0b0e14] font-black">
          GD
        </div>
        <span className="font-black text-white text-lg uppercase">GameDay</span>
      </Link>

      <div className="flex items-center gap-4">
        <Link to="/" className="text-sm font-semibold text-[#94a3b8] hover:text-white">
          Discover
        </Link>
        {user ? (
          <>
            <Link to="/dashboard" className="text-sm font-semibold text-[#94a3b8] hover:text-white">
              Dashboard
            </Link>
            <Link to="/profile" className="text-sm font-semibold text-[#94a3b8] hover:text-white">
              Profile
            </Link>
            <button
              onClick={handleLogout}
              className="border border-[#2a3547] text-white text-sm font-bold px-4 py-2 rounded-lg"
            >
              Logout
            </button>
          </>
        ) : (
          <>
            <Link
              to="/login"
              className="border border-[#2a3547] text-white text-sm font-bold px-4 py-2 rounded-lg"
            >
              Login
            </Link>
            <Link
              to="/register"
              className="bg-[#cf0] text-[#0b0e14] text-sm font-extrabold px-4 py-2 rounded-lg"
            >
              Join Free
            </Link>
          </>
        )}
      </div>
    </nav>
  );
};

export default Navbar;

import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import ThemeToggle from './ThemeToggle';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  // Clear auth state and return the user to the login page.
  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleLogoClick = (event) => {
    event.preventDefault();
    if (window.location.pathname === '/') {
      window.location.reload();
    } else {
      navigate('/');
    }
  };

  return (
    <nav className="border-b border-blue-700/40 bg-gradient-to-r from-slate-900 via-cyan-900 to-blue-950 text-white backdrop-blur sticky top-0 z-50 shadow-xl shadow-slate-950/20">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link to="/" onClick={handleLogoClick} className="flex items-center gap-2 text-xl font-bold text-white hover:opacity-90 transition-opacity">
          <img src="/kritiLogo.png" alt="Kriti logo" className="h-12 w-12 rounded-full object-cover border border-white/20 shadow-lg shadow-cyan-500/10" />
          <span className="text-lg sm:text-xl">Kriti</span>
        </Link>

        <div className="flex items-center gap-4 text-white">
        {/* Navigation and user controls shown in the top navbar. */}
          <ThemeToggle />
          {user ? (
            <>
              <Link to="/" className="text-sm hover:text-primary-600 transition-colors">
                Home
              </Link>
              <Link to="/interview" className="text-sm hover:text-primary-600 transition-colors">
                Interview
              </Link>
              <Link to="/profile" className="text-sm hover:text-primary-600 transition-colors">
                Profile
              </Link>
              <div className="flex items-center gap-2">
                {user.avatar && (
                  <img src={user.avatar} alt="" className="w-8 h-8 rounded-full" />
                )}
                <button onClick={handleLogout} className="text-sm text-red-500 hover:text-red-600">
                  Logout
                </button>
              </div>
            </>
          ) : (
            <>
              <Link to="/login" className="text-sm hover:text-primary-600">
                Login
              </Link>
              <Link to="/register" className="btn-primary text-sm">
                Sign Up
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}

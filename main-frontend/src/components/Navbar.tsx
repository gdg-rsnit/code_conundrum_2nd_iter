import { Link, useLocation, useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import GdgLogo from './GdgLogo';
import { LogOut } from 'lucide-react';
import { toast } from 'sonner';

const API_URL = 'http://localhost:5000/api';

const navItems = [
  { label: 'HOME', path: '/home' },
  { label: 'RULES', path: '/rules' },
  { label: 'REGISTER', path: '/register' },
];

const Navbar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const user = localStorage.getItem('cc_user');

  const handleLogout = async () => {
    try {
      // Call backend to clear the cookie
      await fetch(`${API_URL}/users/logout`, { 
        method: 'POST',
        credentials: 'include'
      });
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Exit fullscreen if active
      if (document.fullscreenElement) {
        document.exitFullscreen().catch(() => {});
      }
      
      // Always clear local storage and redirect
      localStorage.removeItem('cc_user');
      localStorage.removeItem('cc_team');
      localStorage.removeItem('cc_result');
      toast.success('Logged out successfully');
      navigate('/home'); // Redirect to home as requested
    }
  };

  // Disable navigation on contest pages
  const isContestPage =
    location.pathname === '/waiting-room' ||
    location.pathname === '/leaderboard' ||
    location.pathname === '/countdown' ||
    location.pathname === '/contest';

  const visibleNavItems = navItems.filter(item => {
    // Remove REGISTER if already logged in
    if (user && item.path === '/register') return false;
    
    // Remove HOME in navbar of waiting room as requested
    if (location.pathname === '/waiting-room' && item.label === 'HOME') return false;

    // Special handling for other restricted pages
    if (
      (location.pathname === '/waiting-room' ||
        location.pathname === '/leaderboard') &&
      item.path === '/register'
    )
      return false;
      
    return true;
  });

  return (
    <nav className="fixed top-0 left-0 right-0 z-40 bg-space-navy/80 backdrop-blur-sm border-b-4 border-primary/30">
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">

        {/* Logo + title */}
        <Link
          to="/home"
          onClick={(e) => isContestPage && e.preventDefault()}
          className="flex items-center gap-3 group"
        >
          <GdgLogo height={36} />

          <div
            className="hidden sm:block"
            style={{
              width: '2px',
              height: '28px',
              background: 'hsl(180 100% 50% / 0.6)',
            }}
          />

          <span className="font-pixel text-[10px] md:text-xs text-primary neon-text-cyan">
            CODE CONUNDRUM
          </span>
        </Link>

        {/* Nav Links */}
        <div className="hidden md:flex items-center gap-6">
          {visibleNavItems.map(item => (
            <Link
              key={item.path}
              to={item.path}
              onClick={(e) => isContestPage && e.preventDefault()}
              className={cn(
                'font-pixel text-[9px] uppercase tracking-wider transition-all relative pb-1',
                'hover:text-secondary',
                location.pathname === item.path
                  ? 'text-secondary after:absolute after:bottom-0 after:left-0 after:w-full after:h-[2px] after:bg-secondary'
                  : 'text-muted-foreground after:absolute after:bottom-0 after:left-0 after:w-0 after:h-[2px] after:bg-secondary after:transition-all hover:after:w-full'
              )}
            >
              {item.label}
            </Link>
          ))}
          
          {user && (
            <button
              onClick={handleLogout}
              className="font-pixel text-[9px] text-destructive hover:text-destructive/80 transition-all flex items-center gap-2 ml-2"
            >
              <LogOut size={12} />
              LOGOUT
            </button>
          )}
        </div>

        {/* Mobile menu icon + Logout */}
        <div className="md:hidden flex items-center gap-4">
          {user && (
             <button onClick={handleLogout} className="text-destructive hover:scale-110 transition-transform">
               <LogOut size={16} />
             </button>
          )}
          <div className="font-pixel text-primary text-xs">=</div>
        </div>

      </div>
    </nav>
  );
};

export default Navbar;

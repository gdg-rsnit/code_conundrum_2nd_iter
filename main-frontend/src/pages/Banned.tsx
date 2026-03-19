import { useNavigate } from 'react-router-dom';
import StarfieldBackground from '@/components/StarfieldBackground';
import PixelButton from '@/components/PixelButton';

const Banned = () => {
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await fetch('http://localhost:5000/api/users/logout', {
        method: 'POST',
        credentials: 'include',
      });
    } catch {
      // Ignore logout API errors and clear local state anyway.
    }

    localStorage.removeItem('cc_user');
    localStorage.removeItem('cc_team');
    localStorage.removeItem('cc_live_round');
    localStorage.removeItem('cc_result');
    navigate('/home');
  };

  return (
    <div className="relative min-h-screen scanline-overlay flex items-center justify-center px-4">
      <StarfieldBackground showClouds={false} showPlanets opacity={0.45} />

      <div className="relative z-10 w-full max-w-[640px] border-2 border-destructive bg-space-navy p-8 md:p-10 text-center">
        <h1 className="font-pixel text-lg md:text-xl text-destructive mb-4">ACCESS REVOKED</h1>
        <p className="font-mono-tech text-sm md:text-base text-foreground leading-relaxed">
          Your team has been banned from this contest. You cannot access waiting room, contest, or leaderboard pages.
        </p>
        <p className="font-mono-tech text-xs text-muted-foreground mt-4">
          Contact the contest organizers if you think this is a mistake.
        </p>

        <div className="mt-8 flex justify-center">
          <PixelButton variant="danger" onClick={handleLogout}>
            [ LOGOUT ]
          </PixelButton>
        </div>
      </div>
    </div>
  );
};

export default Banned;

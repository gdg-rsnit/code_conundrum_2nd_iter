import React, { useEffect, useState, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import useMonitoring from '@/hooks/useMonitoring';
import { toast } from 'sonner';

const FullscreenEnforcer: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isFullscreen, setIsFullscreen] = useState(!!document.fullscreenElement);
  const location = useLocation();
  
  // Define routes where fullscreen is mandatory
  const mandatoryFullscreenRoutes = ['/contest', '/round-complete', '/countdown'];
  const isMandatory = mandatoryFullscreenRoutes.includes(location.pathname);

  const teamRaw = localStorage.getItem('cc_team');
  const team = teamRaw ? JSON.parse(teamRaw) : null;
  const isLoggedIn = !!team;

  const liveRoundRaw = localStorage.getItem('cc_live_round');
  const liveRound = liveRoundRaw ? JSON.parse(liveRoundRaw) : null;

  const { trackFullscreenExit } = useMonitoring({
    teamId: team?.teamId,
    contestId: liveRound?._id,
    enabled: isMandatory && isLoggedIn,
    trackTabSwitches: location.pathname !== '/contest',
  });

  const requestFullscreen = useCallback(() => {
    const element = document.documentElement;
    if (element.requestFullscreen) {
      element.requestFullscreen().catch((err) => {
        console.error(`Error attempting to enable full-screen mode: ${err.message}`);
        toast.error('Could not enable fullscreen. Please ensure you have interacted with the page.');
      });
    }
  }, []);

  useEffect(() => {
    const handleFullscreenChange = () => {
      const currentlyFullscreen = !!document.fullscreenElement;
      
      if (isFullscreen && !currentlyFullscreen && isMandatory && isLoggedIn) {
        // User exited fullscreen on a mandatory page
        void trackFullscreenExit().then((logged) => {
          if (logged) {
            toast.warning('You exited fullscreen! This event has been logged.');
          } else {
            toast.error('Fullscreen exit detected, but monitoring sync failed.');
          }
        });
      }
      
      setIsFullscreen(currentlyFullscreen);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, [isFullscreen, isMandatory, isLoggedIn, trackFullscreenExit]);

  // If mandatory but not fullscreen, show overlay
  const showOverlay = isMandatory && isLoggedIn && !isFullscreen;

  return (
    <>
      {children}
      {showOverlay && (
        <div className="fixed inset-0 z-[9999] bg-background/95 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center">
          <div className="max-w-md w-full border-2 border-primary p-8 bg-space-navy shadow-[0_0_30px_rgba(0,245,255,0.2)]">
            <h2 className="font-pixel text-xl text-primary mb-6 neon-text-cyan">
              RESTRICTED ACCESS
            </h2>
            <p className="font-mono-tech text-foreground mb-8 leading-relaxed">
              This mission requires a secure, full-screen environment. 
              Exiting full-screen is a security violation and is being monitored.
            </p>
            <button
              onClick={requestFullscreen}
              className="w-full font-pixel text-sm bg-primary text-background py-4 border-2 border-primary hover:bg-primary/80 transition-all transform active:scale-95"
            >
              [ RE-ENTER MISSION MODE ]
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default FullscreenEnforcer;

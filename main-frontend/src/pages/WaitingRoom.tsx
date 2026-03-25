import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import StarfieldBackground from '@/components/StarfieldBackground';
import PixelRadar from '@/components/PixelRadar';
import MarqueeStrip from '@/components/MarqueeStrip';
import { X } from 'lucide-react';
import { toast } from 'sonner';
import { handleUnauthorized } from '@/lib/authSession';

const API_URL = 'http://localhost:5000/api';

const markTeamAsBanned = () => {
  const teamRaw = localStorage.getItem('cc_team');
  if (!teamRaw) return;
  try {
    const parsed = JSON.parse(teamRaw);
    parsed.banned = true;
    localStorage.setItem('cc_team', JSON.stringify(parsed));
  } catch {
    // ignore parse errors
  }
};

const WaitingRoom = () => {
  const navigate = useNavigate();
  const [flashing, setFlashing] = useState(false);
  const [showRulesModal, setShowRulesModal] = useState(false);
  const [waitingCount, setWaitingCount] = useState(0);
  const hasNavigatedRef = useRef(false);
  const bannedBlockedRef = useRef(false);
  const lastHeartbeatRef = useRef(0);

  useEffect(() => {
    const handleGlobalClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const link = target.closest('a');
      if (link && link.getAttribute('href') === '/rules') {
        e.preventDefault();
        e.stopPropagation();
        setShowRulesModal(true);
      }
    };
    document.addEventListener('click', handleGlobalClick, true);
    return () => document.removeEventListener('click', handleGlobalClick, true);
  }, []);

  const rules = [
    { num: '01', title: 'NO AI TOOLS ALLOWED', desc: 'Any use of AI assistants, chatbots, or code generation tools is strictly prohibited during all rounds.' },
    { num: '02', title: 'ACCURACY + SPEED = VICTORY', desc: 'Teams are ranked by correct matches first, then by time taken. Faster accurate submissions rank higher.' },
    { num: '03', title: 'NO SWITCHING AFTER SUBMIT', desc: 'Once the timer ends or you submit, all answers are locked.' },
    { num: '04', title: 'TEAM SIZE: 2 MEMBERS', desc: 'Each team must have exactly two members.' },
    { num: '05', title: 'FOLLOW ORGANIZER INSTRUCTIONS', desc: 'All decisions made by the event organizers are final.' },
    { num: '06', title: 'NO INTER-TEAM COMMUNICATION', desc: 'Discussing answers or signaling other teams during a round is grounds for disqualification.' },
  ];

  const stored = localStorage.getItem('cc_team');
  const team = stored ? JSON.parse(stored) : { teamName: 'UNNAMED', round: '1' };
  const [nextRoundNumber, setNextRoundNumber] = useState<number>(Number(team.round) || 1);

  useEffect(() => {
    const sendWaitingHeartbeat = async () => {
      const now = Date.now();
      if (now - lastHeartbeatRef.current < 2000) return;
      lastHeartbeatRef.current = now;

      try {
        const response = await fetch(`${API_URL}/admin/teams/waiting-room/heartbeat`, {
          method: 'POST',
          credentials: 'include',
        });

        if (response.ok) {
          const heartbeatData = await response.json().catch(() => ({}));
          const count = Number(heartbeatData?.data?.waitingCount || 0);
          setWaitingCount(count);
        }
      } catch {
        // Ignore heartbeat failures to avoid disrupting round polling.
      }
    };

    const checkLiveRound = async () => {
      if (hasNavigatedRef.current) return;
      if (bannedBlockedRef.current) return;

      await sendWaitingHeartbeat();

      try {
        const response = await fetch(`${API_URL}/admin/round`, { credentials: 'include' });
        if (response.status === 403) {
          if (!bannedBlockedRef.current) {
            bannedBlockedRef.current = true;
            markTeamAsBanned();
            toast.error('Your team is banned and cannot enter the contest.');
            navigate('/banned');
          }
          return;
        }
        if (response.status === 401) {
          handleUnauthorized(navigate, '/home');
          return;
        }
        if (!response.ok) return;

        const data = await response.json();
        const rounds = Array.isArray(data?.data) ? data.data : [];
        const endedRoundsCount = rounds.filter((r: any) => r.status === 'ENDED').length;
        setNextRoundNumber(endedRoundsCount + 1);

        const liveRound = data?.data?.find((r: any) => r.status === 'LIVE');
        
        // Check if a previously LIVE round has been reset to DRAFT
        const storedRound = localStorage.getItem('cc_live_round');
        if (storedRound) {
          const parsedRound = JSON.parse(storedRound);
          const currentRound = data?.data?.find((r: any) => r._id === parsedRound._id);
          
          if (currentRound && currentRound.status === 'DRAFT') {
            // Round was reset - clear all submission data
            const teamId = JSON.parse(localStorage.getItem('cc_team') || '{}')?.teamId;
            if (teamId) {
              localStorage.removeItem(`cc_submitted_${teamId}_${parsedRound._id}`);
            }
            localStorage.removeItem('cc_live_round');
            localStorage.removeItem('cc_result');
          }
        }

        if (!liveRound) return;

        localStorage.setItem('cc_live_round', JSON.stringify({
          _id: liveRound._id,
          roundNumber: Number(liveRound.roundNumber || 0),
          duration: Number(liveRound.duration || 0),
          startTime: liveRound.startTime,
          endTime: liveRound.endTime,
        }));

        hasNavigatedRef.current = true;
        setFlashing(true);

        const now = Date.now();
        const startAt = new Date(liveRound.startTime).getTime();
        const targetPath = startAt > now ? '/countdown' : '/contest';

        setTimeout(() => navigate(targetPath), 400);
      } catch (error) {
        console.error('Waiting room poll error:', error);
      }
    };

    checkLiveRound();
    const interval = setInterval(checkLiveRound, 500);
    return () => clearInterval(interval);
  }, [navigate]);

  return (
    <div className="relative min-h-screen scanline-overlay">
      <StarfieldBackground showClouds={false} showPlanets opacity={0.6} />

      {/* Rules Modal */}
      {showRulesModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/70 backdrop-blur-sm transition-opacity"
            onClick={() => setShowRulesModal(false)}
          />
          <div
            className="relative w-full max-w-[800px] bg-[#060612]/95 border-[1px] border-primary p-8 md:p-12 flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95 duration-300"
            style={{
              boxShadow: '0 0 15px rgba(0,245,255,0.1) inset, 0 0 20px rgba(0,245,255,0.2)',
            }}
          >
            <button
              onClick={() => setShowRulesModal(false)}
              className="absolute top-4 right-4 md:top-6 md:right-8 font-pixel text-xs text-primary hover:text-white transition-colors focus:outline-none"
            >
              [X]
            </button>
            <h2
              className="font-pixel text-xl md:text-2xl text-primary text-center mb-10 tracking-widest"
              style={{ filter: 'drop-shadow(0 0 8px rgba(0,245,255,0.6))' }}
            >
              MISSION RULES
            </h2>
            <div className="overflow-y-auto pr-4 space-y-4" style={{ scrollbarWidth: 'thin' }}>
              {rules.map(rule => (
                <div
                  key={rule.num}
                  className="bg-[#0b0c1b] border-l-[3px] border-l-primary py-5 px-6 flex items-start gap-5 transition-all w-full"
                >
                  <div className="w-8 h-8 flex-shrink-0 border-[1px] border-primary flex items-center justify-center mt-1">
                    <span className="font-pixel text-[10px] text-primary">{rule.num}</span>
                  </div>
                  <div className="flex-1">
                    <h3 className="font-pixel text-[11px] text-white tracking-wide mb-3">{rule.title}</h3>
                    <p className="font-mono-tech text-[13px] text-muted-foreground leading-relaxed w-full">
                      {rule.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Flash overlay */}
      {flashing && (
        <div className="fixed inset-0 z-50 bg-foreground animate-warp-flash pointer-events-none" />
      )}

      <div className="relative z-10 min-h-screen flex flex-col items-center justify-center px-4">
        {/* Main Panel */}
        <div
          className="max-w-[500px] w-full text-center flex flex-col justify-center items-center"
          style={{
            background: 'rgba(6, 6, 18, 0.92)',
            border: '2px solid hsl(var(--neon-cyan))',
            filter: 'drop-shadow(0 0 20px rgba(0,245,255,0.2))',
            padding: '24px 20px',
            borderRadius: '0',
          }}
        >
          {/* Divider */}
          <div className="w-full h-px bg-muted my-3" />

          <h2
            className="font-pixel text-sm md:text-xl text-foreground mb-2"
            style={{ filter: 'drop-shadow(0 0 10px rgba(255,255,255,0.4))' }}
          >
            STANDBY FOR LAUNCH
          </h2>

          <p className="font-mono-tech text-[13px] text-muted-foreground/60 mb-6">
            Waiting for organizer to initiate Round {nextRoundNumber}
            <span className="animate-blink-cursor">...</span>
          </p>

          {/* Team info badges */}
          <div className="flex flex-wrap justify-center gap-3 mb-6">
            <span className="font-pixel text-[8px] px-[14px] py-2 bg-space-navy border-2 border-primary text-primary">
              TEAM: {team.teamName.toUpperCase()}
            </span>
            <span className="font-pixel text-[8px] px-[14px] py-2 bg-space-navy border-2 border-accent text-accent">
              ROUND: {String(nextRoundNumber).padStart(2, '0')}
            </span>
            <span className="font-pixel text-[8px] px-[14px] py-2 bg-space-navy border-2 border-[#22C55E] text-[#22C55E]">
              STATUS: READY
            </span>
            <span className="font-pixel text-[8px] px-[14px] py-2 bg-space-navy border-2 border-cyan-400 text-cyan-300">
              WAITING: {waitingCount}
            </span>
          </div>

          {/* Radar signal */}
          <div className="mb-6 w-[220px] h-[220px] mx-auto relative flex items-center justify-center">
            <PixelRadar />
          </div>

          {/* Actions */}
          <div className="flex flex-col items-center gap-4 relative z-20 w-full px-4">
            <button
              onClick={() => navigate('/leaderboard')}
              className="font-pixel text-[9px] text-primary px-6 py-2 transition-all border-2 border-primary/50 bg-primary/10 hover:bg-primary/30 cursor-pointer"
            >
              [ LEADERBOARD ]
            </button>
          </div>
        </div>

        {/* Marquee at bottom */}
        <div className="absolute bottom-0 left-0 right-0">
          <MarqueeStrip text="NO AI TOOLS ALLOWED * ACCURACY + SPEED = VICTORY * GOOD LUCK CADET * MATCH THE CODE * BEAT THE CLOCK *" />
        </div>
      </div>

    </div>
  );
};

export default WaitingRoom;
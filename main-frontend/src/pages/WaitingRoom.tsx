import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import StarfieldBackground from '@/components/StarfieldBackground';
import PixelRadar from '@/components/PixelRadar';
import MarqueeStrip from '@/components/MarqueeStrip';
import { X } from 'lucide-react';

const WaitingRoom = () => {
  const navigate = useNavigate();
  const [flashing, setFlashing] = useState(false);
  const [showRulesModal, setShowRulesModal] = useState(false);

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

  const handleSimulate = () => {
    setFlashing(true);
    setTimeout(() => navigate('/countdown'), 400);
  };

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
            Waiting for organizer to initiate Round {team.round}
            <span className="animate-blink-cursor">...</span>
          </p>

          {/* Team info badges */}
          <div className="flex flex-wrap justify-center gap-3 mb-6">
            <span className="font-pixel text-[8px] px-[14px] py-2 bg-space-navy border-2 border-primary text-primary">
              TEAM: {team.teamName.toUpperCase()}
            </span>
            <span className="font-pixel text-[8px] px-[14px] py-2 bg-space-navy border-2 border-accent text-accent">
              ROUND: 0{team.round}
            </span>
            <span className="font-pixel text-[8px] px-[14px] py-2 bg-space-navy border-2 border-[#22C55E] text-[#22C55E]">
              STATUS: READY
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
            <div className="mt-2 text-center">
              <p className="font-mono-tech text-[10px] text-muted-foreground/40 tracking-[2px] mb-2">
                — FOR DEMO PURPOSES —
              </p>
              <button
                onClick={handleSimulate}
                className="font-pixel text-[9px] text-foreground px-6 py-3 transition-all hover:brightness-90 cursor-pointer"
                style={{
                  background: '#BE185D',
                  border: '2px solid #F472B6',
                  borderRadius: '0',
                  filter: 'drop-shadow(0 0 8px rgba(244,114,182,0.5))',
                }}
              >
                [ &gt;&gt; SIMULATE START ]
              </button>
            </div>
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
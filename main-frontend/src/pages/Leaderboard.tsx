import { useState, useEffect, useMemo, useCallback } from 'react';
import StarfieldBackground from '@/components/StarfieldBackground';
import PixelCard from '@/components/PixelCard';
import PixelBadge from '@/components/PixelBadge';
import { CrownIcon, MedalIcon } from '@/components/PixelIcons';
import { cn } from '@/lib/utils';
import { Link, useNavigate } from 'react-router-dom';
import { handleUnauthorized } from '@/lib/authSession';

const API_URL = 'http://localhost:5000/api';

type LeaderboardRow = {
  rank: number;
  team: string;
  score: number;
  timeSeconds: number;
  accuracy: number;
};

const formatSeconds = (seconds: number) => {
  const safe = Math.max(0, Number(seconds) || 0);
  const mins = Math.floor(safe / 60);
  const secs = safe % 60;
  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
};

const podiumConfig = {
  1: { glow: '#FFD700', text: 'text-rank-gold', height: 'h-32', border: 'border-rank-gold', bg: 'bg-rank-gold/10' },
  2: { glow: '#C0C0C0', text: 'text-rank-silver', height: 'h-24', border: 'border-rank-silver', bg: 'bg-rank-silver/10' },
  3: { glow: '#CD7F32', text: 'text-rank-bronze', height: 'h-20', border: 'border-rank-bronze', bg: 'bg-rank-bronze/10' },
};

const Leaderboard = () => {
  const navigate = useNavigate();
  const [activeRound, setActiveRound] = useState(0);
  const [showRulesModal, setShowRulesModal] = useState(false);
  const [roundsData, setRoundsData] = useState<Record<number, LeaderboardRow[]>>({});
  const [roundLabels, setRoundLabels] = useState<string[]>([]);

  const fetchLeaderboard = useCallback(async () => {
    try {
      const response = await fetch(`${API_URL}/submissions`, {
        credentials: 'include',
      });
      if (response.status === 401) {
        handleUnauthorized(navigate, '/home');
        return;
      }
      const data = await response.json();
      const submissions = Array.isArray(data?.data) ? data.data : [];

      // Group submissions by round
      const grouped: Record<number, any[]> = {};
      submissions.forEach((item: any) => {
        const roundNumber = Number(item?.roundId?.roundNumber || 0);
        if (!grouped[roundNumber]) grouped[roundNumber] = [];
        grouped[roundNumber].push(item);
      });

      // Sort each round's leaderboard
      const processedRounds: Record<number, LeaderboardRow[]> = {};
      Object.entries(grouped).forEach(([roundNum, items]) => {
        const sorted = (items as any[])
          .sort((a: any, b: any) => {
            if (b.questionsSolved !== a.questionsSolved) return b.questionsSolved - a.questionsSolved;
            if (a.timeSeconds !== b.timeSeconds) return a.timeSeconds - b.timeSeconds;
            return new Date(a.submittedAt).getTime() - new Date(b.submittedAt).getTime();
          })
          .map((item: any, index: number) => ({
            rank: index + 1,
            team: item?.teamId?.teamName || 'UNKNOWN TEAM',
            score: Number(item?.questionsSolved || 0) * 10,
            timeSeconds: Number(item?.timeSeconds || 0),
            accuracy: Number(item?.accuracy || 0),
          }));
        processedRounds[Number(roundNum)] = sorted;
      });

      setRoundsData(processedRounds);
      
      // Generate round labels in descending order (latest first)
      const labels = Object.keys(processedRounds)
        .map(Number)
        .sort((a, b) => b - a)
        .map(num => `ROUND ${num}`);
      setRoundLabels(labels);
      
      // Set active round to latest (index 0 after sorting descending)
      if (labels.length > 0) setActiveRound(0);
    } catch (error) {
      console.error('Leaderboard fetch failed:', error);
      setRoundsData({});
      setRoundLabels([]);
    }
  }, [navigate]);

  useEffect(() => {
    fetchLeaderboard();
    const interval = setInterval(fetchLeaderboard, 5000);
    return () => clearInterval(interval);
  }, [fetchLeaderboard]);

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

  return (
    <div className="relative min-h-screen scanline-overlay">
      <StarfieldBackground showClouds={false} showPlanets opacity={0.5} />

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

      <div className="relative z-10 pt-20 px-4 pb-12">
        <div className="max-w-5xl mx-auto">
          {/* Title */}
          <div className="text-center mb-6">
            <h1 className="font-pixel text-2xl md:text-4xl text-primary neon-text-cyan mb-2">
              <span className="title-glitch-wrap">
                <span className="title-ghost">CODE CONUNDRUM</span>
                <span className="title-main">CODE CONUNDRUM</span>
              </span>
            </h1>
            <h2
              className="font-pixel text-sm md:text-lg text-rank-gold"
              style={{ filter: 'drop-shadow(0 0 10px #FFD700)' }}
            >
              GALACTIC LEADERBOARD
            </h2>
          </div>

          {/* Round tabs */}
          <div className="flex justify-center gap-2 mb-10 flex-wrap">
            {roundLabels.map((tab, i) => (
              <button
                key={tab}
                onClick={() => setActiveRound(i)}
                className={cn(
                  'font-pixel text-[8px] px-3 py-2 border-2 transition-all',
                  activeRound === i
                    ? 'bg-secondary border-secondary text-secondary-foreground'
                    : 'border-muted-foreground/30 text-muted-foreground hover:border-secondary/50'
                )}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Podium */}
          {roundLabels.length > 0 && (() => {
            const roundNum = Object.keys(roundsData).map(Number).sort((a, b) => b - a)[activeRound];
            const rows = roundsData[roundNum] || [];
            const top3 = rows.slice(0, 3);
            const podiumOrder = [top3[1], top3[0], top3[2]]; // 2nd, 1st, 3rd
            return (
              <div className="flex items-end justify-center gap-4 mb-12">
                {podiumOrder.filter(Boolean).map((entry, idx) => {
                  const pos = idx === 1 ? 1 : idx === 0 ? 2 : 3;
                  const config = podiumConfig[pos as 1 | 2 | 3];
                  return (
                    <div key={entry.rank} className="flex flex-col items-center">
                      {pos === 1 && <CrownIcon size={28} className="mb-2" />}
                      {pos === 2 && <MedalIcon rank={2} size={24} className="mb-2" />}
                      {pos === 3 && <MedalIcon rank={3} size={24} className="mb-2" />}
                      <span className={cn('font-pixel text-[8px] mb-2', config.text)}>
                        {entry.team}
                      </span>
                      <span className="font-pixel text-[10px] text-foreground mb-2">{entry.score}</span>
                      <div
                        className={cn(
                          'w-20 md:w-28',
                          config.height,
                          config.border,
                          config.bg,
                          'border-4 flex items-center justify-center'
                        )}
                        style={{ filter: `drop-shadow(0 0 8px ${config.glow})` }}
                      >
                        <span className={cn('font-pixel text-lg', config.text)}>{pos}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            );
          })()}

          {/* Live indicator */}
          <div className="flex items-center justify-end gap-2 mb-3">
            <div className="w-2 h-2 bg-[#22C55E] animate-blink-cursor" />
            <span className="font-pixel text-[8px] text-[#22C55E]">LIVE</span>
          </div>

          {/* Rankings table */}
          <PixelCard variant="cyan" className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b-2 border-primary/20">
                  {['RANK', 'TOP COMMANDERS', 'SCORE', 'TIME', 'ACCURACY'].map(h => (
                    <th key={h} className="font-pixel text-[8px] text-primary py-2 px-3 text-left">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {(() => {
                  const roundNum = Object.keys(roundsData).map(Number).sort((a, b) => b - a)[activeRound];
                  const rows = roundsData[roundNum] || [];
                  return rows.map((entry, i) => (
                    <tr
                      key={entry.rank}
                      className={cn(
                        'border-b border-muted/30 transition-all',
                        i % 2 === 0 ? 'bg-space-navy/50' : 'bg-card',
                        entry.rank === 1 && 'border-l-4 border-l-primary bg-primary/5'
                      )}
                    >
                      <td className="py-2 px-3">
                        <div
                          className="w-7 h-7 border-2 border-muted-foreground/20 bg-space-navy flex items-center justify-center"
                          style={entry.rank <= 3 ? {
                            borderColor: entry.rank === 1 ? '#FFD700' : entry.rank === 2 ? '#C0C0C0' : '#CD7F32',
                            filter: `drop-shadow(0 0 4px ${entry.rank === 1 ? '#FFD700' : entry.rank === 2 ? '#C0C0C0' : '#CD7F32'})`,
                          } : undefined}
                        >
                          <span className="font-pixel text-[8px] text-foreground">
                            {String(entry.rank).padStart(2, '0')}
                          </span>
                        </div>
                      </td>
                      <td className="font-pixel text-[8px] text-foreground py-2 px-3">
                        {entry.team}
                      </td>
                      <td className="font-mono-tech text-sm text-foreground py-2 px-3">
                        {entry.score}
                      </td>
                      <td className="font-mono-tech text-sm text-muted-foreground py-2 px-3">
                        {formatSeconds(entry.timeSeconds)}
                      </td>
                      <td className="font-mono-tech text-sm text-primary py-2 px-3">
                        {entry.accuracy.toFixed(2)}%
                      </td>
                    </tr>
                  ));
                })()}
              </tbody>
            </table>
          </PixelCard>

          {/* Bottom actions */}
          <div className="flex justify-center gap-4 mt-8">
            <Link to="/waiting-room">
              <button className="font-pixel text-[8px] text-primary bg-transparent border-2 border-primary px-4 py-2 hover:bg-primary/10 transition-all">
                [ BACK TO WAITING ROOM ]
              </button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Leaderboard;

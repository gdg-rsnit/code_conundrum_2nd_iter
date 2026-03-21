import { Link } from 'react-router-dom';
import StarfieldBackground from '@/components/StarfieldBackground';
import { TrophyIcon } from '@/components/PixelIcons';

const RoundComplete = () => {
  const stored = localStorage.getItem('cc_result');
  const parsed = stored ? JSON.parse(stored) : {};
  let score = Math.max(0, Number(parsed?.score ?? parsed?.matchedCount ?? 0));
  let savedTotal = Math.max(0, Number(parsed?.total ?? 0));
  const savedAccuracy = Math.max(0, Number(parsed?.accuracy ?? 0));

  // Backward compatibility: older payloads may store score/total in points (x10).
  if (score > 0 && savedTotal > 0 && score % 10 === 0 && savedTotal % 10 === 0) {
    score = Math.floor(score / 10);
    savedTotal = Math.floor(savedTotal / 10);
  }

  const inferredTotalFromAccuracy = savedAccuracy > 0
    ? Math.round((score * 100) / savedAccuracy)
    : 0;
  const total = savedTotal > 0
    ? Math.max(savedTotal, score)
    : Math.max(inferredTotalFromAccuracy, score);

  const accuracy = total > 0 ? Math.round((score / total) * 100) : savedAccuracy;
  const timeTaken = Math.max(0, Number(parsed?.timeTaken ?? 0));
  const mins = Math.floor(timeTaken / 60);
  const secs = timeTaken % 60;

  const accColor = accuracy > 75 ? '#00F5FF' : accuracy >= 50 ? '#EAB308' : '#EF4444';

  return (
    <div className="relative min-h-screen scanline-overlay">
      <StarfieldBackground showClouds={false} showPlanets opacity={0.5} />

      <div className="relative z-10 min-h-screen flex items-center justify-center px-4">
        <div className="text-center max-w-md w-full">
          <h1
            className="font-pixel text-lg md:text-2xl text-rank-gold mb-8"
            style={{ filter: 'drop-shadow(0 0 12px #FFD700)' }}
          >
            ROUND COMPLETE
          </h1>

          <div className="flex justify-center mb-6">
            <TrophyIcon size={48} />
          </div>

          <div className="font-pixel text-xl md:text-3xl text-foreground mb-4">
            {score} / {total} CORRECT
          </div>

          <div className="font-mono-tech text-sm text-muted-foreground mb-4">
            TIME: {String(mins).padStart(2, '0')}:{String(secs).padStart(2, '0')}
          </div>

          <div
            className="font-pixel text-[10px] mb-10"
            style={{ color: accColor }}
          >
            {accuracy}% ACCURACY
          </div>

          <div className="flex flex-col gap-4 justify-center content-center w-full">
            <Link to="/leaderboard" className="w-full">
              <button
                className="font-pixel text-[9px] text-foreground bg-rank-gold border-2 border-rank-gold/60 px-8 py-4 hover:bg-rank-gold/80 transition-all w-full whitespace-nowrap"
                style={{ filter: 'drop-shadow(0 0 8px hsl(45 93% 47% / 0.5))' }}
              >
                [ VIEW LEADERBOARD ]
              </button>
            </Link>
            <Link to="/waiting-room" className="w-full">
              <button
                className="font-pixel text-[9px] text-foreground bg-accent border-2 border-accent/60 px-8 py-4 hover:bg-accent/80 transition-all w-full whitespace-nowrap"
                style={{ filter: 'drop-shadow(0 0 8px hsl(270 100% 59% / 0.5))' }}
              >
                [ BACK TO LOBBY ]
              </button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RoundComplete;

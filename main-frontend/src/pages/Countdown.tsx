import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';

// Stable random data generated once to avoid re-render jitter
const STARS = Array.from({ length: 30 }, () => ({
  left: `${Math.random() * 100}%`,
  top: `${Math.random() * 100}%`,
  opacity: Math.random() * 0.8 + 0.2,
}));

const PARTICLES = Array.from({ length: 20 }, () => ({
  left: `${Math.random() * 100}%`,
  top: `${Math.random() * 100}%`,
  xRange: Math.random() * 50 - 25,
  duration: 3 + Math.random() * 2,
}));

const ASTEROIDS = Array.from({ length: 8 }, () => ({
  left: `${Math.random() * 100}%`,
  top: `${Math.random() * 100}%`,
  duration: 10 + Math.random() * 10,
}));

const Countdown = () => {
  const navigate = useNavigate();
  const [count, setCount] = useState(10);
  const [pulseStars, setPulseStars] = useState(false);
  const audioCtxRef = useRef<AudioContext | null>(null);

  // Enter fullscreen on mount, exit on unmount
  useEffect(() => {
    const el = document.documentElement;
    if (el.requestFullscreen) el.requestFullscreen().catch(() => {});
    return () => {
      if (document.fullscreenElement && document.exitFullscreen)
        document.exitFullscreen().catch(() => {});
    };
  }, []);

  // Init audio context
  useEffect(() => {
    try {
      const Ctx = window.AudioContext || (window as any).webkitAudioContext;
      if (Ctx) audioCtxRef.current = new Ctx();
    } catch {}
    return () => { audioCtxRef.current?.close(); };
  }, []);

  const playBeep = (frequency: number, duration: number) => {
    const ctx = audioCtxRef.current;
    if (!ctx) return;
    try {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.frequency.value = frequency;
      osc.type = 'square';
      gain.gain.setValueAtTime(0.3, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + duration);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + duration);
    } catch {}
  };

  const playUnlock = () => {
    [523.25, 659.25, 783.99, 1046.5].forEach((f, i) =>
      setTimeout(() => playBeep(f, 0.15), i * 100)
    );
  };

  // Countdown logic
  useEffect(() => {
    if (count > 1) {
      const t = setTimeout(() => {
        setCount(c => c - 1);
        setPulseStars(true);
        playBeep(800, 0.1);
        setTimeout(() => setPulseStars(false), 300);
      }, 1000);
      return () => clearTimeout(t);
    } else if (count === 1) {
      const t = setTimeout(() => {
        playBeep(800, 0.1);
        setPulseStars(true);
        playUnlock();
        setTimeout(() => setPulseStars(false), 300);
        setCount(0);
        setTimeout(() => navigate('/contest'), 1200);
      }, 1000);
      return () => clearTimeout(t);
    }
  }, [count, navigate]);

  const progress = (count / 10) * 100;
  const isWord = count <= 3;
  const displayLabel =
    count === 3 ? 'READY' :
    count === 2 ? 'SET' :
    count <= 1 ? 'GO!' :
    count;

  return (
    <div className="relative w-full h-screen overflow-hidden bg-[#0B0B1E] flex items-center justify-center">

      {/* Stars */}
      <div className="absolute inset-0">
        {STARS.map((s, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-white rounded-full"
            style={{ left: s.left, top: s.top, opacity: s.opacity }}
            animate={{ opacity: pulseStars ? 1 : undefined, scale: pulseStars ? 1.5 : undefined }}
            transition={{ duration: 0.3 }}
          />
        ))}
      </div>

      {/* Nebula glow */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#6366F1]/20 rounded-full blur-[100px]" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-[#8B5CF6]/20 rounded-full blur-[100px]" />
      </div>

      {/* Floating particles */}
      {PARTICLES.map((p, i) => (
        <motion.div
          key={`p-${i}`}
          className="absolute w-2 h-2 bg-[#A78BFA]/40 rounded-full"
          style={{ left: p.left, top: p.top }}
          animate={{ y: [0, -100, 0], x: [0, p.xRange, 0], opacity: [0.4, 0.8, 0.4] }}
          transition={{ duration: p.duration, repeat: Infinity, ease: 'linear' }}
        />
      ))}

      {/* Asteroids */}
      {ASTEROIDS.map((a, i) => (
        <motion.div
          key={`a-${i}`}
          className="absolute"
          style={{ left: a.left, top: a.top }}
          animate={{ rotate: 360 }}
          transition={{ duration: a.duration, repeat: Infinity, ease: 'linear' }}
        >
          <PixelAsteroid />
        </motion.div>
      ))}

      {/* Neon grid floor */}
      <div className="absolute bottom-0 left-0 right-0 h-64 overflow-hidden opacity-30">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `linear-gradient(to right, #6366F133 1px, transparent 1px), linear-gradient(to bottom, #6366F133 1px, transparent 1px)`,
            backgroundSize: '40px 40px',
            transform: 'perspective(500px) rotateX(60deg)',
            transformOrigin: 'bottom',
          }}
        />
      </div>

      {/* CRT scanlines */}
      <div
        className="absolute inset-0 pointer-events-none opacity-10"
        style={{ backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, #000 2px, #000 4px)' }}
      />

      {/* Main content */}
      <div className="relative z-10 flex flex-col items-center">
        <motion.div
          className="mb-8 text-cyan-400 tracking-widest"
          style={{ fontFamily: '"Press Start 2P", cursive', fontSize: '14px' }}
          animate={{ opacity: [0.8, 1, 0.8] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          NEXT ROUND STARTING IN
        </motion.div>

        {/* HUD ring */}
        <div className="relative w-96 h-96 flex items-center justify-center">

          {/* Rocket orbiting the ring */}
          <motion.div
            className="absolute w-96 h-96"
            animate={{ rotate: -(360 * (1 - progress / 100)) }}
            transition={{ duration: 0.5 }}
          >
            <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2">
              <PixelRocket />
            </div>
          </motion.div>

          {/* Progress ring SVG */}
          <svg className="absolute w-96 h-96 -rotate-90">
            <circle cx="192" cy="192" r="180" fill="none" stroke="#1a1a3e" strokeWidth="4" className="opacity-30" />
            <motion.circle
              cx="192" cy="192" r="180"
              fill="none"
              stroke="url(#grad)"
              strokeWidth="8"
              strokeLinecap="square"
              strokeDasharray={2 * Math.PI * 180}
              initial={{ strokeDashoffset: 0 }}
              animate={{ strokeDashoffset: (2 * Math.PI * 180) * (1 - progress / 100) }}
              transition={{ duration: 0.5 }}
              style={{ filter: 'drop-shadow(0 0 10px #8B5CF6)' }}
            />
            <defs>
              <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#8B5CF6" />
                <stop offset="50%" stopColor="#6366F1" />
                <stop offset="100%" stopColor="#3B82F6" />
              </linearGradient>
            </defs>
          </svg>

          {/* HUD borders */}
          <div className="absolute w-96 h-96 rounded-full border-4 border-cyan-500/40 shadow-[0_0_30px_rgba(0,255,255,0.3)]" />
          <div className="absolute w-[360px] h-[360px] rounded-full border-2 border-orange-500/40 shadow-[0_0_20px_rgba(255,107,0,0.3)]" />

          <CornerBrackets />

          {/* Countdown number */}
          <div className="relative z-20">
            <AnimatePresence mode="wait">
              <motion.div
                key={count}
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 1.5 }}
                transition={{ duration: 0.3 }}
                className="relative"
              >
                <div
                  className={isWord ? 'text-[60px] font-bold' : 'text-[120px] font-bold'}
                  style={{
                    fontFamily: '"Press Start 2P", cursive',
                    background: 'linear-gradient(180deg, #00ff00 0%, #00ffff 50%, #a855f7 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text',
                    filter: 'drop-shadow(0 0 10px rgba(0,255,0,0.8))',
                  }}
                >
                  {displayLabel}
                </div>
                {/* Glitch layer */}
                <motion.div
                  className={`absolute inset-0 ${isWord ? 'text-[60px]' : 'text-[120px]'} font-bold text-cyan-400 opacity-0`}
                  style={{ fontFamily: '"Press Start 2P", cursive' }}
                  animate={{ opacity: [0, 0.3, 0], x: [0, -4, 4, 0] }}
                  transition={{ duration: 0.2, times: [0, 0.5, 0.8, 1] }}
                >
                  {displayLabel}
                </motion.div>
              </motion.div>
            </AnimatePresence>
          </div>

        </div>{/* end HUD ring */}

        <motion.div
          className="mt-8 text-purple-400 tracking-wider"
          style={{ fontFamily: '"Press Start 2P", cursive', fontSize: '12px' }}
          animate={{ opacity: [0.6, 1, 0.6] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        >
          Prepare your team...
        </motion.div>
      </div>{/* end main content */}

      {/* Centre radial glow */}
      <div className="absolute inset-0 pointer-events-none">
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full opacity-50"
          style={{ background: 'radial-gradient(circle, rgba(0,255,255,0.1) 0%, transparent 70%)' }}
        />
      </div>

    </div>
  );
};

// ── Sub-components ──────────────────────────────────────────

function PixelAsteroid() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
      <rect x="8" y="4" width="4" height="4" fill="#666" />
      <rect x="12" y="4" width="4" height="4" fill="#555" />
      <rect x="4" y="8" width="4" height="4" fill="#555" />
      <rect x="8" y="8" width="4" height="4" fill="#777" />
      <rect x="12" y="8" width="4" height="4" fill="#666" />
      <rect x="16" y="8" width="4" height="4" fill="#555" />
      <rect x="4" y="12" width="4" height="4" fill="#666" />
      <rect x="8" y="12" width="4" height="4" fill="#555" />
      <rect x="12" y="12" width="4" height="4" fill="#777" />
      <rect x="8" y="16" width="4" height="4" fill="#555" />
      <rect x="12" y="16" width="4" height="4" fill="#666" />
    </svg>
  );
}

function PixelRocket() {
  return (
    <motion.svg
      width="48" height="48" viewBox="0 0 48 48" fill="none"
      animate={{
        filter: [
          'drop-shadow(0 0 8px #00ffff) drop-shadow(0 0 12px #8B5CF6)',
          'drop-shadow(0 0 15px #00ffff) drop-shadow(0 0 20px #8B5CF6)',
          'drop-shadow(0 0 8px #00ffff) drop-shadow(0 0 12px #8B5CF6)',
        ],
      }}
      transition={{ duration: 1, repeat: Infinity }}
    >
      <rect x="20" y="8" width="8" height="8" fill="#00ffff" />
      <rect x="16" y="16" width="16" height="8" fill="#00ffff" />
      <rect x="20" y="16" width="8" height="8" fill="#ffffff" />
      <rect x="16" y="24" width="16" height="8" fill="#6366F1" />
      <rect x="20" y="24" width="8" height="8" fill="#00ffff" />
      <rect x="8" y="24" width="8" height="8" fill="#8B5CF6" />
      <rect x="32" y="24" width="8" height="8" fill="#8B5CF6" />
      <rect x="20" y="32" width="8" height="4" fill="#ff6b00" />
      <rect x="16" y="36" width="16" height="4" fill="#ffaa00" opacity="0.9" />
      <rect x="20" y="40" width="8" height="4" fill="#ff0000" opacity="0.7" />
    </motion.svg>
  );
}

function CornerBrackets() {
  const positions = [
    { top: 0, left: 0, rotate: 0 },
    { top: 0, right: 0, rotate: 90 },
    { bottom: 0, right: 0, rotate: 180 },
    { bottom: 0, left: 0, rotate: 270 },
  ] as const;

  return (
    <>
      {positions.map((pos, i) => (
        <motion.div
          key={i}
          className="absolute"
          style={{ width: 40, height: 40, ...pos }}
          animate={{ opacity: [0.4, 1, 0.4] }}
          transition={{ duration: 2, repeat: Infinity, delay: i * 0.2 }}
        >
          <svg width="40" height="40" viewBox="0 0 40 40" style={{ transform: `rotate(${pos.rotate}deg)` }}>
            <rect x="0" y="0" width="4" height="16" fill="#00ffff" />
            <rect x="0" y="0" width="16" height="4" fill="#00ffff" />
            <rect x="4" y="4" width="4" height="4" fill="#ff6b00" />
          </svg>
        </motion.div>
      ))}
    </>
  );
}

export default Countdown;

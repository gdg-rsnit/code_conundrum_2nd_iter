import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';

export function CountdownTimer() {
  const [count, setCount] = useState(10);
  const [pulseStars, setPulseStars] = useState(false);
  const audioContextRef = useRef<AudioContext | null>(null);

  // Initialize Audio Context
  useEffect(() => {
    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioContextClass) {
        audioContextRef.current = new AudioContextClass();
      }
    } catch (e) {
      console.log('Audio context not available');
    }
    return () => {
      audioContextRef.current?.close();
    };
  }, []);

  // Play retro beep sound
  const playBeep = (frequency: number, duration: number) => {
    if (!audioContextRef.current) return;
    
    try {
      const ctx = audioContextRef.current;
      const oscillator = ctx.createOscillator();
      const gainNode = ctx.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(ctx.destination);
      
      oscillator.frequency.value = frequency;
      oscillator.type = 'square';
      
      gainNode.gain.setValueAtTime(0.3, ctx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + duration);
      
      oscillator.start(ctx.currentTime);
      oscillator.stop(ctx.currentTime + duration);
    } catch (e) {
      console.log('Audio playback error');
    }
  };

  // Play unlock sound (ascending tones)
  const playUnlockSound = () => {
    if (!audioContextRef.current) return;
    
    const frequencies = [523.25, 659.25, 783.99, 1046.50];
    frequencies.forEach((freq, index) => {
      setTimeout(() => {
        playBeep(freq, 0.15);
      }, index * 100);
    });
  };

  // Countdown logic
  useEffect(() => {
    if (count > 1) {
      const timer = setTimeout(() => {
        setCount(count - 1);
        setPulseStars(true);
        playBeep(800, 0.1);
        setTimeout(() => setPulseStars(false), 300);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (count === 1) {
      const timer = setTimeout(() => {
        playBeep(800, 0.1);
        setPulseStars(true);
        playUnlockSound();
        setTimeout(() => setPulseStars(false), 300);
        setTimeout(() => {
          setCount(10);
        }, 1500);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [count]);

  const progress = (count / 10) * 100;

  return (
    <div className="relative w-full h-screen overflow-hidden bg-[#0B0B1E] flex items-center justify-center">
      {/* Starry Background */}
      <div className="absolute inset-0">
        {Array.from({ length: 30 }).map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-white rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              opacity: Math.random() * 0.8 + 0.2,
            }}
            animate={{
              opacity: pulseStars ? 1 : undefined,
              scale: pulseStars ? 1.5 : undefined,
            }}
            transition={{ duration: 0.3 }}
          />
        ))}
      </div>

      {/* Nebula Glow */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#6366F1]/20 rounded-full blur-[100px]" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-[#8B5CF6]/20 rounded-full blur-[100px]" />
      </div>

      {/* Floating Particles */}
      {Array.from({ length: 20 }).map((_, i) => (
        <motion.div
          key={`particle-${i}`}
          className="absolute w-2 h-2 bg-[#A78BFA]/40 rounded-full"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
          }}
          animate={{
            y: [0, -100, 0],
            x: [0, Math.random() * 50 - 25, 0],
            opacity: [0.4, 0.8, 0.4],
          }}
          transition={{
            duration: 3 + Math.random() * 2,
            repeat: Infinity,
            ease: 'linear',
          }}
        />
      ))}

      {/* Pixel Asteroids */}
      {Array.from({ length: 8 }).map((_, i) => (
        <motion.div
          key={`asteroid-${i}`}
          className="absolute"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
          }}
          animate={{
            rotate: 360,
          }}
          transition={{
            duration: 10 + Math.random() * 10,
            repeat: Infinity,
            ease: 'linear',
          }}
        >
          <PixelAsteroid />
        </motion.div>
      ))}

      {/* Neon Grid Background */}
      <div className="absolute bottom-0 left-0 right-0 h-64 overflow-hidden opacity-30">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `
              linear-gradient(to right, #6366F133 1px, transparent 1px),
              linear-gradient(to bottom, #6366F133 1px, transparent 1px)
            `,
            backgroundSize: '40px 40px',
            transform: 'perspective(500px) rotateX(60deg)',
            transformOrigin: 'bottom',
          }}
        />
      </div>

      {/* CRT Scanlines */}
      <div className="absolute inset-0 pointer-events-none opacity-10">
        <div
          className="w-full h-full"
          style={{
            backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, #000 2px, #000 4px)',
          }}
        />
      </div>

      {/* Main Timer Container */}
      <div className="relative z-10 flex flex-col items-center">
        {/* Top Text */}
        <motion.div
          className="mb-8 text-cyan-400 tracking-widest"
          style={{ fontFamily: '"Press Start 2P", cursive', fontSize: '14px' }}
          animate={{ opacity: [0.8, 1, 0.8] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          NEXT ROUND STARTING IN
        </motion.div>

        {/* Circular HUD Panel */}
        <div className="relative w-96 h-96 flex items-center justify-center">
          {/* Rocket moving along the progress ring */}
          <motion.div
            className="absolute w-96 h-96"
            animate={{ rotate: -(360 * (1 - progress / 100)) }}
            transition={{ duration: 0.5 }}
          >
            <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2">
              <PixelRocket />
            </div>
          </motion.div>

          {/* Progress Ring */}
          <svg className="absolute w-96 h-96 -rotate-90">
            <circle
              cx="192"
              cy="192"
              r="180"
              fill="none"
              stroke="#1a1a3e"
              strokeWidth="4"
              className="opacity-30"
            />
            <motion.circle
              cx="192"
              cy="192"
              r="180"
              fill="none"
              stroke="url(#gradient)"
              strokeWidth="8"
              strokeLinecap="square"
              strokeDasharray={2 * Math.PI * 180}
              initial={{ strokeDashoffset: 0 }}
              animate={{ strokeDashoffset: (2 * Math.PI * 180) * (1 - progress / 100) }}
              transition={{ duration: 0.5 }}
              style={{
                filter: 'drop-shadow(0 0 10px #8B5CF6)',
              }}
            />
            <defs>
              <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#8B5CF6" />
                <stop offset="50%" stopColor="#6366F1" />
                <stop offset="100%" stopColor="#3B82F6" />
              </linearGradient>
            </defs>
          </svg>

          {/* HUD Border */}
          <div className="absolute w-96 h-96 rounded-full border-4 border-cyan-500/40 shadow-[0_0_30px_rgba(0,255,255,0.3)]" />
          <div className="absolute w-[360px] h-[360px] rounded-full border-2 border-orange-500/40 shadow-[0_0_20px_rgba(255,107,0,0.3)]" />

          {/* Corner Brackets */}
          <CornerBrackets />

          {/* Countdown Number */}
          <div className="relative z-20">
            <AnimatePresence mode="wait">
              <motion.div
                key={count}
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ 
                  opacity: 1, 
                  scale: 1,
                }}
                exit={{ 
                  opacity: 0, 
                  scale: 1.5,
                }}
                transition={{ duration: 0.3 }}
                className="relative"
              >
                <div
                  className={count <= 3 && count > 0 ? "text-[60px] font-bold" : "text-[120px] font-bold"}
                  style={{
                    fontFamily: '"Press Start 2P", cursive',
                    background: 'linear-gradient(180deg, #00ff00 0%, #00ffff 50%, #a855f7 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text',
                    textShadow: '0 0 20px rgba(0, 255, 0, 0.8), 0 0 40px rgba(0, 255, 255, 0.6), 0 0 60px rgba(168, 85, 247, 0.4)',
                    filter: 'drop-shadow(0 0 10px rgba(0, 255, 0, 0.8))',
                  }}
                >
                  {count === 3 ? 'READY' : count === 2 ? 'SET' : count === 1 ? 'GO!' : count}
                </div>
                
                {/* Glitch Effect */}
                <motion.div
                  className={count <= 3 && count > 0 ? "absolute inset-0 text-[60px] font-bold text-cyan-400 opacity-0" : "absolute inset-0 text-[120px] font-bold text-cyan-400 opacity-0"}
                  style={{ fontFamily: '"Press Start 2P", cursive' }}
                  animate={{
                    opacity: [0, 0.3, 0],
                    x: [0, -4, 4, 0],
                  }}
                  transition={{ duration: 0.2, times: [0, 0.5, 0.8, 1] }}
                >
                  {count === 3 ? 'READY' : count === 2 ? 'SET' : count === 1 ? 'GO!' : count}
                </motion.div>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        {/* Bottom Text */}
        <motion.div
          className="mt-8 text-purple-400 tracking-wider"
          style={{ fontFamily: '"Press Start 2P", cursive', fontSize: '12px' }}
          animate={{ opacity: [0.6, 1, 0.6] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        >
          Prepare your team...
        </motion.div>
      </div>

      {/* Additional Glow Effects */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full opacity-50"
          style={{
            background: 'radial-gradient(circle, rgba(0,255,255,0.1) 0%, transparent 70%)',
          }}
        />
      </div>
    </div>
  );
}

// Pixel Asteroid Component
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

// Pixel Rocket Component
function PixelRocket() {
  return (
    <motion.svg
      width="48"
      height="48"
      viewBox="0 0 48 48"
      fill="none"
      animate={{
        filter: [
          'drop-shadow(0 0 8px #00ffff) drop-shadow(0 0 12px #8B5CF6)',
          'drop-shadow(0 0 15px #00ffff) drop-shadow(0 0 20px #8B5CF6)',
          'drop-shadow(0 0 8px #00ffff) drop-shadow(0 0 12px #8B5CF6)',
        ],
      }}
      transition={{ duration: 1, repeat: Infinity }}
    >
      {/* Rocket tip */}
      <rect x="20" y="8" width="8" height="8" fill="#00ffff" />
      
      {/* Rocket body */}
      <rect x="16" y="16" width="16" height="8" fill="#00ffff" />
      <rect x="20" y="16" width="8" height="8" fill="#ffffff" />
      
      <rect x="16" y="24" width="16" height="8" fill="#6366F1" />
      <rect x="20" y="24" width="8" height="8" fill="#00ffff" />
      
      {/* Wings */}
      <rect x="8" y="24" width="8" height="8" fill="#8B5CF6" />
      <rect x="32" y="24" width="8" height="8" fill="#8B5CF6" />
      
      {/* Flame/exhaust */}
      <rect x="20" y="32" width="8" height="4" fill="#ff6b00" />
      <rect x="16" y="36" width="16" height="4" fill="#ffaa00" opacity="0.9" />
      <rect x="20" y="40" width="8" height="4" fill="#ff0000" opacity="0.7" />
    </motion.svg>
  );
}

// Corner Brackets Component
function CornerBrackets() {
  const bracketSize = 40;
  const positions = [
    { top: 0, left: 0, rotate: 0 },
    { top: 0, right: 0, rotate: 90 },
    { bottom: 0, right: 0, rotate: 180 },
    { bottom: 0, left: 0, rotate: 270 },
  ];

  return (
    <>
      {positions.map((pos, i) => (
        <motion.div
          key={i}
          className="absolute"
          style={{
            top: pos.top !== undefined ? pos.top : undefined,
            left: pos.left !== undefined ? pos.left : undefined,
            right: pos.right !== undefined ? pos.right : undefined,
            bottom: pos.bottom !== undefined ? pos.bottom : undefined,
            width: bracketSize,
            height: bracketSize,
          }}
          animate={{
            opacity: [0.4, 1, 0.4],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            delay: i * 0.2,
          }}
        >
          <svg
            width={bracketSize}
            height={bracketSize}
            viewBox="0 0 40 40"
            style={{ transform: `rotate(${pos.rotate}deg)` }}
          >
            <rect x="0" y="0" width="4" height="16" fill="#00ffff" />
            <rect x="0" y="0" width="16" height="4" fill="#00ffff" />
            <rect x="4" y="4" width="4" height="4" fill="#ff6b00" />
          </svg>
        </motion.div>
      ))}
    </>
  );
}
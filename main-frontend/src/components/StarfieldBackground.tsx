import { useEffect, useRef } from 'react';
import { PixelPlanetPurple, PixelPlanetTeal, PixelPlanetRed } from './PixelIcons';
import PixelClouds from './PixelClouds';

const StarfieldBackground = ({
  showClouds = true,
  showPlanets = true,
  opacity = 1
}: {
  showClouds?: boolean;
  showPlanets?: boolean;
  opacity?: number;
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    interface Star {
      x: number;
      y: number;
      size: number;
      phase: number;
      speed: number;
    }

    const stars: Star[] = Array.from({ length: 150 }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      size: Math.random() < 0.7 ? 1 : Math.random() < 0.9 ? 2 : 3,
      phase: Math.random() * Math.PI * 2,
      speed: 1.5 + Math.random() * 2.5,
    }));

    let frame = 0;
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      stars.forEach(star => {
        const t = (frame * 0.02) / star.speed;
        const alpha = 0.2 + 0.8 * ((Math.sin(t + star.phase) + 1) / 2);
        const s = star.size;

        ctx.fillStyle = `rgba(255, 255, 255, ${star.size === 3 ? alpha : alpha * (star.size === 2 ? 0.7 : 0.4)})`;
        // Square pixel stars
        ctx.fillRect(Math.floor(star.x), Math.floor(star.y), s, s);
      });

      frame++;
      requestAnimationFrame(animate);
    };

    const animId = requestAnimationFrame(animate);
    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', resize);
    };
  }, []);

  return (
    <div className="fixed inset-0 overflow-hidden" style={{ opacity, zIndex: 0 }}>
      {/* Deep space gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-space-deep via-background to-space-navy" />

      {/* Canvas stars */}
      <canvas ref={canvasRef} className="absolute inset-0" />

      {/* Pixel planets */}
      {showPlanets && (
        <>
          <div className="absolute top-[6%] left-[5%] animate-float-slow">
            <PixelPlanetPurple size={120} />
          </div>
          <div className="absolute top-[12%] right-[10%] animate-float" style={{ animationDelay: '1s' }}>
            <PixelPlanetTeal size={80} />
          </div>
          <div className="absolute bottom-[25%] right-[5%] animate-float-slow" style={{ animationDelay: '2s' }}>
            <PixelPlanetRed size={55} />
          </div>
        </>
      )}

      {/* Pixel clouds */}
      {showClouds && <PixelClouds />}

      {/* Scanline overlay */}
      <div className="absolute inset-0 pointer-events-none"
        style={{
          background: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.03) 2px, rgba(0,0,0,0.03) 4px)',
        }} />
    </div>
  );
};

export default StarfieldBackground;

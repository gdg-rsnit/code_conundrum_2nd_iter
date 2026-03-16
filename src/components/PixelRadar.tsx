import { useEffect, useRef } from 'react';

const PixelRadar = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const cv = canvasRef.current;
    if (!cv) return;
    const ctx = cv.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let angle = 0;
    
    // Store active dots: { x, y, alpha, maxAlpha }
    const dots: { x: number, y: number, alpha: number, maxAlpha: number }[] = [];

    // Pixel size multiplier
    const P = 4;
    function sn(v: number) { return Math.round(v / P) * P; }
    
    function drawPixelArc(cx: number, cy: number, r: number, color: string) {
      ctx!.fillStyle = color;
      let x = r;
      let y = 0;
      let err = 0;

      while (x >= y) {
        ctx!.fillRect(sn(cx + x), sn(cy + y), P, P);
        ctx!.fillRect(sn(cx + y), sn(cy + x), P, P);
        ctx!.fillRect(sn(cx - y), sn(cy + x), P, P);
        ctx!.fillRect(sn(cx - x), sn(cy + y), P, P);
        ctx!.fillRect(sn(cx - x), sn(cy - y), P, P);
        ctx!.fillRect(sn(cx - y), sn(cy - x), P, P);
        ctx!.fillRect(sn(cx + y), sn(cy - x), P, P);
        ctx!.fillRect(sn(cx + x), sn(cy - y), P, P);

        if (err <= 0) {
          y += P;
          err += 2 * y + P;
        }
        if (err > 0) {
          x -= P;
          err -= 2 * x + P;
        }
      }
    }

    const draw = () => {
      ctx.imageSmoothingEnabled = false;
      ctx.clearRect(0, 0, cv.width, cv.height);
      const cx = cv.width / 2;
      const cy = cv.height / 2;
      const maxRadius = Math.min(cx, cy) - P * 2;
      
      // Draw pixelated concentric circles
      drawPixelArc(cx, cy, maxRadius * 0.33, 'rgba(0, 245, 255, 0.4)');
      drawPixelArc(cx, cy, maxRadius * 0.66, 'rgba(0, 245, 255, 0.3)');
      drawPixelArc(cx, cy, maxRadius, 'rgba(0, 245, 255, 0.5)');
      
      // Pixelated Crosshairs
      ctx.fillStyle = 'rgba(0, 245, 255, 0.2)';
      for(let x = P; x < cv.width - P; x += P * 2) {
        ctx.fillRect(sn(x), sn(cy), P, P);
      }
      for(let y = P; y < cv.height - P; y += P * 2) {
        ctx.fillRect(sn(cx), sn(y), P, P);
      }

      // Draw sweeping radar arm
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(angle);
      
      // Sweep gradient (standard arc is fine here because standard pixel math for a filled slice is too heavy)
      const gradient = ctx.createConicGradient(0, 0, 0);
      gradient.addColorStop(0, 'rgba(0, 255, 170, 0.6)');
      gradient.addColorStop(0.15, 'rgba(0, 255, 170, 0.1)');
      gradient.addColorStop(0.25, 'rgba(0, 245, 255, 0)');
      
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.arc(0, 0, maxRadius, 0, Math.PI / 2);
      ctx.fill();
      
      // Solid leading edge line (pixelated)
      ctx.fillStyle = '#00FFAA';
      for(let r = 0; r < maxRadius; r += P) {
         ctx.fillRect(sn(r), 0, P, P);
      }
      
      ctx.restore();

      // Randomly spawn a dot near the sweep arm
      if (Math.random() < 0.1) {
        // Find a point just behind the sweeping arm
        const dotAngle = angle - Math.random() * 0.3;
        const dotRadius = Math.random() * maxRadius * 0.9;
        dots.push({
          x: cx + Math.cos(dotAngle) * dotRadius,
          y: cy + Math.sin(dotAngle) * dotRadius,
          alpha: 1.0,
          maxAlpha: 0.8 + Math.random() * 0.2
        });
      }

      // Draw fading dots
      for (let i = dots.length - 1; i >= 0; i--) {
        const dot = dots[i];
        
        ctx.fillStyle = `rgba(0, 255, 170, ${dot.alpha})`;
        
        // Draw 2x2 pixelated dot
        ctx.fillRect(sn(dot.x) - P, sn(dot.y) - P, P * 2, P * 2);
        
        ctx.fillStyle = `rgba(255, 255, 255, ${dot.alpha})`;
        ctx.fillRect(sn(dot.x), sn(dot.y) - P, P, P);
        
        // Decay the dot
        dot.alpha -= 0.006;
        if (dot.alpha <= 0) {
          dots.splice(i, 1);
        }
      }

      angle += 0.035;
      animationFrameId = requestAnimationFrame(draw);
    };

    draw();

    return () => cancelAnimationFrame(animationFrameId);
  }, []);

  return (
    <div className="w-full h-full flex items-center justify-center">
      <canvas 
        ref={canvasRef} 
        width={240} 
        height={240}
        style={{ 
          display: 'block',
          width: '100%',
          height: '100%',
          filter: 'drop-shadow(0 0 8px rgba(0, 255, 170, 0.4))',
          imageRendering: 'pixelated'
        }}
      />
    </div>
  );
};

export default PixelRadar;

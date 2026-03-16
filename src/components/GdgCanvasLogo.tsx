import { useEffect, useRef } from 'react';
import gdgLogo from '@/assets/gdg-logo5.png';

const GdgCanvasLogo = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const cv = canvasRef.current;
    if (!cv) return;
    const ctx = cv.getContext('2d');
    if (!ctx) return;

    ctx.imageSmoothingEnabled = false;
    const W = 300, H = 130, PX = 10;

    const R = '#EA4335', B = '#4285F4', Y = '#FBBC04', G = '#34A853';
    const ALL4 = [R, B, Y, G];

    function sn(v: number) { return Math.round(v / PX) * PX; }

    const CY = 60;
    const LTX = 20, RTX = 280;
    const LUX = 120, LUY = 10;
    const LLX = 120, LLY = 120;
    const RUX = 180, RUY = 10;
    const RLX = 180, RLY = 120;

    const ARM = 100;
    let L45X = sn(LTX + ARM * 0.707);
    let L45Y = sn(CY - ARM * 0.707);
    if (L45Y < 0) L45Y = 0;

    let R45X = sn(RTX - ARM * 0.707);
    let R45Y = sn(CY + ARM * 0.707);
    if (R45Y > 120) R45Y = 120;

    function easeOutBounce(t: number) {
      const n = 7.5625, d = 2.75;
      if (t < 1 / d) return n * t * t;
      if (t < 2 / d) { t -= 1.5 / d; return n * t * t + 0.75; }
      if (t < 2.5 / d) { t -= 2.25 / d; return n * t * t + 0.9375; }
      t -= 2.625 / d; return n * t * t + 0.984375;
    }
    function easeInOut(t: number) { return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t; }
    function easeOut3(t: number) { return 1 - Math.pow(1 - t, 3); }
    function easeOutBack(t: number) { const c = 1.70158; return 1 + (c + 1) * Math.pow(t - 1, 3) + c * Math.pow(t - 1, 2); }
    function lerp(a: number, b: number, t: number) { return a + (b - a) * t; }
    function clamp01(v: number) { return v < 0 ? 0 : v > 1 ? 1 : v; }
    function seg(el: number, s: number, e: number) { return clamp01((el - s) / (e - s)); }

    function pxLine(x1: number, y1: number, x2: number, y2: number, col: string, alpha?: number) {
      ctx!.globalAlpha = alpha === undefined ? 1 : alpha;
      ctx!.fillStyle = col;
      const dx = x2 - x1, dy = y2 - y1, len = Math.sqrt(dx * dx + dy * dy);
      if (len < 1) { ctx!.globalAlpha = 1; return; }
      const steps = Math.ceil(len / PX) * 5, seen: Record<string, number> = {};
      for (let i = 0; i <= steps; i++) {
        const t = i / steps, bx = sn(x1 + dx * t), by = sn(y1 + dy * t), k = bx + ',' + by;
        if (!seen[k]) { seen[k] = 1; ctx!.fillRect(bx, by, PX, PX); }
      }
      ctx!.globalAlpha = 1;
    }
    function pxArm(ax: number, ay: number, bx: number, by: number, col: string, alpha?: number) {
      const a = alpha === undefined ? 1 : alpha;
      pxLine(ax, ay, bx, by, col, a);
      pxLine(ax, ay + PX, bx, by + PX, col, a * 0.5);
    }
    function pxGlow(ax: number, ay: number, bx: number, by: number, col: string) {
      const o = [[-PX, 0], [PX, 0], [0, -PX], [0, PX]];
      for (let i = 0; i < o.length; i++)
        pxLine(ax + o[i][0], ay + o[i][1], bx + o[i][0], by + o[i][1], col, 0.10);
    }
    function pxCircle(cx: number, cy: number, r: number, col: string, alpha?: number) {
      ctx!.globalAlpha = alpha === undefined ? 1 : alpha;
      ctx!.fillStyle = col;
      for (let dy2 = -r - PX; dy2 <= r + PX; dy2 += PX)
        for (let dx2 = -r - PX; dx2 <= r + PX; dx2 += PX)
          if ((dx2 + PX / 2) * (dx2 + PX / 2) + (dy2 + PX / 2) * (dy2 + PX / 2) <= r * r)
            ctx!.fillRect(sn(cx + dx2), sn(cy + dy2), PX, PX);
      ctx!.globalAlpha = 1;
    }

    const sparks: any[] = [];
    let sparksSpawned = false;
    function spawnSparks() {
      const pts = [[LTX, CY], [RTX, CY], [LUX, LUY], [LLX, LLY], [RUX, RUY], [RLX, RLY]];
      for (let p = 0; p < pts.length; p++)
        for (let i = 0; i < 12; i++) {
          const ang = (i / 12) * Math.PI * 2, sp = 0.6 + Math.random() * 2;
          sparks.push({
            x: pts[p][0], y: pts[p][1],
            vx: Math.cos(ang) * sp, vy: Math.sin(ang) * sp,
            col: ALL4[Math.floor(Math.random() * 4)],
            life: 1, decay: 0.028 + Math.random() * 0.022
          });
        }
    }
    function tickSparks() {
      for (let i = sparks.length - 1; i >= 0; i--) {
        const s = sparks[i];
        ctx!.globalAlpha = s.life * s.life;
        ctx!.fillStyle = s.col;
        ctx!.fillRect(sn(s.x), sn(s.y), PX, PX);
        s.x += s.vx; s.y += s.vy; s.life -= s.decay;
        if (s.life <= 0) sparks.splice(i, 1);
      }
      ctx!.globalAlpha = 1;
    }

    const T = { dropEnd: 600, flashEnd: 900, extendEnd: 1700, springEnd: 2400, holdEnd: 4250 };
    let t0: number | null = null;
    let animationId: number;

    function frame(ts: number) {
      if (!t0) t0 = ts;
      const el = ts - t0;
      ctx!.clearRect(0, 0, W, H);

      if (el <= T.dropEnd) {
        const lp = easeOutBounce(clamp01(el / T.dropEnd));
        const rp = easeOutBounce(clamp01((el - 80) / T.dropEnd));
        pxCircle(LTX, sn(lerp(-30, CY, lp)), PX, R);
        if (el > 80) pxCircle(RTX, sn(lerp(-30, CY, rp)), PX, G);
      }
      else if (el <= T.flashEnd) {
        const ft = seg(el, T.dropEnd, T.flashEnd);
        const pulse = Math.max(0, 1 - ft * 2.5);
        pxCircle(LTX, CY, PX, ft < 0.4 ? '#ffffff' : R, 0.7 + pulse * 0.3);
        pxCircle(RTX, CY, PX, ft < 0.4 ? '#ffffff' : G, 0.7 + pulse * 0.3);
      }
      else if (el <= T.extendEnd) {
        const et = easeInOut(seg(el, T.flashEnd, T.extendEnd));
        const lax = sn(lerp(LTX, L45X, et)), lay = sn(lerp(CY, L45Y, et));
        const rax = sn(lerp(RTX, R45X, et)), ray = sn(lerp(CY, R45Y, et));

        pxGlow(LTX, CY, lax, lay, B);
        pxGlow(RTX, CY, rax, ray, G);
        pxArm(LTX, CY, lax, lay, B);
        pxArm(RTX, CY, rax, ray, G);

        pxCircle(LTX, CY, PX, R, 0.55);
        pxCircle(RTX, CY, PX, G, 0.55);
      }
      else if (el <= T.springEnd) {
        const st = easeOutBack(clamp01(seg(el, T.extendEnd, T.springEnd)));
        const pt = easeOut3(seg(el, T.extendEnd, T.springEnd));

        const blx = sn(lerp(L45X, LLX, st)), bly = sn(lerp(L45Y, LLY, st));
        const rlx = sn(lerp(LTX, LUX, pt)), rly = sn(lerp(CY, LUY, pt));
        const grx = sn(lerp(R45X, RUX, st)), gry = sn(lerp(R45Y, RUY, st));
        const ylx = sn(lerp(RTX, RLX, pt)), yly = sn(lerp(CY, RLY, pt));

        pxGlow(LTX, CY, blx, bly, B);
        pxGlow(LTX, CY, rlx, rly, R);
        pxGlow(RTX, CY, grx, gry, G);
        pxGlow(RTX, CY, ylx, yly, Y);

        pxArm(LTX, CY, blx, bly, B);
        pxArm(LTX, CY, rlx, rly, R);
        pxArm(RTX, CY, grx, gry, G);
        pxArm(RTX, CY, ylx, yly, Y);

        if (st > 0.85 && !sparksSpawned) { sparksSpawned = true; spawnSparks(); }
      }
      else {
        pxGlow(LTX, CY, LUX, LUY, R); pxGlow(LTX, CY, LLX, LLY, B);
        pxGlow(RTX, CY, RUX, RUY, G); pxGlow(RTX, CY, RLX, RLY, Y);
        pxArm(LTX, CY, LUX, LUY, R); pxArm(LTX, CY, LLX, LLY, B);
        pxArm(RTX, CY, RUX, RUY, G); pxArm(RTX, CY, RLX, RLY, Y);
      }

      tickSparks();
      if (el < T.holdEnd) {
        animationId = requestAnimationFrame(frame);
      }
    }

    animationId = requestAnimationFrame(frame);

    return () => cancelAnimationFrame(animationId);
  }, []);

  return (
    <div className="flex flex-col items-center mb-10 z-20 relative">
      <canvas id="gdg-logo-canvas" ref={canvasRef} width="300" height="130"></canvas>
      <div className="flex flex-col items-center mt-[-10px]">
        <div className="intro-wordmark animate-wIn" style={{ animationDelay: '2.5s', animationFillMode: 'both' }}>
          <span className="g-blue">G</span><span className="g-red">D</span><span className="g-grn">G</span><span
            className="g-wht">o</span><span className="g-yellow">C</span>
          &nbsp;
          <span className="g-wht">R</span><span className="g-blue">N</span><span className="g-red">S</span><span
            className="g-grn">I</span><span className="g-yellow">T</span>
        </div>
        <div className="intro-dots" style={{ animationDelay: '3.1s', animationFillMode: 'both' }}>
          <div className="intro-dot" style={{ animationDelay: '0s' }}></div>
          <div className="intro-dot" style={{ animationDelay: '0.25s' }}></div>
          <div className="intro-dot" style={{ animationDelay: '0.5s' }}></div>
          <div className="intro-dot" style={{ animationDelay: '0.75s' }}></div>
        </div>
        <div className="intro-presents animate-wIn" style={{ animationDelay: '3.4s', animationFillMode: 'both' }}>&mdash; PRESENTS &mdash;</div>
      </div>
    </div>
  );
};

export default GdgCanvasLogo;

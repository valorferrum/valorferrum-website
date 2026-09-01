import { useEffect, useRef } from 'react';

const TAU = Math.PI * 2;

const WAVES = [
  { color: '#22D3EE', y: 0.66, amp: 30, amp2: 12, freq: 0.010, freq2: 0.021, speed: 1.0, n: 240, size: 2.2 },
  { color: '#EC4899', y: 0.79, amp: 38, amp2: 14, freq: 0.008, freq2: 0.017, speed: 0.7, n: 240, size: 2.4 },
  { color: '#FBBF24', y: 0.92, amp: 26, amp2: 10, freq: 0.012, freq2: 0.024, speed: 1.3, n: 200, size: 2.0 },
];
const DUST = ['#8B5CF6', '#EC4899', '#22D3EE', '#FBBF24'];

type WaveP = { x: number; j: number; r: number; a: number; ph: number; w: number };
type DustP = { x: number; y: number; r: number; c: string; v: number; ph: number; a: number };

const rgba = (hex: string, a: number) => {
  const n = parseInt(hex.slice(1), 16);
  return `rgba(${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255}, ${a})`;
};

// Glow-Sprite: heller Kern -> Farbe -> transparent (der "Leucht"-Look)
const makeSprite = (color: string) => {
  const s = document.createElement('canvas');
  s.width = 32;
  s.height = 32;
  const c = s.getContext('2d')!;
  const g = c.createRadialGradient(16, 16, 0, 16, 16, 16);
  g.addColorStop(0, 'rgba(255,255,255,0.95)');
  g.addColorStop(0.2, rgba(color, 0.9));
  g.addColorStop(0.55, rgba(color, 0.35));
  g.addColorStop(1, rgba(color, 0));
  c.fillStyle = g;
  c.fillRect(0, 0, 32, 32);
  return s;
};

export default function ParticleStream() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const sprites = WAVES.map((w) => makeSprite(w.color));
    const dustSprites = DUST.map((c) => makeSprite(c));

    let w = 0, h = 0, raf = 0, visible = false;
    let wavePs: WaveP[] = [];
    let dustPs: DustP[] = [];

    const draw = (t: number) => {
      ctx.clearRect(0, 0, w, h);
      ctx.globalCompositeOperation = 'lighter'; // additive = leuchtend

      // Dichte, glühende Wellenbänder
      for (const p of wavePs) {
        const wv = WAVES[p.w];
        const y =
          h * wv.y +
          Math.sin(p.x * wv.freq + t * 0.0006 * wv.speed + p.ph) * wv.amp +
          Math.sin(p.x * wv.freq2 - t * 0.0004 * wv.speed) * wv.amp2 +
          p.j;
        ctx.globalAlpha = p.a * (0.6 + 0.4 * Math.sin(t / 900 + p.ph));
        const d = p.r * 8;
        ctx.drawImage(sprites[p.w], p.x - d / 2, y - d / 2, d, d);
      }

      // Schwebender Staub darüber
      for (const p of dustPs) {
        const y = p.y + Math.sin(t / 4000 + p.ph) * 10;
        ctx.globalAlpha = p.a * (0.6 + 0.4 * Math.sin(t / 1400 + p.ph));
        const d = p.r * 8;
        ctx.drawImage(dustSprites[p.c === '#8B5CF6' ? 0 : p.c === '#EC4899' ? 1 : p.c === '#22D3EE' ? 2 : 3], p.x - d / 2, y - d / 2, d, d);
      }

      ctx.globalAlpha = 1;
      ctx.globalCompositeOperation = 'source-over';
    };

    const loop = (t: number) => {
      for (const p of dustPs) {
        p.x += p.v;
        if (p.x > w + 10) p.x = -10;
      }
      draw(t);
      raf = requestAnimationFrame(loop);
    };

    const stop = () => { cancelAnimationFrame(raf); raf = 0; };
    const start = () => { if (!reduced && visible && !raf) raf = requestAnimationFrame(loop); };

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      w = rect.width;
      h = rect.height;
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      const mobile = w < 768 ? 0.45 : 1;

      wavePs = [];
      WAVES.forEach((wv, wi) => {
        const n = Math.round(wv.n * mobile);
        for (let i = 0; i < n; i++) {
          wavePs.push({
            x: Math.random() * w,
            j: (Math.random() - 0.5) * 5,   // enges Band = zusammenhängende Welle
            r: wv.size * (0.6 + Math.random() * 0.8),
            a: 0.3 + Math.random() * 0.55,
            ph: Math.random() * TAU,
            w: wi,
          });
        }
      });

      dustPs = Array.from({ length: Math.round(50 * mobile) }, () => ({
        x: Math.random() * w,
        y: Math.random() * h * 0.6,
        r: 0.5 + Math.random() * 1.2,
        c: DUST[Math.floor(Math.random() * DUST.length)],
        v: 0.05 + Math.random() * 0.2,
        ph: Math.random() * TAU,
        a: 0.15 + Math.random() * 0.4,
      }));

      if (reduced) draw(1200);
    };

    const observer = new IntersectionObserver(
      ([entry]) => {
        visible = entry.isIntersecting;
        if (visible) start(); else stop();
      },
      { threshold: 0.1 }
    );
    const onVis = () => { if (document.hidden) stop(); else start(); };

    resize();
    observer.observe(canvas);
    window.addEventListener('resize', resize);
    document.addEventListener('visibilitychange', onVis);

    return () => {
      stop();
      observer.disconnect();
      window.removeEventListener('resize', resize);
      document.removeEventListener('visibilitychange', onVis);
    };
  }, []);

  return <canvas ref={canvasRef} className="particle-stream" aria-hidden="true" />;
}
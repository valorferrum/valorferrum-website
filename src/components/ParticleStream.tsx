import { useEffect, useRef } from 'react';

const TAU = Math.PI * 2;

// Drei Wellen-Bänder wie im Mockup (Cyan / Pink / Amber)
const WAVES = [
  { color: '#22D3EE', y: 0.70, amp: 26, freq: 0.011, speed: 1.0, size: 1.6, n: 110 },
  { color: '#EC4899', y: 0.81, amp: 34, freq: 0.008, speed: 0.7, size: 1.8, n: 110 },
  { color: '#FBBF24', y: 0.92, amp: 22, freq: 0.013, speed: 1.3, size: 1.5, n: 90 },
];
const DUST_COLORS = ['#8B5CF6', '#EC4899', '#22D3EE', '#FBBF24'];

type WaveP = { x: number; j: number; r: number; a: number; ph: number; w: number };
type DustP = { x: number; y: number; r: number; c: string; v: number; ph: number; a: number };

export default function ParticleStream() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    let w = 0, h = 0, raf = 0, visible = false;
    let wavePs: WaveP[] = [];
    let dustPs: DustP[] = [];

    const draw = (t: number) => {
      ctx.clearRect(0, 0, w, h);

      // Partikel-Wellen
      for (const p of wavePs) {
        const wv = WAVES[p.w];
        const y = h * wv.y + Math.sin(p.x * wv.freq + t * 0.0006 * wv.speed + p.ph) * wv.amp + p.j;
        ctx.globalAlpha = p.a * (0.55 + 0.45 * Math.sin(t / 900 + p.ph));
        ctx.fillStyle = wv.color;
        ctx.beginPath();
        ctx.arc(p.x, y, p.r, 0, TAU);
        ctx.fill();
      }

      // Schwebender Staub darüber
      for (const p of dustPs) {
        const y = p.y + Math.sin(t / 4000 + p.ph) * 10;
        ctx.globalAlpha = p.a * (0.6 + 0.4 * Math.sin(t / 1400 + p.ph));
        ctx.fillStyle = p.c;
        ctx.beginPath();
        ctx.arc(p.x, y, p.r, 0, TAU);
        ctx.fill();
      }
      ctx.globalAlpha = 1;
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
            j: (Math.random() - 0.5) * 8,
            r: wv.size * (0.6 + Math.random() * 0.8),
            a: 0.25 + Math.random() * 0.55,
            ph: Math.random() * TAU,
            w: wi,
          });
        }
      });

      dustPs = Array.from({ length: Math.round(40 * mobile) }, () => ({
        x: Math.random() * w,
        y: Math.random() * h * 0.6,
        r: 0.5 + Math.random() * 1.3,
        c: DUST_COLORS[Math.floor(Math.random() * DUST_COLORS.length)],
        v: 0.05 + Math.random() * 0.2,
        ph: Math.random() * TAU,
        a: 0.15 + Math.random() * 0.4,
      }));

      if (reduced) draw(1200); // statisches Bild bei reduced motion
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
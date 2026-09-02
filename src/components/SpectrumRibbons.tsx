// src/components/SpectrumRibbons.tsx
import { useEffect, useRef } from 'react';

interface Props {
  variant?: 'hero' | 'divider';
  className?: string;
}

type Pt = { x: number; y: number };

interface Ribbon {
  sx: number; sy: number; ex: number; ey: number;
  bend: number; amp: number; freq: number; speed: number; phase: number;
  baseW: number; wFreq: number; wSpeed: number; wPhase: number;
  colors: [string, string, string];
  glow: string; glowSize: number; alpha: number; dashOffset: number;
}

const TAU = Math.PI * 2;
const N = 56; // Samples pro Ribbon

/** Ribbon-Geometrien pro Variante (abhängig von Canvas-Größe) */
function buildConfigs(variant: 'hero' | 'divider', w: number, h: number): Ribbon[] {
  if (variant === 'hero') {
    const s = Math.max(0.6, Math.min(w / 1440, h / 900));
    return [
      // Haupt-Ribbon: dick, diagonal, volle Fülle
      { sx: w * 1.08, sy: -h * 0.12, ex: -w * 0.08, ey: h * 1.12, bend: h * 0.14, amp: h * 0.045, freq: 1.4, speed: 0.7, phase: 0.8, baseW: 42 * s, wFreq: 2.1, wSpeed: 0.9, wPhase: 1.7, colors: ['#EC4899', '#A65CF6', '#3B82F6'], glow: 'rgba(166,92,246,0.55)', glowSize: 26 * s, alpha: 0.95, dashOffset: 0 },
      // Zweites Ribbon: schlanker, gegenläufig
      { sx: w * 1.16, sy: -h * 0.02, ex: w * 0.02, ey: h * 1.22, bend: -h * 0.1, amp: h * 0.035, freq: 1.8, speed: 0.95, phase: 2.1, baseW: 22 * s, wFreq: 2.6, wSpeed: 1.15, wPhase: 0.4, colors: ['#3B82F6', '#8B5CF6', '#EC4899'], glow: 'rgba(236,72,153,0.45)', glowSize: 20 * s, alpha: 0.9, dashOffset: 300 },
      // Drittes: dünn, kreuzend, mit Gelb-Akzent
      { sx: -w * 0.08, sy: h * 0.8, ex: w * 1.08, ey: h * 0.18, bend: h * 0.08, amp: h * 0.028, freq: 2.2, speed: 0.6, phase: 4.0, baseW: 11 * s, wFreq: 3.0, wSpeed: 0.8, wPhase: 2.6, colors: ['#A65CF6', '#EC4899', '#FBBF24'], glow: 'rgba(139,92,246,0.4)', glowSize: 16 * s, alpha: 0.8, dashOffset: 600 },
    ];
  }
  const s = Math.max(0.5, h / 160);
  return [
    { sx: -w * 0.05, sy: h * 0.72, ex: w * 1.05, ey: h * 0.3, bend: h * 0.3, amp: h * 0.14, freq: 1.5, speed: 0.7, phase: 0.5, baseW: 18 * s, wFreq: 2.4, wSpeed: 0.9, wPhase: 1.2, colors: ['#EC4899', '#A65CF6', '#3B82F6'], glow: 'rgba(166,92,246,0.5)', glowSize: 18 * s, alpha: 0.95, dashOffset: 0 },
    { sx: -w * 0.05, sy: h * 0.3, ex: w * 1.05, ey: h * 0.75, bend: -h * 0.22, amp: h * 0.12, freq: 1.9, speed: 0.85, phase: 2.8, baseW: 10 * s, wFreq: 2.8, wSpeed: 1.1, wPhase: 0.2, colors: ['#3B82F6', '#8B5CF6', '#EC4899'], glow: 'rgba(59,130,246,0.4)', glowSize: 14 * s, alpha: 0.85, dashOffset: 420 },
  ];
}

function strokePts(ctx: CanvasRenderingContext2D, pts: Pt[]) {
  ctx.beginPath();
  ctx.moveTo(pts[0].x, pts[0].y);
  for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i].x, pts[i].y);
  ctx.stroke();
}

function drawRibbon(ctx: CanvasRenderingContext2D, r: Ribbon, time: number) {
  const dx = r.ex - r.sx;
  const dy = r.ey - r.sy;
  const len = Math.hypot(dx, dy) || 1;
  const nx = -dy / len;
  const ny = dx / len;

  // Mittellinie (Welle) + variable Breite (liquid) + Taper an den Enden
  const center: Pt[] = [];
  const widths: number[] = [];
  for (let i = 0; i <= N; i++) {
    const t = i / N;
    const wave =
      Math.sin(t * r.freq * TAU + time * r.speed + r.phase) * 0.7 +
      Math.sin(t * r.freq * 2.3 * TAU - time * r.speed * 0.8 + r.phase * 2) * 0.3;
    const off = r.bend * Math.sin(Math.PI * t) + r.amp * wave;
    const taper = Math.pow(Math.max(0.02, Math.sin(Math.PI * t)), 0.45); // spitze Enden
    const wvar = 0.35 + 0.65 * (0.5 + 0.5 * Math.sin(t * r.wFreq * TAU + time * r.wSpeed + r.wPhase));
    center.push({ x: r.sx + dx * t + nx * off, y: r.sy + dy * t + ny * off });
    widths.push(r.baseW * taper * wvar);
  }

  // Kanten aus Normalen bauen
  const top: Pt[] = [];
  const bot: Pt[] = [];
  const gloss: Pt[] = [];
  const shade: Pt[] = [];
  for (let i = 0; i <= N; i++) {
    const prev = center[Math.max(0, i - 1)];
    const next = center[Math.min(N, i + 1)];
    let tx = next.x - prev.x;
    let ty = next.y - prev.y;
    const tl = Math.hypot(tx, ty) || 1;
    tx /= tl; ty /= tl;
    const px = -ty;
    const py = tx;
    const hw = widths[i] / 2;
    top.push({ x: center[i].x + px * hw, y: center[i].y + py * hw });
    bot.push({ x: center[i].x - px * hw, y: center[i].y - py * hw });
    gloss.push({ x: center[i].x + px * hw * 0.55, y: center[i].y + py * hw * 0.55 });
    shade.push({ x: center[i].x - px * hw * 0.6, y: center[i].y - py * hw * 0.6 });
  }

  const grad = ctx.createLinearGradient(r.sx, r.sy, r.ex, r.ey);
  grad.addColorStop(0, r.colors[0]);
  grad.addColorStop(0.5, r.colors[1]);
  grad.addColorStop(1, r.colors[2]);

  // 1) Body + Outer Glow (Liquid-Körper)
  ctx.save();
  ctx.globalAlpha = r.alpha;
  ctx.shadowColor = r.glow;
  ctx.shadowBlur = r.glowSize;
  ctx.beginPath();
  ctx.moveTo(top[0].x, top[0].y);
  for (let i = 1; i <= N; i++) ctx.lineTo(top[i].x, top[i].y);
  for (let i = N; i >= 0; i--) ctx.lineTo(bot[i].x, bot[i].y);
  ctx.closePath();
  ctx.fillStyle = grad;
  ctx.fill();
  ctx.restore();

  // 2) Shading + Gloss (3D/Glas-Look)
  ctx.save();
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';

  // dunkle Kante unten → Rundung/Tiefe
  ctx.globalAlpha = 0.3;
  ctx.strokeStyle = '#0A0A0F';
  ctx.lineWidth = Math.max(1.5, r.baseW * 0.1);
  strokePts(ctx, shade);

  // breites, faintes Glas-Band oben
  ctx.globalAlpha = 0.16;
  ctx.strokeStyle = '#FFFFFF';
  ctx.lineWidth = Math.max(2, r.baseW * 0.22);
  strokePts(ctx, gloss);

  // wandernder Specular-Puls (Licht läuft entlang)
  ctx.globalAlpha = 0.9;
  ctx.strokeStyle = 'rgba(255,255,255,0.9)';
  ctx.lineWidth = 2.2;
  ctx.setLineDash([90, 760]);
  ctx.lineDashOffset = -(time * 140 + r.dashOffset);
  strokePts(ctx, gloss);
  ctx.restore();
}

export default function SpectrumRibbons({ variant = 'hero', className = '' }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const prefersReduced =
    typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let raf = 0;
    let time = 0;
    let w = 0;
    let h = 0;
    let ribbons: Ribbon[] = [];

    const resize = () => {
      const dpr = window.devicePixelRatio || 1;
      const rect = canvas.getBoundingClientRect();
      w = rect.width;
      h = rect.height;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ribbons = buildConfigs(variant, w, h);
    };

    const frame = () => {
      ctx.clearRect(0, 0, w, h);
      for (const r of ribbons) drawRibbon(ctx, r, time);
    };

    resize();
    window.addEventListener('resize', resize);

    // Performance: nur animieren, solange das Element sichtbar ist
    let running = false;
    const loop = () => {
      if (!running) return;
      time += 0.016;
      frame();
      raf = requestAnimationFrame(loop);
    };
    const start = () => { if (!running) { running = true; loop(); } };
    const stop = () => { running = false; cancelAnimationFrame(raf); };

    const io = new IntersectionObserver(
      ([entry]) => (entry.isIntersecting ? start() : stop()),
      { threshold: 0.05 }
    );
    io.observe(canvas);

    if (prefersReduced) {
      time = 2.0;
      frame();
    } else {
      start();
    }

    return () => {
      stop();
      io.disconnect();
      window.removeEventListener('resize', resize);
    };
  }, [variant, prefersReduced]);

  return (
    <div
      className={
        variant === 'hero'
          ? `pointer-events-none absolute inset-0 ${className}`
          : `pointer-events-none relative h-24 md:h-32 ${className}`
      }
      aria-hidden="true"
    >
      <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" />
    </div>
  );
}
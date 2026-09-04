/**
 * GradientWaves – Performanter Port von reactbits.dev/backgrounds/gradient-waves
 * Gleiche Props & Lifecycle (IO/Visibility-Pause, DPR-Cap, Quality-Tiers,
 * Mouse-Parallax, Grain), aber Canvas 2D statt OGL-WebGL → 0 KB Dependency.
 */
import { useEffect, useRef } from 'react';

interface GradientWavesProps {
  horizonColor?: string; waveColor?: string; crestColor?: string;
  speed?: number; amplitude?: number; waveScale?: number; waveRatio?: number;
  swell?: number; turbulence?: number; tilt?: number; zoom?: number;
  height?: number; fogDepth?: number; detail?: 'low' | 'medium' | 'high';
  brightness?: number; opacity?: number;
  mouseInteraction?: boolean; parallaxStrength?: number;
  grain?: boolean; grainIntensity?: number; className?: string;
}

const hexToRgb = (hex: string): [number, number, number] => {
  const r = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!r) return [255, 255, 255];
  return [parseInt(r[1], 16), parseInt(r[2], 16), parseInt(r[3], 16)];
};
const mix = (a: [number, number, number], b: [number, number, number], t: number) =>
  [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t] as [number, number, number];

/* Quality-Tiers wie Original (detail → Steps), hier: Layer/Step/DPR */
const tierFor = (detail: string, isMobile: boolean) => {
  let d = detail;
  if (isMobile && d !== 'low') d = 'low';
  if (d === 'low') return { layers: 10, step: 16, dpr: 1 };
  if (d === 'high') return { layers: 24, step: 7, dpr: 2 };
  return { layers: 16, step: 10, dpr: 1.5 };
};

const GRAIN_URI =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='160' height='160'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.6'/%3E%3C/svg%3E\")";

export default function GradientWaves({
  horizonColor = '#2E1065', waveColor = '#A65CF6', crestColor = '#EC4899',
  speed = 0.4, amplitude = 2.5, waveScale = 0.6, waveRatio = 0.9,
  swell = 35, turbulence = 20, tilt = 1.11, zoom = 1, height = 5.5, fogDepth = 15,
  detail = 'medium', brightness = 1, opacity = 1,
  mouseInteraction = true, parallaxStrength = 0.5,
  grain = true, grainIntensity = 0.05, className = '',
}: GradientWavesProps) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const wrap = wrapRef.current, canvas = canvasRef.current;
    if (!wrap || !canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
    const tier = tierFor(detail, isMobile);

    const H = hexToRgb(horizonColor), W = hexToRgb(waveColor), C = hexToRgb(crestColor);

    let w = 1, h = 1;
    const setSize = () => {
      const r = wrap.getBoundingClientRect();
      w = Math.max(1, Math.floor(r.width));
      h = Math.max(1, Math.floor(r.height));
      const dpr = Math.min(window.devicePixelRatio || 1, tier.dpr);
      canvas.width = Math.floor(w * dpr);
      canvas.height = Math.floor(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    setSize();
    const ro = new ResizeObserver(setSize);
    ro.observe(wrap);

    /* Mouse-Parallax wie Original (target/current, Lerp 0.05) */
    const target = [0.5, 0.5], cur = [0.5, 0.5];
    const onMove = (e: PointerEvent) => {
      if (!mouseInteraction) return;
      const r = canvas.getBoundingClientRect();
      target[0] = (e.clientX - r.left) / r.width;
      target[1] = 1 - (e.clientY - r.top) / r.height;
    };
    const onLeave = () => { target[0] = 0.5; target[1] = 0.5; };
    wrap.addEventListener('pointermove', onMove);
    wrap.addEventListener('pointerleave', onLeave);

    const render = (T: number) => {
      ctx.clearRect(0, 0, w, h);
      const horizonY = h * Math.min(0.8, Math.max(0.2, 0.62 - tilt * 0.16 - height * 0.004));
      const tc = [T / 0.13, T / 0.81, T / 0.2, T / 0.71];
      const fX = waveScale / 7, fY = (waveScale * waveRatio) / 3;
      const px = (cur[0] - 0.5) * parallaxStrength * 90;
      const py = (cur[1] - 0.5) * parallaxStrength * 40;

      for (let i = 0; i < tier.layers; i++) {
        const d = i / (tier.layers - 1);                    // 0 = fern … 1 = nah
        const yBase = horizonY + (h - horizonY) * Math.pow(d, 1.7);
        const fog = Math.min(1, Math.pow(d, 0.85) * (fogDepth / 15));
        if (fog <= 0.015) continue;
        const ampScale = ((0.25 + d * 1.6) * (h / 500)) / zoom;

        ctx.beginPath();
        ctx.moveTo(0, h);
        for (let x = 0; x <= w; x += tier.step) {
          const wx = ((x - w * 0.5) * 0.12) / zoom + px * (1 - d);
          const wy = (yBase - h * 0.5) * 0.12 + py * (1 - d);
          /* plasma()-Port: swell- & turbulence-Terme wie im Shader */
          const mx = wx + tc[0] * 6 + swell * Math.sin((wy + wx) / 20 + tc[1]);
          const my = wy - tc[2] * 6 + turbulence * Math.cos(wx / 23 + tc[3]);
          const hgt = Math.sin(mx * fX) * amplitude + Math.sin(my * fY) * amplitude;
          ctx.lineTo(x, yBase + hgt * ampScale);
        }
        ctx.lineTo(w, h);
        ctx.closePath();

        const body = mix(W, C, d * 0.7);                   // Crests nur vorne
        let col = mix(H, body, fog);
        col = [col[0] * brightness, col[1] * brightness, col[2] * brightness];
        ctx.fillStyle = `rgba(${col[0] | 0},${col[1] | 0},${col[2] | 0},${(fog * opacity).toFixed(3)})`;
        ctx.fill();
      }
    };

    let raf = 0, isVisible = true, isPageVisible = !document.hidden;
    const t0 = performance.now();
    const loop = (t: number) => {
      cur[0] += 0.05 * (target[0] - cur[0]);
      cur[1] += 0.05 * (target[1] - cur[1]);
      render((t - t0) * 0.001 * speed);
      raf = requestAnimationFrame(loop);
    };
    const tryStart = () => { if (isVisible && isPageVisible && !raf && !reduced) raf = requestAnimationFrame(loop); };
    const tryStop = () => { if (raf) { cancelAnimationFrame(raf); raf = 0; } };

    const io = new IntersectionObserver(([e]) => { isVisible = e.isIntersecting; isVisible ? tryStart() : tryStop(); }, { threshold: 0 });
    io.observe(wrap);
    const onVis = () => { isPageVisible = !document.hidden; isPageVisible ? tryStart() : tryStop(); };
    document.addEventListener('visibilitychange', onVis);

    render(12); // statischer Frame (auch reduced-motion / SSR-ähnlich)
    tryStart();

    return () => {
      tryStop(); ro.disconnect(); io.disconnect();
      document.removeEventListener('visibilitychange', onVis);
      wrap.removeEventListener('pointermove', onMove);
      wrap.removeEventListener('pointerleave', onLeave);
    };
  }, [horizonColor, waveColor, crestColor, speed, amplitude, waveScale, waveRatio, swell, turbulence, tilt, zoom, height, fogDepth, detail, brightness, opacity, mouseInteraction, parallaxStrength]);

  return (
    <div ref={wrapRef} className={`relative overflow-hidden ${className}`} aria-hidden="true">
      <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" />
      {grain && (
        <div
          className="gw-grain absolute inset-0 pointer-events-none"
          style={{ backgroundImage: GRAIN_URI, opacity: grainIntensity }}
        />
      )}
      <style>{`.gw-grain{animation:gwGrain 1.2s steps(4) infinite}@keyframes gwGrain{0%{background-position:0 0}25%{background-position:40px 60px}50%{background-position:-60px 20px}75%{background-position:20px -40px}100%{background-position:0 0}}@media(prefers-reduced-motion:reduce){.gw-grain{animation:none}}`}</style>
    </div>
  );
}
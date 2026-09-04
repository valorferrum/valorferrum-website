/**
 * LightPillar – Performanter Port von reactbits.dev/backgrounds/light-pillar
 * Gleiche Props, Quality-Tiers (24/40/80 Iterationen, 1/2/4 Wave-Oktaven,
 * pixelRatio 0.5/0.65/dpr, FPS 30/60, Mobile-Downgrade), aber Canvas 2D
 * mit additiver Akkumulation ('lighter') statt Three.js-Volumetric-Shader.
 */
import { useEffect, useRef } from 'react';

interface LightPillarProps {
  topColor?: string; bottomColor?: string;
  intensity?: number; rotationSpeed?: number; interactive?: boolean;
  glowAmount?: number; pillarWidth?: number; pillarHeight?: number;
  noiseIntensity?: number; mixBlendMode?: string; pillarRotation?: number;
  quality?: 'low' | 'medium' | 'high'; className?: string;
}

const hexToRgb = (hex: string): [number, number, number] => {
  const r = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!r) return [255, 255, 255];
  return [parseInt(r[1], 16), parseInt(r[2], 16), parseInt(r[3], 16)];
};
const mix = (a: [number, number, number], b: [number, number, number], t: number) =>
  [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t] as [number, number, number];
const rgba = (c: [number, number, number], a: number) =>
  `rgba(${c[0] | 0},${c[1] | 0},${c[2] | 0},${Math.min(1, Math.max(0, a)).toFixed(3)})`;

/* 1:1 die Quality-Settings des Originals */
const SETTINGS = {
  low:    { iterations: 24, waveIterations: 1, pixelRatio: 0.5, fps: 30 },
  medium: { iterations: 40, waveIterations: 2, pixelRatio: 0.65, fps: 60 },
  high:   { iterations: 80, waveIterations: 4, pixelRatio: 2, fps: 60 },
};

const NOISE_URI =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='160' height='160'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='2'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.5'/%3E%3C/svg%3E\")";

export default function LightPillar({
  topColor = '#A65CF6', bottomColor = '#EC4899',
  intensity = 1, rotationSpeed = 0.3, interactive = false,
  glowAmount = 0.005, pillarWidth = 3, pillarHeight = 0.4,
  noiseIntensity = 0.5, mixBlendMode = 'screen', pillarRotation = 0,
  quality = 'high', className = '',
}: LightPillarProps) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const wrap = wrapRef.current, canvas = canvasRef.current;
    if (!wrap || !canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
    const isLowEnd = isMobile || (navigator.hardwareConcurrency && navigator.hardwareConcurrency <= 4);

    /* identisches Downgrade wie Original */
    let q = quality;
    if (isLowEnd && q === 'high') q = 'medium';
    if (isMobile && q !== 'low') q = 'low';
    const S = SETTINGS[q];

    const TOP = hexToRgb(topColor), BOT = hexToRgb(bottomColor);

    let w = 1, h = 1;
    const setSize = () => {
      w = Math.max(1, wrap.clientWidth);
      h = Math.max(1, wrap.clientHeight);
      const dpr = Math.min(window.devicePixelRatio || 1, S.pixelRatio);
      canvas.width = Math.floor(w * dpr);
      canvas.height = Math.floor(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    setSize();
    let rsT: number | undefined;
    const onResize = () => { window.clearTimeout(rsT); rsT = window.setTimeout(setSize, 150); };
    window.addEventListener('resize', onResize);

    /* interactive → Maus steuert Rotation wie Original */
    let mouseA = 0, mouseTarget = 0;
    const onMove = (e: MouseEvent) => {
      if (!interactive) return;
      const r = wrap.getBoundingClientRect();
      mouseTarget = ((e.clientX - r.left) / r.width) * Math.PI * 2;
    };
    if (interactive) wrap.addEventListener('mousemove', onMove, { passive: true });

    const render = (t: number) => {
      ctx.clearRect(0, 0, w, h);
      ctx.save();
      const rot = (pillarRotation * Math.PI) / 180;
      ctx.translate(w / 2, h / 2);
      ctx.transform(1, 0, Math.tan(rot) * 0.15, 1, 0, 0); // pillarRotation als Skew
      ctx.translate(-w / 2, -h / 2);
      ctx.globalCompositeOperation = 'lighter';           // ≈ col += color / d

      mouseA += 0.05 * (mouseTarget - mouseA);
      const rotMod = 0.6 + 0.4 * Math.sin(t * 0.3);       // ≈ uRotCos/Sin(t*0.3)
      const cx = w / 2;
      const baseW = (Math.min(w, h) * 0.22 * pillarWidth) / 3;

      for (let i = 0; i < S.iterations; i++) {
        const yN = i / (S.iterations - 1);                // 0 unten → 1 oben
        const y = h * (1 - yN);
        const col = mix(BOT, TOP, yN);                    // Gradient bottom→top

        /* Wave-Oktaven wie die innere for-Schleife des Shaders */
        let dist = 0, amp = 1;
        for (let j = 0; j < S.waveIterations; j++) {
          dist += Math.cos(yN * (4 + j * 3) * pillarHeight * 6 + t * (1 + j * 0.7)) * amp;
          amp *= 0.5;
        }

        const taper = Math.pow(Math.sin(Math.PI * Math.min(1, Math.max(0.001, yN * 0.92 + 0.04))), 0.4);
        const xOff = dist * baseW * 0.35 * rotMod + (interactive ? Math.sin(mouseA + yN * 2) * 10 : 0);
        const width = Math.max(2, baseW * taper * (0.8 + 0.2 * Math.cos(yN * 5 + t * 0.8)));
        const sliceH = (h / S.iterations) * 2.4;

        /* Hof → Körper → Kern (Akkumulation = Glow wie tanh(col*glow)) */
        ctx.fillStyle = rgba(col, 0.045 * intensity);
        ctx.beginPath(); ctx.ellipse(cx + xOff, y, width * 2.2, sliceH, 0, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = rgba(col, 0.09 * intensity);
        ctx.beginPath(); ctx.ellipse(cx + xOff, y, width, sliceH, 0, 0, Math.PI * 2); ctx.fill();
        const core = mix(col, [255, 255, 255], Math.min(0.85, glowAmount * 120));
        ctx.fillStyle = rgba(core, 0.15 * intensity);
        ctx.beginPath(); ctx.ellipse(cx + xOff, y, width * 0.38, sliceH, 0, 0, Math.PI * 2); ctx.fill();
      }
      ctx.restore();
    };

    let raf = 0, last = performance.now(), time = 0;
    let isVisible = true, isPageVisible = !document.hidden;
    const frameTime = 1000 / S.fps;

    const animate = (now: number) => {
      raf = requestAnimationFrame(animate);
      const dt = now - last;
      if (dt < frameTime) return;                          // FPS-Throttle wie Original
      last = now - (dt % frameTime);
      time += 0.016 * rotationSpeed;
      render(time);
    };
    const tryStart = () => { if (isVisible && isPageVisible && !raf && !reduced) raf = requestAnimationFrame(animate); };
    const tryStop = () => { if (raf) { cancelAnimationFrame(raf); raf = 0; } };

    const io = new IntersectionObserver(([e]) => { isVisible = e.isIntersecting; isVisible ? tryStart() : tryStop(); }, { threshold: 0 });
    io.observe(wrap);
    const onVis = () => { isPageVisible = !document.hidden; isPageVisible ? tryStart() : tryStop(); };
    document.addEventListener('visibilitychange', onVis);

    render(2); // statischer Frame (reduced motion / Initial)
    tryStart();

    return () => {
      tryStop(); io.disconnect();
      document.removeEventListener('visibilitychange', onVis);
      window.removeEventListener('resize', onResize);
      if (interactive) wrap.removeEventListener('mousemove', onMove);
    };
  }, [topColor, bottomColor, intensity, rotationSpeed, interactive, glowAmount, pillarWidth, pillarHeight, pillarRotation, quality]);

  return (
    <div
      ref={wrapRef}
      className={`relative overflow-hidden ${className}`}
      style={{ mixBlendMode: mixBlendMode as React.CSSProperties['mixBlendMode'] }}
      aria-hidden="true"
    >
      <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" />
      <div className="absolute inset-0 pointer-events-none" style={{ backgroundImage: NOISE_URI, opacity: noiseIntensity * 0.12 }} />
    </div>
  );
}
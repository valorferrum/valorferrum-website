// src/components/ParticleWave.tsx
import { useEffect, useRef } from 'react';

interface ParticleWaveProps {
  amplitude?: number;
  speed?: number;
  cursorStrength?: number;
  cursorRadius?: number;
}

type P = { baseX: number; baseY: number; x: number; y: number; col: number; row: number };

interface Layer {
  top: number;        // Start der Ebene (Anteil der Höhe)
  cols: number;
  rows: number;
  size: number;       // Partikelgröße
  alpha: number;      // Grund-Alpha
  speedMul: number;   // Zeit-Multiplikator
  ampMul: number;     // Amplituden-Multiplikator
  crest: number;      // Stärke des weißen Kamm-Glühens
  parallax: number;   // Cursor-Stärke (vordere Ebenen reagieren stärker)
  color: [number, number, number];
  soft?: boolean;     // Bokeh-Halo zeichnen
  particles: P[];
}

const TAU = Math.PI * 2;
const mix = (a: number, b: number, t: number) => Math.round(a + (b - a) * t);

export default function ParticleWave({
  amplitude = 26,
  speed = 0.5,
  cursorStrength = 90,
  cursorRadius = 260,
}: ParticleWaveProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouseRef = useRef({ x: -9999, y: -9999 });
  const prefersReducedMotion =
    typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationId = 0;
    let time = 0;
    let width = 0;
    let height = 0;

    // ===== 3 EBENEN wie im Referenzbild =====
    const layers: Layer[] = [
      // Ebene 1 (hinten): dunkle, kleine, langsame Welle am Horizont
      { top: 0.30, cols: 90,  rows: 16, size: 1.1, alpha: 0.38, speedMul: 0.55, ampMul: 0.6,  crest: 0.4, parallax: 0.45, color: [122, 72, 205], particles: [] },
      // Ebene 2 (Mitte): Haupt-Terrain mit hell glühenden Wellenkämmen
      { top: 0.46, cols: 120, rows: 24, size: 1.6, alpha: 0.85, speedMul: 0.85, ampMul: 1.0,  crest: 1.0, parallax: 0.8,  color: [166, 92, 246], particles: [] },
      // Ebene 3 (vorne): große, weiche Bokeh-Partikel (Tiefenunschärfe-Look)
      { top: 0.70, cols: 60,  rows: 9,  size: 3.4, alpha: 0.4,  speedMul: 1.2,  ampMul: 1.35, crest: 0.5, parallax: 1.3,  color: [198, 138, 255], soft: true, particles: [] },
    ];

    const resize = () => {
      const dpr = window.devicePixelRatio || 1;
      const rect = canvas.getBoundingClientRect();
      width = rect.width;
      height = rect.height;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      for (const L of layers) {
        L.particles.length = 0;
        const topOffset = height * L.top;
        const usable = height - topOffset;
        const sx = width / (L.cols - 1);
        const sy = usable / (L.rows - 1);
        for (let r = 0; r < L.rows; r++) {
          for (let c = 0; c < L.cols; c++) {
            const bx = c * sx;
            const by = topOffset + r * sy;
            L.particles.push({ baseX: bx, baseY: by, x: bx, y: by, col: c, row: r });
          }
        }
      }
    };

    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouseRef.current = { x: e.clientX - rect.left, y: e.clientY - rect.top };
    };
    const handleMouseOut = () => {
      mouseRef.current = { x: -9999, y: -9999 };
    };

    // Deep-Space-Backdrop: Verlauf + zentraler Lichtstrahl + Horizont-Glow
    const drawBackdrop = () => {
      const bg = ctx.createLinearGradient(0, 0, 0, height);
      bg.addColorStop(0, '#0A0A0F');
      bg.addColorStop(0.55, '#0C0A14');
      bg.addColorStop(1, '#0A0A0F');
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, width, height);

      const cx = width * 0.5;
      ctx.save();
      ctx.globalCompositeOperation = 'lighter';

      const beam = ctx.createLinearGradient(cx, 0, cx, height * 0.72);
      beam.addColorStop(0, 'rgba(196,154,255,0)');
      beam.addColorStop(0.5, 'rgba(166,92,246,0.10)');
      beam.addColorStop(1, 'rgba(166,92,246,0)');
      ctx.fillStyle = beam;
      ctx.beginPath();
      ctx.moveTo(cx - width * 0.04, 0);
      ctx.lineTo(cx + width * 0.04, 0);
      ctx.lineTo(cx + width * 0.16, height * 0.72);
      ctx.lineTo(cx - width * 0.16, height * 0.72);
      ctx.closePath();
      ctx.fill();

      const glow = ctx.createRadialGradient(cx, height * 0.6, 0, cx, height * 0.6, width * 0.4);
      glow.addColorStop(0, 'rgba(139,92,246,0.16)');
      glow.addColorStop(1, 'rgba(139,92,246,0)');
      ctx.fillStyle = glow;
      ctx.fillRect(0, 0, width, height);
      ctx.restore();
    };

    // Organische Welle (-1.1 .. 1.1)
    const waveVal = (p: P, t: number) =>
      Math.sin(p.col * 0.14 + t) * 0.55 +
      Math.sin(p.col * 0.05 - t * 0.7) * 0.3 +
      Math.sin(p.row * 0.22 + t * 0.5) * 0.25;

    const renderLayer = (L: Layer, live: boolean) => {
      const mouse = mouseRef.current;
      const t = time * L.speedMul;

      for (const p of L.particles) {
        const w = waveVal(p, t);
        // Wellenkamm-Erkennung → weißes Glühen auf den Bergkämmen (wie Referenz)
        const crest = Math.pow(Math.max(0, w / 1.1), 3) * L.crest;

        const dx = p.x - mouse.x;
        const dy = p.y - mouse.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const proximity = live && dist < cursorRadius ? 1 - dist / cursorRadius : 0;

        if (live) {
          const push = proximity * proximity * cursorStrength * L.parallax;
          const nx = dx / (dist + 0.001);
          const ny = dy / (dist + 0.001);
          const targetX = p.baseX + nx * push * 0.4;
          const targetY = p.baseY + w * amplitude * L.ampMul + ny * push * 0.7;
          p.x += (targetX - p.x) * 0.1;
          p.y += (targetY - p.y) * 0.1;
        } else {
          p.y = p.baseY + w * amplitude * L.ampMul;
        }

        const depth = p.row / L.rows;

        // Farbe: Ebenenfarbe → weiß an Kämmen, → pink nahe Cursor
        let rC = mix(L.color[0], 255, crest * 0.85);
        let gC = mix(L.color[1], 255, crest * 0.85);
        let bC = mix(L.color[2], 255, crest * 0.9);
        rC = mix(rC, 236, proximity * 0.5);
        gC = mix(gC, 72, proximity * 0.5);
        bC = mix(bC, 153, proximity * 0.5);

        const alpha = Math.min(1, L.alpha * (0.35 + depth * 0.65) + crest * 0.35 + proximity * 0.3);
        const size = L.size * (0.7 + depth * 0.6) + crest * 0.6 + proximity * 1.1;

        // Bokeh-Halo für vordere Ebene (weicher Unschärfe-Look)
        if (L.soft) {
          ctx.beginPath();
          ctx.arc(p.x, p.y, size * 2.4, 0, TAU);
          ctx.fillStyle = `rgba(${rC},${gC},${bC},${alpha * 0.22})`;
          ctx.fill();
        }

        ctx.beginPath();
        ctx.arc(p.x, p.y, size, 0, TAU);
        ctx.fillStyle = `rgba(${rC},${gC},${bC},${alpha})`;
        ctx.fill();
      }
    };

    const render = (live: boolean) => {
      drawBackdrop();
      for (const L of layers) renderLayer(L, live); // hinten → vorne
    };

    const animate = () => {
      time += speed * 0.016;
      render(true);
      animationId = requestAnimationFrame(animate);
    };

    resize();
    window.addEventListener('resize', resize);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('blur', handleMouseOut);
    document.documentElement.addEventListener('mouseleave', handleMouseOut);

    if (!prefersReducedMotion) {
      animate();
    } else {
      render(false);
    }

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener('resize', resize);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('blur', handleMouseOut);
      document.documentElement.removeEventListener('mouseleave', handleMouseOut);
    };
  }, [amplitude, speed, cursorStrength, cursorRadius, prefersReducedMotion]);

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none absolute inset-0 h-full w-full"
      aria-hidden="true"
    />
  );
}
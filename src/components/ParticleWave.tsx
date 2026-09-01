// src/components/ParticleWave.tsx
import { useEffect, useRef } from 'react';

interface ParticleWaveProps {
  cols?: number;
  rows?: number;
  amplitude?: number;
  frequency?: number;
  speed?: number;
  cursorStrength?: number;
  cursorRadius?: number;
  particleSize?: number;
}

export default function ParticleWave({
  cols = 90,
  rows = 35,
  amplitude = 18,
  frequency = 0.01,
  speed = 0.5,
  cursorStrength = 60,
  cursorRadius = 200,
  particleSize = 1.5,
}: ParticleWaveProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouseRef = useRef({ x: -1000, y: -1000 });
  const prefersReducedMotion = typeof window !== 'undefined' 
    && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationId: number;
    let time = 0;
    let width = 0;
    let height = 0;
    let dpr = 1;

    // Strukturiertes Grid statt zufälliger Partikel (§2.3 "Datengetrieben")
    const particles: Array<{
      baseX: number; baseY: number; x: number; y: number; row: number; col: number;
    }> = [];

    const resize = () => {
      dpr = window.devicePixelRatio || 1;
      const rect = canvas.getBoundingClientRect();
      width = rect.width;
      height = rect.height;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      ctx.scale(dpr, dpr);

      particles.length = 0;
      const spacingX = width / (cols - 1);
      const spacingY = height / (rows - 1);

      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          particles.push({
            baseX: c * spacingX,
            baseY: r * spacingY,
            x: c * spacingX,
            y: r * spacingY,
            row: r,
            col: c,
          });
        }
      }
    };

    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouseRef.current = { x: e.clientX - rect.left, y: e.clientY - rect.top };
    };

    const handleMouseLeave = () => {
      mouseRef.current = { x: -1000, y: -1000 };
    };

    const animate = () => {
      ctx.clearRect(0, 0, width, height);
      const mouse = mouseRef.current;
      time += speed * 0.016;

      particles.forEach((p) => {
        // Mathematische Sinus-Welle (nicht willkürlich)
        const waveOffset = 
          Math.sin(p.col * frequency * 12 + time) * amplitude * 0.4 +
          Math.sin(p.row * frequency * 6 + time * 0.6) * amplitude * 0.2;
        
        const targetY = p.baseY + waveOffset;

        // Sanfte Cursor-Displacement
        const dx = p.x - mouse.x;
        const dy = p.y - mouse.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const cursorForce = dist < cursorRadius 
          ? (cursorStrength * (1 - dist / cursorRadius)) / (dist + 1) 
          : 0;

        // Smooth Lerp für ruhige Bewegung (§2.3 "Ruhig & sachlich")
        p.y += ((targetY - cursorForce) - p.y) * 0.06;

        // Opacity-Gradient: Oben transparenter, unten sichtbarer
        const rowOpacity = 0.15 + (p.row / rows) * 0.5;
        const distOpacity = dist < cursorRadius ? 0.9 : rowOpacity;

        ctx.beginPath();
        ctx.arc(p.x, p.y, particleSize, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(166, 92, 246, ${distOpacity})`; // Brand-Lila #A65CF6 (§5.5)
        ctx.fill();
      });

      animationId = requestAnimationFrame(animate);
    };

    resize();
    window.addEventListener('resize', resize);
    canvas.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('mouseleave', handleMouseLeave);

    if (!prefersReducedMotion) {
      animate();
    } else {
      // Static Fallback für Accessibility
      particles.forEach((p) => {
        ctx.beginPath();
        ctx.arc(p.baseX, p.baseY, particleSize, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(166, 92, 246, ${0.15 + (p.row / rows) * 0.5})`;
        ctx.fill();
      });
    }

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener('resize', resize);
      canvas.removeEventListener('mousemove', handleMouseMove);
      canvas.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [cols, rows, amplitude, frequency, speed, cursorStrength, cursorRadius, particleSize, prefersReducedMotion]);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full pointer-events-auto"
      style={{ zIndex: 0 }}
      aria-hidden="true"
    />
  );
}
/**
 * BrandOrbit – animiertes Orbit-Designelement (Rev 6)
 * Elliptische Umlaufbahn mit glühenden Dots in Brand-Lila-Tönen.
 * Dots wandern kontinuierlich auf der Ellipse (rAF), Linie in Lila.
 * Respektiert prefers-reduced-motion (statischer Zustand).
 */
import { useLayoutEffect, useRef } from 'react';

interface BrandOrbitProps {
  tilt?: number;      // Neigung der Ellipse (deg)
  rx?: number;        // horizontaler Radius (0..1 der Breite)
  ry?: number;        // vertikaler Radius (0..1 der Höhe)
  duration?: number;  // Sekunden pro Umrundung
  className?: string; // Positionierung (inset-Utilities)
}

/* Lila-dominante Palette: Brand-Purpur → Pink-Akzent → ein weißer Funke */
const DOTS = [
  { color: '#A65CF6', size: 10, phase: 0.0 },
  { color: '#C49AFF', size: 8,  phase: 1.9 },
  { color: '#8B5CF6', size: 9,  phase: 3.5 },
  { color: '#EC4899', size: 7,  phase: 4.8 },
  { color: '#F8FAFC', size: 5,  phase: 5.8 },
];

export default function BrandOrbit({
  tilt = -14,
  rx = 0.5,
  ry = 0.3,
  duration = 28,
  className = '',
}: BrandOrbitProps) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const dotRefs = useRef<(HTMLSpanElement | null)[]>([]);

  useLayoutEffect(() => {
    const wrap = wrapRef.current;
    if (!wrap) return;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    let w = 1, h = 1;
    const measure = () => { w = wrap.clientWidth; h = wrap.clientHeight; };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(wrap);

    const rad = (tilt * Math.PI) / 180;
    const cos = Math.cos(rad), sin = Math.sin(rad);

    const place = (t: number) => {
      const cx = w / 2, cy = h / 2;
      const a = w * rx, b = h * ry;
      DOTS.forEach((d, i) => {
        const el = dotRefs.current[i];
        if (!el) return;
        const theta = d.phase + (t / duration) * Math.PI * 2;
        const px = Math.cos(theta) * a;
        const py = Math.sin(theta) * b;
        /* Tilt-Rotation um das Zentrum */
        const x = cx + px * cos - py * sin;
        const y = cy + px * sin + py * cos;
        el.style.transform = `translate(${x - d.size / 2}px, ${y - d.size / 2}px)`;
      });
    };

    let raf = 0;
    const t0 = performance.now();
    const loop = (now: number) => {
      place((now - t0) / 1000);
      raf = requestAnimationFrame(loop);
    };

    place(0); // SSR/Reduced-Motion: statischer Zustand
    if (!reduced) raf = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
    };
  }, [tilt, rx, ry, duration]);

  return (
    <div ref={wrapRef} className={`pointer-events-none absolute ${className}`} aria-hidden="true">
      {/* Orbit-Linie in Brandlila */}
      <svg
        className="absolute inset-0 h-full w-full"
        style={{ transform: `rotate(${tilt}deg)` }}
      >
        <ellipse
          cx="50%"
          cy="50%"
          rx={`${rx * 100}%`}
          ry={`${ry * 100}%`}
          fill="none"
          stroke="rgba(196, 154, 255, 0.28)"
          strokeWidth="1"
        />
      </svg>

      {DOTS.map((d, i) => (
        <span
          key={i}
          ref={(el) => { dotRefs.current[i] = el; }}
          className="bo-dot"
          style={{
            width: d.size,
            height: d.size,
            background: d.color,
            boxShadow: `0 0 10px ${d.color}, 0 0 24px ${d.color}`,
            animationDelay: `${i * 0.7}s`,
          }}
        />
      ))}

      <style>{`
        .bo-dot {
          position: absolute;
          left: 0;
          top: 0;
          border-radius: 9999px;
          will-change: transform;
          animation: boGlow 4s ease-in-out infinite;
        }
        @keyframes boGlow {
          0%, 100% { opacity: 0.75; }
          50%      { opacity: 1; }
        }
        @media (prefers-reduced-motion: reduce) {
          .bo-dot { animation: none; }
        }
      `}</style>
    </div>
  );
}
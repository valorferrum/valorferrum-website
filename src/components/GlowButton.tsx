/**
 * GlowButton – Rev 12 "Six Flares"
 * – Durchgehender glühender Rahmen (5 Basis-Stufen, immer sichtbar)
 * – 6 Hot-Zones unterschiedlicher Stärke laufen um den Button
 * – Jede Zone = Layer-Pyramide: weiter außen = breiterer Stroke,
 *   aber KÜRZERES Segment + NIEDRIGERE Opacity → realistische Flammen-Kegel
 * – Generativ gerendert (inline styles mit calc(var(--hot))) → alles synchron
 * – 1:1-Pixel-Rendering, Cursor-Ease, reduced-motion-safe, keine weißen Strokes
 * Verwendung: <GlowButton client:visible href="..." />
 */
import { useCallback, useEffect, useId, useLayoutEffect, useRef, useState } from 'react';
import type { ReactNode } from 'react';

interface GlowButtonProps {
  href: string;
  variant?: 'primary' | 'secondary';
  children: ReactNode;
  className?: string;
}

/* ── 6 Hot-Zones: Phase (Position auf 0–100) + Intensität + Layer-Anzahl ── */
const ZONES = [
  { phase: 0,  i: 2,  layers: 7 },
  { phase: 17, i: 1.2,  layers: 5 },
  { phase: 33, i: 1.7, layers: 6 },
  { phase: 50, i: 1,  layers: 4 },
  { phase: 67, i: 1.8,  layers: 7 },
  { phase: 84, i: 1.4,  layers: 5 },
];

/* ── Layer-Pyramide (innen → außen):
   w = Stroke-Breite (wird breiter), b = Blur,
   o = Opacity (wird niedriger), l = Dash-Länge (wird kürzer) ── */
const LAYER_SPEC = [
  { w: 4,  b: 4,  o: 0.80, l: 24 },
  { w: 8,  b: 10,  o: 0.50, l: 20 },
  { w: 14, b: 18,  o: 0.32, l: 16 },
  { w: 22, b: 28, o: 0.20, l: 12 },
  { w: 32, b: 40, o: 0.12, l: 8 },
  { w: 44, b: 56, o: 0.07, l: 5 },
  { w: 58, b: 72, o: 0.04, l: 3 },
];

/* ── Durchgehender Basis-Rahmen (kein dash) ── */
const BASE = [
  { w: 2,  b: 0.3, o: 0.90 },
  { w: 6,  b: 4,   o: 0.35 },
  { w: 12, b: 10,  o: 0.20 },
  { w: 20, b: 18,  o: 0.12 },
  { w: 30, b: 28,  o: 0.07 },
];

export default function GlowButton({ href, variant = 'primary', children, className = '' }: GlowButtonProps) {
  const uid = useId().replace(/[^a-zA-Z0-9]/g, '');
  const rootRef = useRef<HTMLAnchorElement>(null);
  const hotRef = useRef(25);
  const cursorRef = useRef({ t: 25, active: false });
  const [w, setW] = useState(0);
  const [h, setH] = useState(0);

  /* 1:1-Pixel-Rendering */
  useLayoutEffect(() => {
    const el = rootRef.current;
    if (!el) return;
    const update = () => {
      setW(el.offsetWidth);
      setH(el.offsetHeight);
    };
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  /* Loop: --hot (Orbit 16s / Cursor-Ease) */
  useEffect(() => {
    if (variant !== 'primary' || !rootRef.current) return;
    const el = rootRef.current;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      el.style.setProperty('--hot', '25');
      return;
    }

    const ORBIT_SPEED = 100 / 16;
    let raf = 0;
    let prev = performance.now();

    const loop = (now: number) => {
      const dt = Math.min(0.05, (now - prev) / 1000);
      prev = now;
      const cur = cursorRef.current;

      if (cur.active) {
        const d = ((cur.t - hotRef.current + 150) % 100) - 50;
        hotRef.current = (hotRef.current + d * Math.min(1, dt * 10) + 100) % 100;
      } else {
        hotRef.current = (hotRef.current + dt * ORBIT_SPEED) % 100;
      }
      el.style.setProperty('--hot', hotRef.current.toFixed(2));
      raf = requestAnimationFrame(loop);
    };

    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [variant]);

  const onMove = useCallback((e: React.MouseEvent<HTMLAnchorElement>) => {
    const el = rootRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const x = e.clientX - r.left, y = e.clientY - r.top;
    el.style.setProperty('--mx', `${x}px`);
    el.style.setProperty('--my', `${y}px`);
    let t: number;
    if (y < r.height * 0.3) t = (x / r.width) * 36;
    else if (y > r.height * 0.7) t = 50 + (1 - x / r.width) * 36;
    else if (x > r.width / 2) t = 36 + ((y / r.height - 0.5) * 2) * 7;
    else t = 86 + (0.5 - y / r.height) * 2 * 14;
    cursorRef.current = { t, active: true };
  }, []);

  const onLeave = useCallback(() => {
    cursorRef.current.active = false;
  }, []);

  const base =
    'gb-root relative inline-flex items-center justify-center rounded-full px-8 py-4 font-semibold transition-all duration-300 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary';
  const primary =
    'text-white bg-gradient-to-r from-primary via-spectrum-pink to-spectrum-blue hover:brightness-110 hover:-translate-y-0.5 active:translate-y-0';
  const secondary =
    'text-text-primary bg-surface-elevated/80 border border-primary/30 hover:border-primary/70 hover:bg-surface-elevated';

  /* Rounded-Rect-Pfad, 1:1 skaliert */
  const pad = 1;
  const iw = Math.max(0, w - pad * 2);
  const ih = Math.max(0, h - pad * 2);
  const r = Math.min(ih / 2, iw / 2);
  const d =
    `M ${r + pad} ${pad} H ${iw + pad - r} A ${r} ${r} 0 0 1 ${w - pad} ${r + pad} ` +
    `V ${ih + pad - r} A ${r} ${r} 0 0 1 ${iw + pad - r} ${h - pad} H ${r + pad} ` +
    `A ${r} ${r} 0 0 1 ${pad} ${ih + pad - r} V ${r + pad} A ${r} ${r} 0 0 1 ${r + pad} ${pad} Z`;

  return (
    <a
      ref={rootRef}
      href={href}
      onMouseMove={variant === 'primary' ? onMove : undefined}
      onMouseLeave={variant === 'primary' ? onLeave : undefined}
      className={`${base} ${variant === 'primary' ? primary : secondary} ${className}`.trim()}
    >
      {variant === 'primary' && w > 0 && (
        <>
          <svg className="gbz-svg" width={w} height={h} viewBox={`0 0 ${w} ${h}`} fill="none" aria-hidden="true">
            <defs>
              <linearGradient id={`${uid}f`} x1="0" y1="0" x2="1" y2="0">
                <stop offset="0" stopColor="#A65CF6" />
                <stop offset=".5" stopColor="#EC4899" />
                <stop offset="1" stopColor="#3B82F6" />
              </linearGradient>
            </defs>

            {/* ── Durchgehender glühender Rahmen (überall) ── */}
            <g className="gbz-base">
              {[...BASE].reverse().map((s, i) => (
                <path
                  key={i}
                  d={d}
                  pathLength={100}
                  stroke={`url(#${uid}f)`}
                  fill="none"
                  strokeLinecap="round"
                  style={{ strokeWidth: s.w, filter: `blur(${s.b}px)`, opacity: s.o }}
                />
              ))}
            </g>

            {/* ── 6 Hot-Zones: Flammen-Kegel aus Layer-Pyramiden ── */}
            <g className="gbz-zones">
              {ZONES.map((z, zi) =>
                Array.from({ length: z.layers }, (_, li) => {
                  const s = LAYER_SPEC[li];
                  const L = Math.max(2, +(s.l * z.i).toFixed(1));
                  return (
                    <path
                      key={`${zi}-${li}`}
                      d={d}
                      pathLength={100}
                      stroke={`url(#${uid}f)`}
                      fill="none"
                      strokeLinecap="round"
                      style={{
                        strokeWidth: s.w,
                        filter: `blur(${s.b}px)${li === 0 ? ' brightness(1.7)' : ''}`,
                        opacity: +(s.o * z.i).toFixed(2),
                        strokeDasharray: `${L} ${+(100 - L).toFixed(1)}`,
                        strokeDashoffset: `calc(${(L / 2).toFixed(1)} - var(--hot, 25) - ${z.phase})`,
                      }}
                    />
                  );
                })
              )}
            </g>
          </svg>

          <span className="gb-glow" aria-hidden="true" />
        </>
      )}
      <span className="relative z-10">{children}</span>

      <style>{`
        .gbz-svg {
          position: absolute;
          top: 0; left: 0;
          pointer-events: none;
          z-index: 1;
          overflow: visible;
          shape-rendering: geometricPrecision;
        }
        .gb-root:hover .gbz-zones { filter: brightness(1.3) saturate(1.2); }
        .gb-root:hover .gbz-base { filter: brightness(1.15); }
      `}</style>
    </a>
  );
}
import { useCallback, useRef } from 'react';
import type { PointerEvent as ReactPointerEvent, ReactNode } from 'react';

type Flame = { pos: number; w: number; h: number; r: number };

const TOP_FLAMES: Flame[] = [
  { pos: 8, w: 10, h: 12, r: -8 },
  { pos: 20, w: 14, h: 18, r: 6 },
  { pos: 33, w: 9, h: 11, r: -4 },
  { pos: 47, w: 15, h: 20, r: 3 },
  { pos: 61, w: 10, h: 13, r: 8 },
  { pos: 74, w: 13, h: 17, r: -6 },
  { pos: 88, w: 9, h: 12, r: 5 },
];
const BOTTOM_FLAMES: Flame[] = [
  { pos: 14, w: 11, h: 13, r: 6 },
  { pos: 28, w: 14, h: 18, r: -5 },
  { pos: 43, w: 9, h: 11, r: 4 },
  { pos: 58, w: 13, h: 17, r: -7 },
  { pos: 72, w: 10, h: 12, r: 6 },
  { pos: 86, w: 12, h: 15, r: -4 },
];

interface Props {
  href: string;
  children: ReactNode;
  className?: string;
}

export default function FlameButton({ href, children, className = '' }: Props) {
  const rootRef = useRef<HTMLAnchorElement>(null);
  const flameRefs = useRef<Map<string, HTMLSpanElement>>(new Map());
  const frame = useRef(0);

  // Flames schlagen nahe der Cursor-X-Position aus (Gaussian Falloff)
  const applyFlare = useCallback((xPct: number | null) => {
    flameRefs.current.forEach((el, key) => {
      const pos = parseFloat(key.split('-')[1]);
      const rot = parseFloat(el.dataset.rot || '0');
      let scale = 1;
      if (xPct !== null) {
        const d = pos - xPct;
        scale = 1 + 1.9 * Math.exp(-(d * d) / (2 * 16 * 16));
      }
      el.style.transform = `rotate(${rot}deg) scaleY(${scale})`;
    });
  }, []);

  const onMove = useCallback((e: ReactPointerEvent<HTMLAnchorElement>) => {
    const el = rootRef.current;
    if (!el) return;
    const { clientX, clientY } = e;
    cancelAnimationFrame(frame.current);
    frame.current = requestAnimationFrame(() => {
      const rect = el.getBoundingClientRect();
      el.style.setProperty('--mx', `${clientX - rect.left}px`);
      el.style.setProperty('--my', `${clientY - rect.top}px`);
      applyFlare(((clientX - rect.left) / rect.width) * 100);
    });
  }, [applyFlare]);

  const onLeave = useCallback(() => {
    cancelAnimationFrame(frame.current);
    applyFlare(null);
  }, [applyFlare]);

  const renderFlames = (flames: Flame[], edge: 'top' | 'bottom') =>
    flames.map((f) => (
      <span
        key={`${edge}-${f.pos}`}
        ref={(node) => {
          if (node) flameRefs.current.set(`${edge}-${f.pos}`, node);
          else flameRefs.current.delete(`${edge}-${f.pos}`);
        }}
        data-rot={f.r}
        className={`flame-btn__flame flame-btn__flame--${edge}`}
        style={{
          left: `${f.pos}%`,
          width: f.w,
          height: f.h,
          transform: `rotate(${f.r}deg)`,
          animationDelay: `${(f.pos % 7) * 0.3}s`,
        }}
      />
    ));

  return (
    <a
      ref={rootRef}
      href={href}
      className={`flame-btn ${className}`}
      onPointerMove={onMove}
      onPointerLeave={onLeave}
    >
      {renderFlames(TOP_FLAMES, 'top')}
      {renderFlames(BOTTOM_FLAMES, 'bottom')}
      <span className="flame-btn__glow" aria-hidden="true" />
      <span className="flame-btn__inner">{children}</span>
    </a>
  );
}
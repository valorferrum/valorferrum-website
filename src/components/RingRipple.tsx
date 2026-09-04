import { useCallback, useEffect, useRef, useState } from 'react';
import type { CSSProperties, MouseEvent as ReactMouseEvent } from 'react';

type Ripple = { id: number; x: number; y: number; color: string };

const COLORS = ['#A65CF6', '#EC4899', '#3B82F6'];

export default function RingRipple() {
  // 1. Alle Hooks strikt am Anfang definieren
  const layerRef = useRef<HTMLDivElement>(null);
  const [ripples, setRipples] = useState<Ripple[]>([]);
  const [glow, setGlow] = useState({ x: 50, y: 50, active: false });

  const lastSpawn = useRef(0);
  const nextId = useRef(0);
  const reducedMotion = useRef(false);
  const frame = useRef<number | null>(null);
  const pos = useRef({ x: 50, y: 50 });
  const glowActive = useRef(false); // War vorher weiter unten -> Fehlerquelle!

  useEffect(() => {
    reducedMotion.current = window.matchMedia(
      '(prefers-reduced-motion: reduce)'
    ).matches;
    return () => {
      if (frame.current !== null) cancelAnimationFrame(frame.current);
    };
  }, []);

  const scheduleGlow = useCallback(() => {
    if (frame.current !== null) return;
    frame.current = requestAnimationFrame(() => {
      frame.current = null;
      setGlow((g) => ({ ...g, x: pos.current.x, y: pos.current.y }));
    });
  }, []);

  // 2. onMouseMove statt onPointerMove für bessere Cross-Browser-Stabilität
  const handleMove = useCallback(
    (e: ReactMouseEvent<HTMLDivElement>) => {
      const layer = layerRef.current;
      if (!layer || reducedMotion.current) return;

      const rect = layer.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 100;
      const y = ((e.clientY - rect.top) / rect.height) * 100;
      pos.current = { x, y };
      scheduleGlow();
      
      if (!glowActive.current) {
        glowActive.current = true;
        setGlow((g) => ({ ...g, active: true }));
      }

      const now = performance.now();
      if (now - lastSpawn.current < 90) return;
      lastSpawn.current = now;

      const id = ++nextId.current;
      setRipples((prev) => [
        ...prev.slice(-14),
        { id, x, y, color: COLORS[id % COLORS.length] },
      ]);
    },
    [scheduleGlow]
  );

  const handleLeave = useCallback(() => {
    glowActive.current = false;
    setGlow((g) => ({ ...g, active: false }));
  }, []);

  const removeRipple = useCallback((id: number) => {
    setRipples((prev) => prev.filter((r) => r.id !== id));
  }, []);

  return (
    <div
      ref={layerRef}
      className="ring-ripple-layer"
      onMouseMove={handleMove}
      onMouseLeave={handleLeave}
      aria-hidden="true"
    >
      <div
        className="ring-cursor-glow"
        style={{ left: `${glow.x}%`, top: `${glow.y}%`, opacity: glow.active ? 1 : 0 }}
      />
      {ripples.map((r) => (
        <span
          key={r.id}
          className="ring-ripple"
          style={{ left: `${r.x}%`, top: `${r.y}%`, '--ripple-color': r.color } as CSSProperties}
          onAnimationEnd={() => removeRipple(r.id)}
        />
      ))}
    </div>
  );
}
import { useCallback, useEffect, useRef, useState } from 'react';
import type { CSSProperties, MouseEvent as ReactMouseEvent } from 'react';

type Ripple = { id: number; x: number; y: number; strike?: boolean; delay?: number };

export default function RingRipple() {
  const layerRef = useRef<HTMLDivElement>(null);
  const [ripples, setRipples] = useState<Ripple[]>([]);
  const [glow, setGlow] = useState({ x: 50, y: 50, active: false });
  const [flash, setFlash] = useState<{ id: number; x: number; y: number } | null>(null);

  const lastSpawn = useRef(0);
  const nextId = useRef(0);
  const reducedMotion = useRef(false);
  const frame = useRef<number | null>(null);
  const pos = useRef({ x: 50, y: 50 });
  const glowActive = useRef(false);
  const strikeTimeout = useRef<number | null>(null);

  useEffect(() => {
    reducedMotion.current = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    return () => {
      if (frame.current !== null) cancelAnimationFrame(frame.current);
      if (strikeTimeout.current !== null) clearTimeout(strikeTimeout.current);
    };
  }, []);

  const scheduleGlow = useCallback(() => {
    if (frame.current !== null) return;
    frame.current = requestAnimationFrame(() => {
      frame.current = null;
      setGlow((g) => ({ ...g, x: pos.current.x, y: pos.current.y }));
    });
  }, []);

  /* Hover: Zähes, flüssiges Metall */
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
      // Langsamere Spawn-Rate (250ms) für ein schwereres, zäheres Gefühl
      if (now - lastSpawn.current < 250) return; 
      lastSpawn.current = now;
      setRipples((prev) => [...prev.slice(-5), { id: ++nextId.current, x, y }]);
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

  /* Klick: Der Forge-Strike (Hammerschlag) */
  const handleClick = useCallback((e: ReactMouseEvent<HTMLDivElement>) => {
    if (reducedMotion.current) return;
    const layer = layerRef.current;
    if (!layer) return;
    const rect = layer.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;

    // 1. Greller Blitz
    setFlash({ id: ++nextId.current, x, y });

    // 2. Schwere Schockwellen (gestaffelt)
    setRipples((prev) => [
      ...prev.slice(-4),
      { id: ++nextId.current, x, y, strike: true, delay: 0 },
      { id: ++nextId.current, x, y, strike: true, delay: 150 },
      { id: ++nextId.current, x, y, strike: true, delay: 300 },
    ]);

    // 3. Ring reagiert (Hitze-Transfer)
    const ring = layer.closest('.hero-ring');
    if (ring) {
      ring.classList.add('is-striking');
      if (strikeTimeout.current !== null) clearTimeout(strikeTimeout.current);
      strikeTimeout.current = window.setTimeout(() => {
        ring.classList.remove('is-striking');
      }, 1200); // Längeres Nachglühen
    }
  }, []);

  return (
    <div
      ref={layerRef}
      className="ring-ripple-layer"
      onMouseMove={handleMove}
      onMouseLeave={handleLeave}
      onClick={handleClick}
      aria-hidden="true"
    >
      {/* Basis: Der Schmelztiegel */}
      <div className="molten-pool" />

      {/* Cursor-Hitze */}
      <div
        className="ring-cursor-glow"
        style={{ left: `${glow.x}%`, top: `${glow.y}%`, opacity: glow.active ? 1 : 0 }}
      />

      {/* Forge-Strike Blitz */}
      {flash && (
        <span
          key={flash.id}
          className="ring-flash"
          style={{ left: `${flash.x}%`, top: `${flash.y}%` } as CSSProperties}
          onAnimationEnd={() => setFlash(null)}
        />
      )}

      {/* Wellen (Flüssiges Metall) */}
      {ripples.map((r) => (
        <span
          key={r.id}
          className={`ring-ripple${r.strike ? ' ring-ripple--strike' : ''}`}
          style={{
            left: `${r.x}%`,
            top: `${r.y}%`,
            animationDelay: r.delay ? `${r.delay}ms` : undefined,
          } as CSSProperties}
          onAnimationEnd={() => removeRipple(r.id)}
        />
      ))}
    </div>
  );
}
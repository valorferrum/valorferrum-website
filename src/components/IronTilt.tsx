import { useCallback, useEffect, useRef } from 'react';
import type { CSSProperties, PointerEvent as ReactPointerEvent, ReactNode } from 'react';

type Props = {
  href: string;
  className?: string;
  delay?: number;      /* für den bestehenden Reveal-Stagger */
  maxTilt?: number;    /* Grad, default 5 */
  children: ReactNode;
};

export default function IronTilt({
  href,
  className = '',
  delay = 0,
  maxTilt = 5,
  children,
}: Props) {
  const ref = useRef<HTMLAnchorElement>(null);
  const frame = useRef<number | null>(null);
  const last = useRef({ x: 0.5, y: 0.5 });
  const enabled = useRef(false);

  /* Nur auf Hover-fähigen Geräten & ohne Reduced Motion */
  useEffect(() => {
    enabled.current =
      window.matchMedia('(hover: hover)').matches &&
      !window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    return () => {
      if (frame.current !== null) cancelAnimationFrame(frame.current);
    };
  }, []);

  /* Imperativ: kein Re-Render, nur Style-Mutation */
  const apply = useCallback(
    (active: boolean) => {
      const el = ref.current;
      if (!el) return;
      const { x, y } = last.current;
      const rx = active ? (0.5 - y) * maxTilt : 0;
      const ry = active ? (x - 0.5) * maxTilt : 0;

      el.style.transition = active
  ? 'transform 0.12s ease-out, box-shadow 0.35s ease, border-color 0.35s ease'
  : 'transform 0.6s var(--ease-brand), box-shadow 0.5s ease, border-color 0.5s ease';
      el.style.transform =
        `perspective(900px) rotateX(${rx.toFixed(2)}deg) rotateY(${ry.toFixed(2)}deg) ` +
        (active ? 'translateY(-3px)' : 'translateY(0px)');
      el.style.setProperty('--tilt-mx', `${(x * 100).toFixed(1)}%`);
      el.style.setProperty('--tilt-my', `${(y * 100).toFixed(1)}%`);
      el.style.setProperty('--tilt-on', active ? '1' : '0');
    },
    [maxTilt]
  );

  const onMove = useCallback(
    (e: ReactPointerEvent<HTMLAnchorElement>) => {
      if (!enabled.current) return;
      const el = ref.current;
      if (!el) return;
      const r = el.getBoundingClientRect();
      last.current = {
        x: Math.min(1, Math.max(0, (e.clientX - r.left) / r.width)),
        y: Math.min(1, Math.max(0, (e.clientY - r.top) / r.height)),
      };
      if (frame.current !== null) return; // rAF-Throttle
      frame.current = requestAnimationFrame(() => {
        frame.current = null;
        apply(true);
      });
    },
    [apply]
  );

  const onLeave = useCallback(() => {
    if (frame.current !== null) {
      cancelAnimationFrame(frame.current);
      frame.current = null;
    }
    apply(false);
  }, [apply]);

  return (
    <a
      ref={ref}
      href={href}
      className={`iron-tilt ${className}`}
      style={{ '--delay': `${delay}ms` } as CSSProperties}
      onPointerMove={onMove}
      onPointerLeave={onLeave}
    >
      <i className="iron-sheen" aria-hidden="true" />
      {children}
    </a>
  );
}
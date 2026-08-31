// src/components/FlameButton.tsx
import { useCallback, useRef } from 'react';
import type { PointerEvent, ReactNode } from 'react';

interface Props {
  href: string;
  children: ReactNode;
  className?: string;
}

export default function FlameButton({ href, children, className = '' }: Props) {
  const ref = useRef<HTMLAnchorElement>(null);
  const frame = useRef(0);

  // Update CSS variables for the radial gradient position
  const handlePointerMove = useCallback((e: PointerEvent<HTMLAnchorElement>) => {
    const el = ref.current;
    if (!el) return;
    
    const { clientX, clientY } = e;
    
    // Throttle with requestAnimationFrame for 60fps performance
    cancelAnimationFrame(frame.current);
    frame.current = requestAnimationFrame(() => {
      const rect = el.getBoundingClientRect();
      el.style.setProperty('--mx', `${clientX - rect.left}px`);
      el.style.setProperty('--my', `${clientY - rect.top}px`);
    });
  }, []);

  const handlePointerLeave = useCallback(() => {
    cancelAnimationFrame(frame.current);
  }, []);

  return (
    <a
      ref={ref}
      href={href}
      className={`flame-btn ${className}`}
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
    >
      <span className="flame-btn__glow" aria-hidden="true" />
      <span className="flame-btn__inner">{children}</span>
    </a>
  );
}
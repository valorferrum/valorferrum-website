import { useCallback, useId, useRef } from 'react';
import type { PointerEvent, ReactNode } from 'react';

interface Props {
  href: string;
  children: ReactNode;
  className?: string;
}

export default function FlameButton({ href, children, className = '' }: Props) {
  const ref = useRef<HTMLAnchorElement>(null);
  const frame = useRef(0);
  const filterId = `vf-flame-${useId().replace(/[^a-zA-Z0-9_-]/g, '')}`;

  const handlePointerMove = useCallback((e: PointerEvent<HTMLAnchorElement>) => {
    const el = ref.current;
    if (!el) return;
    const { clientX, clientY } = e;
    cancelAnimationFrame(frame.current);
    frame.current = requestAnimationFrame(() => {
      const rect = el.getBoundingClientRect();
      el.style.setProperty('--mx', `${clientX - rect.left}px`);
      el.style.setProperty('--my', `${clientY - rect.top}px`);
    });
  }, []);

  return (
    <a
      ref={ref}
      href={href}
      className={`flame-btn ${className}`}
      onPointerMove={handlePointerMove}
      onPointerLeave={() => cancelAnimationFrame(frame.current)}
    >
      {/* SVG-Turbulence: lässt den Rahmen wie Feuer flackern */}
      <svg width="0" height="0" style={{ position: 'absolute' }} aria-hidden="true" focusable="false">
        <filter id={filterId} x="-30%" y="-30%" width="160%" height="160%">
          <feTurbulence type="fractalNoise" baseFrequency="0.02 0.09" numOctaves="2" seed="7" result="noise">
            <animate attributeName="baseFrequency" values="0.02 0.09;0.03 0.12;0.02 0.09" dur="4s" repeatCount="indefinite" />
          </feTurbulence>
          <feDisplacementMap in="SourceGraphic" in2="noise" scale="9" xChannelSelector="R" yChannelSelector="G" />
        </filter>
      </svg>

      <span
        className="flame-btn__fire"
        style={{ filter: `url(#${filterId}) blur(1.5px) saturate(1.35)` }}
        aria-hidden="true"
      />
      <span className="flame-btn__embers" aria-hidden="true">
        <i /><i /><i /><i /><i /><i />
      </span>
      <span className="flame-btn__glow" aria-hidden="true" />
      <span className="flame-btn__inner">{children}</span>
    </a>
  );
}
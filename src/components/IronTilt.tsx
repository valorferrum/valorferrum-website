import { useCallback, useEffect, useRef, useState } from 'react';
import type { CSSProperties, ReactNode } from 'react';

type Props = {
  href?: string;
  className?: string;
  delay?: number;
  children: ReactNode;
};

const MAX_TILT = 5;

export default function IronTilt({ href, className = '', delay = 0, children }: Props) {
  const tiltRef = useRef<any>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const frame = useRef<number | null>(null);
  const reduced = useRef(false);
  const [isVisible, setIsVisible] = useState(false);

  // Internes Scroll-Reveal (ersetzt das globale Script für diese Komponente)
  useEffect(() => {
    reduced.current = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.unobserve(entry.target);
        }
      },
      { threshold: 0.1, rootMargin: '0px 0px -50px 0px' }
    );
    
    if (wrapperRef.current) observer.observe(wrapperRef.current);
    
    return () => {
      if (frame.current !== null) cancelAnimationFrame(frame.current);
      observer.disconnect();
    };
  }, []);

  const onMove = useCallback((e: PointerEvent) => {
    const el = tiltRef.current;
    if (!el || reduced.current) return;
    const r = el.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width;
    const py = (e.clientY - r.top) / r.height;
    if (frame.current !== null) return;
    frame.current = requestAnimationFrame(() => {
      frame.current = null;
      const node = tiltRef.current;
      if (!node) return;
      node.style.transitionDelay = '0ms';
      const rx = (0.5 - py) * MAX_TILT * 2;
      const ry = (px - 0.5) * MAX_TILT * 2;
      node.style.transform =
        `perspective(900px) rotateX(${rx.toFixed(2)}deg) rotateY(${ry.toFixed(2)}deg) translateY(-3px)`;
      node.style.setProperty('--tilt-on', '1');
      node.style.setProperty('--tilt-mx', `${(px * 100).toFixed(1)}%`);
      node.style.setProperty('--tilt-my', `${(py * 100).toFixed(1)}%`);
      node.style.setProperty('--mx', `${(px * r.width).toFixed(0)}px`);
      node.style.setProperty('--my', `${(py * r.height).toFixed(0)}px`);
    });
  }, []);

  const onLeave = useCallback(() => {
    const el = tiltRef.current;
    if (!el) return;
    el.style.transform = '';
    el.style.setProperty('--tilt-on', '0');
  }, []);

  useEffect(() => {
    const el = tiltRef.current;
    if (!el) return;
    el.addEventListener('pointermove', onMove);
    el.addEventListener('pointerleave', onLeave);
    return () => {
      el.removeEventListener('pointermove', onMove);
      el.removeEventListener('pointerleave', onLeave);
    };
  }, [onMove, onLeave]);

  // Wrapper-Style für den Fade-In (opacity + translateY)
  const wrapperStyle: CSSProperties = {
    opacity: isVisible ? 1 : 0,
    transform: isVisible ? 'translateY(0)' : 'translateY(1.5rem)',
    transition: `opacity 0.6s cubic-bezier(0.22, 0.61, 0.36, 1) ${delay}ms, transform 0.6s cubic-bezier(0.22, 0.61, 0.36, 1) ${delay}ms`
  };

  const Tag = href ? 'a' : 'div';

  return (
    <div ref={wrapperRef} style={wrapperStyle}>
      <Tag ref={tiltRef} {...(href ? { href } : {})} className={`iron-tilt ${className}`}>
        {children}
        <span className="iron-sheen" aria-hidden="true"></span>
      </Tag>
    </div>
  );
}
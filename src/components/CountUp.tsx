import { useEffect, useLayoutEffect, useRef, useState } from 'react';

type Props = {
  to: number;
  prefix?: string;
  suffix?: string;
  duration?: number;  /* ms, default 1200 */
  className?: string;
};

const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);

export default function CountUp({
  to,
  prefix = '',
  suffix = '',
  duration = 1200,
  className = '',
}: Props) {
  const ref = useRef<HTMLSpanElement>(null);
  const [value, setValue] = useState(to);   /* SSR & Fallback: Endwert */
  const played = useRef(false);

  /* Vor dem ersten Client-Paint auf 0 – verhindert Flash des Endwerts */
  useLayoutEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    setValue(0);
  }, []);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    /* Reduced Motion → sofort Endwert, kein Count */
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setValue(to);
      return;
    }

    let frame = 0;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting || played.current) return;
          played.current = true;
          observer.disconnect();

          const start = performance.now();
          const tick = (now: number) => {
            const p = Math.min(1, (now - start) / duration);
            setValue(Math.round(easeOutCubic(p) * to));
            if (p < 1) frame = requestAnimationFrame(tick);
          };
          frame = requestAnimationFrame(tick);
        });
      },
      { threshold: 0.6 }
    );

    observer.observe(el);
    return () => {
      observer.disconnect();
      if (frame) cancelAnimationFrame(frame);
    };
  }, [to, duration]);

  return (
    <span ref={ref} className={className} aria-label={`${prefix}${to}${suffix}`}>
      <span aria-hidden="true">
        {prefix}{value}{suffix}
      </span>
    </span>
  );
}
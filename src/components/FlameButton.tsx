// src/components/FlameButton.tsx
import { useRef, useState } from 'react';
import type { CSSProperties, ReactNode } from 'react';

interface Props {
  href: string;
  children: ReactNode;
  className?: string;
  variant?: 'gradient' | 'neon';
}

/**
 * SPECTRUM FLUX UI:
 * - variant="gradient": glossy 3D-Pill mit Brand-Gradient (primär)
 * - variant="neon":     dunkle Pill mit glühendem Violet-Ring (sekundär)
 * Beide folgen subtil dem Cursor (Glow + Tilt).
 */
export default function FlameButton({ href, children, className = '', variant = 'gradient' }: Props) {
  const ref = useRef<HTMLAnchorElement>(null);
  const [pos, setPos] = useState({ x: 0.5, y: 0.5 });
  const [hover, setHover] = useState(false);

  const onMove = (e: React.MouseEvent) => {
    const rect = ref.current?.getBoundingClientRect();
    if (!rect) return;
    setPos({
      x: Math.min(1, Math.max(0, (e.clientX - rect.left) / rect.width)),
      y: Math.min(1, Math.max(0, (e.clientY - rect.top) / rect.height)),
    });
  };

  const tilt: CSSProperties = {
    transform: hover
      ? `perspective(700px) rotateX(${(pos.y - 0.5) * -5}deg) rotateY(${(pos.x - 0.5) * 7}deg) translateY(-2px)`
      : 'perspective(700px)',
    transition: 'transform 160ms ease-out, box-shadow 220ms ease',
  };

  const glow: CSSProperties = {
    background:
      variant === 'gradient'
        ? `radial-gradient(120px circle at ${pos.x * 100}% ${pos.y * 100}%, rgba(255,255,255,0.5), transparent 65%)`
        : `radial-gradient(120px circle at ${pos.x * 100}% ${pos.y * 100}%, rgba(166,92,246,0.45), transparent 65%)`,
    opacity: hover ? 1 : 0,
    transition: 'opacity 200ms ease',
  };

  const variantClasses =
    variant === 'gradient'
      ? 'bg-gradient-to-r from-primary to-spectrum-pink text-white shadow-[0_0_28px_rgba(236,72,153,0.4)] hover:shadow-[0_0_40px_rgba(236,72,153,0.55)]'
      : 'border-2 border-primary bg-surface/70 text-text-primary shadow-[0_0_16px_rgba(166,92,246,0.65),inset_0_0_10px_rgba(166,92,246,0.2)] hover:shadow-[0_0_26px_rgba(166,92,246,0.85)]';

  return (
    <span
      className={`relative inline-block ${className}`}
      onMouseMove={onMove}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => { setHover(false); setPos({ x: 0.5, y: 0.5 }); }}
    >
      <a
        ref={ref}
        href={href}
        style={tilt}
        className={`relative z-10 inline-flex items-center justify-center rounded-full px-9 py-4 font-semibold focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary-light ${variantClasses}`}
      >
        {/* Gloss-Highlight (3D-Look) nur bei Gradient-Pill */}
        {variant === 'gradient' && (
          <span
            className="pointer-events-none absolute left-2 right-2 top-1 h-[45%] rounded-full bg-gradient-to-b from-white/40 to-transparent"
            aria-hidden="true"
          />
        )}
        <span className="relative z-10">{children}</span>
        <span className="pointer-events-none absolute inset-0 rounded-full" style={glow} aria-hidden="true" />
      </a>
    </span>
  );
}
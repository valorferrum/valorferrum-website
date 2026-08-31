// src/components/ParticleStream.tsx
import { useEffect, useRef } from 'react';

// Deine Spectrum-Farben + Ember
const COLORS = ['#22D3EE', '#EC4899', '#FBBF24', '#8B5CF6', '#F97316'];

type Particle = {
  x: number;
  y: number;
  r: number;
  c: string;
  v: number; // velocity
  ph: number; // phase for sine wave
  a: number; // alpha/opacity
};

export default function ParticleStream() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const dpr = Math.min(window.devicePixelRatio || 1, 2); // Cap DPR at 2 for performance
    
    let width = 0;
    let height = 0;
    let animationFrameId = 0;
    let isVisible = false;
    let particles: Particle[] = [];

    // Draw a single frame (used for reduced motion or initial paint)
    const draw = (time: number) => {
      ctx.clearRect(0, 0, width, height);
      
      for (const p of particles) {
        // Gentle vertical floating effect
        const yOffset = Math.sin(time / 4000 + p.ph) * 10;
        
        // Pulsing opacity
        ctx.globalAlpha = p.a * (0.6 + 0.4 * Math.sin(time / 1400 + p.ph));
        ctx.fillStyle = p.c;
        
        ctx.beginPath();
        ctx.arc(p.x, p.y + yOffset, p.r, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1; // Reset
    };

    // Animation loop
    const loop = (time: number) => {
      for (const p of particles) {
        p.x += p.v; // Move right
        if (p.x > width + 10) p.x = -10; // Wrap around
      }
      draw(time);
      animationFrameId = requestAnimationFrame(loop);
    };

    const stop = () => {
      cancelAnimationFrame(animationFrameId);
      animationFrameId = 0;
    };

    const start = () => {
      if (!prefersReducedMotion && isVisible && !animationFrameId) {
        animationFrameId = requestAnimationFrame(loop);
      }
    };

    // Setup canvas dimensions and generate particles
    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      width = rect.width;
      height = rect.height;
      
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      // Fewer particles on mobile for performance
      const particleCount = width < 768 ? 50 : 120;
      
      particles = Array.from({ length: particleCount }, () => ({
        x: Math.random() * width,
        y: height * (0.4 + Math.random() * 0.6), // Concentrate mostly in lower 60%
        r: 0.5 + Math.random() * 1.5,
        c: COLORS[Math.floor(Math.random() * COLORS.length)],
        v: 0.05 + Math.random() * 0.2, // Slow drift
        ph: Math.random() * Math.PI * 2,
        a: 0.2 + Math.random() * 0.5,
      }));

      if (prefersReducedMotion) {
        draw(0); // Draw once statically
      }
    };

    // Intersection Observer to pause when scrolled out of view
    const observer = new IntersectionObserver(
      ([entry]) => {
        isVisible = entry.isIntersecting;
        isVisible ? start() : stop();
      },
      { threshold: 0.1 }
    );

    const handleVisibilityChange = () => {
      document.hidden ? stop() : start();
    };

    // Initialize
    resize();
    observer.observe(canvas);
    window.addEventListener('resize', resize);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    // Cleanup
    return () => {
      stop();
      observer.disconnect();
      window.removeEventListener('resize', resize);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="particle-stream"
      aria-hidden="true"
    />
  );
}
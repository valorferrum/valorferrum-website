import { useEffect, useRef } from 'react';

interface Spark {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  size: number;
  color: string;
}

export default function ForgeSparks() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    
    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);
    
    const sparks: Spark[] = [];
    const colors = ['#A65CF6', '#EC4899', '#C49AFF', '#FBBF24', '#FFF7ED'];
    
    // Ambient-Funken spawnen
    const spawnAmbient = () => {
      if (sparks.length > 60) return;
      
      sparks.push({
        x: Math.random() * canvas.width,
        y: canvas.height + 10,
        vx: (Math.random() - 0.5) * 0.5,
        vy: -(1 + Math.random() * 1.5),
        life: 0,
        maxLife: 150 + Math.random() * 100,
        size: 1 + Math.random() * 2,
        color: colors[Math.floor(Math.random() * 3)], // Nur Lila/Pink für Ambient
      });
    };
    
    // Hammerschlag-Burst
    const hammerStrike = () => {
      const cx = canvas.width * (0.3 + Math.random() * 0.4);
      const cy = canvas.height * (0.3 + Math.random() * 0.4);
      const count = 25 + Math.floor(Math.random() * 20);
      
      for (let i = 0; i < count; i++) {
        const angle = (Math.PI * 2 * i) / count + (Math.random() - 0.5) * 0.3;
        const speed = 3 + Math.random() * 5;
        
        sparks.push({
          x: cx,
          y: cy,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          life: 0,
          maxLife: 60 + Math.random() * 40,
          size: 1.5 + Math.random() * 2.5,
          color: colors[Math.floor(Math.random() * colors.length)], // Alle Farben inkl. Gelb/Weiß
        });
      }
    };
    
    // Timer für Hammerschläge (8-15 Sekunden)
    const scheduleHammer = () => {
      const delay = 8000 + Math.random() * 7000;
      setTimeout(() => {
        if (!reduced) hammerStrike();
        scheduleHammer();
      }, delay);
    };
    scheduleHammer();
    
    let raf = 0;
    
    const update = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Ambient spawnen
      if (Math.random() < 0.15) spawnAmbient();
      
      // Alle Funken updaten & zeichnen
      for (let i = sparks.length - 1; i >= 0; i--) {
        const s = sparks[i];
        
        s.x += s.vx;
        s.y += s.vy;
        s.vy += 0.02; // Schwerkraft
        s.vx *= 0.99; // Luftwiderstand
        s.life++;
        
        const lifeRatio = s.life / s.maxLife;
        const alpha = 1 - lifeRatio;
        
        if (alpha <= 0 || s.y > canvas.height + 50) {
          sparks.splice(i, 1);
          continue;
        }
        
        // Glow
        ctx.save();
        ctx.filter = 'blur(2px)';
        ctx.globalAlpha = alpha * 0.6;
        ctx.fillStyle = s.color;
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.size * 2, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
        
        // Kern
        ctx.globalAlpha = alpha;
        ctx.fillStyle = s.color;
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.size, 0, Math.PI * 2);
        ctx.fill();
      }
      
      ctx.globalAlpha = 1;
      
      if (!reduced) {
        raf = requestAnimationFrame(update);
      }
    };
    
    update();
    
    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-[5]"
      aria-hidden="true"
    />
  );
}
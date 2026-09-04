import { useEffect, useRef } from 'react';

export default function ForgeGlow() {
  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden" aria-hidden="true">
      {/* Haupt-Glow: tiefes Lila, pulsierend */}
      <div className="forge-glow-main" />
      {/* Hotspot: Pink, wandert langsam */}
      <div className="forge-glow-hot" />
      {/* Ambient: breiter, ruhiger Schein */}
      <div className="forge-glow-ambient" />
      
      <style>{`
        .forge-glow-main {
          position: absolute;
          inset: -20%;
          background: radial-gradient(
            ellipse 80% 60% at 50% 50%,
            rgba(124, 58, 237, 0.35) 0%,
            rgba(109, 40, 217, 0.20) 35%,
            rgba(67, 56, 202, 0.08) 65%,
            transparent 100%
          );
          animation: forgePulse 8s ease-in-out infinite;
          mix-blend-mode: screen;
        }
        .forge-glow-hot {
          position: absolute;
          inset: -10%;
          background: radial-gradient(
            ellipse 50% 40% at 50% 50%,
            rgba(236, 72, 153, 0.25) 0%,
            rgba(166, 92, 246, 0.15) 40%,
            transparent 80%
          );
          animation: forgeDrift 12s ease-in-out infinite;
          mix-blend-mode: screen;
        }
        .forge-glow-ambient {
          position: absolute;
          inset: -30%;
          background: radial-gradient(
            ellipse 100% 80% at 50% 50%,
            rgba(91, 33, 182, 0.12) 0%,
            rgba(67, 56, 202, 0.06) 50%,
            transparent 100%
          );
          animation: forgeAmbient 16s ease-in-out infinite;
          mix-blend-mode: screen;
        }
        
        @keyframes forgePulse {
          0%, 100% { 
            opacity: 0.7; 
            transform: scale(1);
          }
          50% { 
            opacity: 1; 
            transform: scale(1.05);
          }
        }
        @keyframes forgeDrift {
          0%, 100% { 
            transform: translate(0, 0) scale(1);
            opacity: 0.8;
          }
          33% { 
            transform: translate(5%, -3%) scale(1.1);
            opacity: 1;
          }
          66% { 
            transform: translate(-3%, 5%) scale(0.95);
            opacity: 0.7;
          }
        }
        @keyframes forgeAmbient {
          0%, 100% { opacity: 0.5; }
          50% { opacity: 0.8; }
        }
        
        @media (prefers-reduced-motion: reduce) {
          .forge-glow-main,
          .forge-glow-hot,
          .forge-glow-ambient {
            animation: none;
            opacity: 0.6;
          }
        }
      `}</style>
    </div>
  );
}
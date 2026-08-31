import { useState, useEffect } from 'react';
import type { CSSProperties } from 'react';

const EASE = 'cubic-bezier(0.16, 1, 0.3, 1)';
const REVEAL_MS = 900;

// --- i18n Strings ---
const STRINGS = {
  de: {
    h1Main: 'Valorferrum',
    h1Sub: 'Freelancer für digitale Sichtbarkeit',
    h2: 'Digitale Sichtbarkeit, die bleibt. Performance, die besteht.',
    intro: 'SEO, SEA, Webentwicklung und Tracking – aus einer Hand und ohne Agentur-Overhead. Für KMU, Startups und NGOs.',
    ctaPrimary: 'Kostenlos anfragen',
    ctaSecondary: 'Leistungen entdecken',
    scroll: 'Scroll',
    noscriptH1Main: 'Valorferrum',
    noscriptH1Sub: 'Freelancer für digitale Sichtbarkeit',
    noscriptH2: 'Digitale Sichtbarkeit, die bleibt. Performance, die besteht.',
    noscriptIntro: 'SEO, SEA, Webentwicklung und Tracking – aus einer Hand und ohne Agentur-Overhead. Für KMU, Startups und NGOs.',
    noscriptCtaPrimary: 'Kostenlos anfragen',
    noscriptCtaSecondary: 'Leistungen entdecken',
  },
  en: {
    h1Main: 'Valorferrum',
    h1Sub: 'Freelancer for Digital Visibility',
    h2: 'Digital visibility that lasts. Performance that endures.',
    intro: 'SEO, SEA, web development and tracking – all from one source, without agency overhead. For SMEs, startups and NGOs.',
    ctaPrimary: 'Get in touch',
    ctaSecondary: 'Explore services',
    scroll: 'Scroll',
    noscriptH1Main: 'Valorferrum',
    noscriptH1Sub: 'Freelancer for Digital Visibility',
    noscriptH2: 'Digital visibility that lasts. Performance that endures.',
    noscriptIntro: 'SEO, SEA, web development and tracking – all from one source, without agency overhead. For SMEs, startups and NGOs.',
    noscriptCtaPrimary: 'Get in touch',
    noscriptCtaSecondary: 'Explore services',
  },
};

interface Props {
  lang?: 'de' | 'en';
}

const HeroAssembler = ({ lang = 'de' }: Props) => {
  const t = STRINGS[lang];
  const [frameIn, setFrameIn] = useState(false);
  const [contentIn, setContentIn] = useState(false);
  const [zoom, setZoom] = useState(false);
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setReduced(true);
      setContentIn(true);
      setZoom(true);
      return;
    }
    let timers: number[] = [];
    const raf = requestAnimationFrame(() => {
      timers = [
        window.setTimeout(() => setFrameIn(true), 350),
        window.setTimeout(() => setContentIn(true), 1100),
        window.setTimeout(() => setZoom(true), 4200),
      ];
    });
    return () => { cancelAnimationFrame(raf); timers.forEach(clearTimeout); };
  }, []);

  // Richtungsbasiertes Reveal + Einrast-Impuls
  const reveal = (delay: number, from: string): CSSProperties => ({
    opacity: contentIn && !zoom ? 1 : (zoom ? 0 : 0),
    transform: contentIn ? 'translate(0,0)' : from,
    transition: `opacity ${REVEAL_MS}ms ${EASE} ${delay}ms, transform ${REVEAL_MS}ms ${EASE} ${delay}ms`,
    animation: contentIn && !reduced && !zoom ? `einrast 500ms ease-out ${delay + REVEAL_MS}ms 1` : 'none',
    pointerEvents: zoom ? 'none' : 'auto',
  });

  // Bühne: sanfter Zoom
  const stageStyle: CSSProperties = {
    transform: zoom ? 'scale(1)' : 'scale(0.96)',
    transition: `transform 1000ms ${EASE}`,
    pointerEvents: zoom ? 'none' : 'auto',
  };

  // Desktop-Frame: löst sich beim Zoom auf
  const frameStyle: CSSProperties = {
    opacity: frameIn && !zoom ? 1 : 0,
    transform: zoom ? 'scale(1.05)' : (frameIn ? 'scale(1)' : 'scale(0.985)'),
    transition: 'opacity 800ms ease, transform 1000ms ease',
    pointerEvents: zoom ? 'none' : 'auto',
  };

  // Echter Hero (hinter dem Frame)
  const heroStyle: CSSProperties = {
    opacity: zoom ? 1 : 0,
    transform: zoom ? 'translateY(0)' : 'translateY(16px)',
    transition: `opacity 900ms ${EASE} 200ms, transform 900ms ${EASE} 200ms`,
    pointerEvents: zoom ? 'auto' : 'none',
  };

  const scrollStyle: CSSProperties = {
    opacity: zoom ? 1 : 0,
    transition: 'opacity 600ms ease 300ms',
  };

  const contactHref = lang === 'de' ? '/de/kontakt' : '/en/contact';
  const servicesHref = lang === 'de' ? '/de/leistungen' : '/en/services';

  return (
    <div className="relative w-full min-h-[100dvh] flex items-center justify-center overflow-hidden px-4 pt-24 pb-12">

      {/* STATIC FALLBACK */}
      <noscript>
        <div className="absolute inset-0 z-20 flex items-center justify-center px-6 bg-bg">
          <div className="text-center max-w-4xl">
            <h1 className="font-display font-bold text-text-primary text-4xl sm:text-5xl md:text-6xl lg:text-7xl leading-[1.05] mb-6">
              <span className="block">{t.noscriptH1Main}</span>
              <span className="block text-xl sm:text-2xl md:text-3xl text-text-secondary font-normal mt-3">{t.noscriptH1Sub}</span>
            </h1>
            <h2 className="text-lg md:text-xl lg:text-2xl text-primary font-display font-medium max-w-2xl mx-auto mb-8">{t.noscriptH2}</h2>
            <p className="text-base md:text-lg text-text-secondary max-w-2xl mx-auto mb-10 leading-relaxed">{t.noscriptIntro}</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a href={contactHref} className="px-8 py-4 bg-primary text-white font-semibold rounded-lg shadow-lg shadow-primary/25">{t.noscriptCtaPrimary}</a>
              <a href={servicesHref} className="px-8 py-4 border border-primary/30 text-primary rounded-lg hover:bg-primary/5">{t.noscriptCtaSecondary}</a>
            </div>
          </div>
        </div>
      </noscript>

      {/* Orbs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-[120px] pulse-anim" aria-hidden="true"></div>
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-primary/8 rounded-full blur-[100px] float-anim" aria-hidden="true"></div>

      {/* ===== EBENE 1: Echter Hero ===== */}
      <div className="absolute inset-0 z-0 flex items-center justify-center px-6" style={heroStyle}>
        <div className="text-center max-w-4xl">
          <h1 className="font-display font-bold text-text-primary leading-[1.05] mb-6">
            <span className="block text-4xl sm:text-5xl md:text-6xl lg:text-7xl">{t.h1Main}</span>
            <span className="block text-xl sm:text-2xl md:text-3xl text-text-secondary font-normal mt-3">{t.h1Sub}</span>
          </h1>
          <h2 className="text-lg md:text-xl lg:text-2xl text-primary font-display font-medium max-w-2xl mx-auto mb-8">{t.h2}</h2>
          <p className="text-base md:text-lg text-text-secondary max-w-2xl mx-auto mb-10 leading-relaxed">{t.intro}</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a href={contactHref} className="px-8 py-4 bg-primary hover:bg-primary-light text-white font-semibold rounded-lg transition-all shadow-lg shadow-primary/25 hover:-translate-y-0.5">{t.ctaPrimary}</a>
            <a href={servicesHref} className="px-8 py-4 border border-primary/30 hover:border-primary text-primary rounded-lg transition-all hover:bg-primary/5">{t.ctaSecondary}</a>
          </div>
        </div>
      </div>

      {/* ===== EBENE 2: Desktop-Animation ===== */}
      <div className="relative w-full max-w-4xl z-10" style={stageStyle}>

        {/* Desktop-Frame */}
        <div className="absolute -inset-4 sm:-inset-8 rounded-3xl border border-primary/15 bg-surface/40 shadow-2xl overflow-hidden pointer-events-none" style={frameStyle}>
          <div className="h-12 flex items-center gap-2 px-5 border-b border-border/50 bg-bg/40">
            <span className="w-3 h-3 rounded-full bg-text-muted/30"></span>
            <span className="w-3 h-3 rounded-full bg-text-muted/30"></span>
            <span className="w-3 h-3 rounded-full bg-text-muted/30"></span>
          </div>
          <div className="absolute inset-0 top-12 bg-gradient-to-b from-primary/5 via-transparent to-transparent" aria-hidden="true"></div>
        </div>

        {/* Inhalte */}
        <div className="relative py-16 sm:py-20 px-6 text-center">
          <h1 className="font-display font-bold text-text-primary leading-[1.05] mb-6" style={reveal(0, 'translate(-40px, 0)')}>
            <span className="block text-4xl sm:text-5xl md:text-6xl lg:text-7xl">{t.h1Main}</span>
            <span className="block text-xl sm:text-2xl md:text-3xl text-text-secondary font-normal mt-3">{t.h1Sub}</span>
          </h1>
          <h2 className="text-lg md:text-xl lg:text-2xl text-primary font-display font-medium max-w-2xl mx-auto mb-8" style={reveal(250, 'translate(40px, 0)')}>{t.h2}</h2>
          <p className="text-base md:text-lg text-text-secondary max-w-2xl mx-auto mb-10 leading-relaxed" style={reveal(500, 'translate(0, 24px)')}>{t.intro}</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center" style={reveal(750, 'translate(20px, 30px)')}>
            <a href={contactHref} className="px-8 py-4 bg-primary hover:bg-primary-light text-white font-semibold rounded-lg transition-all shadow-lg shadow-primary/25 hover:-translate-y-0.5">{t.ctaPrimary}</a>
            <a href={servicesHref} className="px-8 py-4 border border-primary/30 hover:border-primary text-primary rounded-lg transition-all hover:bg-primary/5">{t.ctaSecondary}</a>
          </div>
        </div>
      </div>

      {/* Scroll-Indicator */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-text-muted animate-bounce" style={scrollStyle}>
        <span className="text-xs uppercase tracking-widest">{t.scroll}</span>
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 14l-7 7m0 0l-7-7m7 7V3"/></svg>
      </div>
    </div>
  );
};

export default HeroAssembler;
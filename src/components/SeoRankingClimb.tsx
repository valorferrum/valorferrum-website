import { useState, useEffect } from 'react';
import type { CSSProperties } from 'react';

const EASE = 'cubic-bezier(0.16, 1, 0.3, 1)';
const PITCH = 72;
const BRAND = '#A65CF6';

const COMPETITORS = [
  { pos: 1, top: 0 },
  { pos: 2, top: PITCH },
  { pos: 3, top: PITCH * 2 },
];
const BRAND_TOP = PITCH * 3;

// --- i18n Strings ---
const STRINGS = {
  de: {
    brandUrl: 'valorferrum.de',
    positionBadge: 'Position 1',
    tagline: <>Nicht versprochen. <span className="text-primary font-medium">Umgesetzt.</span></>,
    heroH1Main: 'SEO Freelancer',
    heroH1Sub: 'Google Ranking verbessern, das bleibt',
    heroH2: 'Nachhaltige Sichtbarkeit statt kurzfristiger Tricks.',
    heroIntro: 'SEO-Analyse, technisches SEO und Content-Strategie für kleine Unternehmen, Startups und NGOs – datengetrieben, transparent, ohne Agentur-Overhead.',
    ctaPrimary: 'Kostenlose SEO-Analyse',
    ctaSecondary: 'SEO-Kosten ansehen',
    noscriptH1: 'SEO Freelancer – Google Ranking verbessern',
    noscriptP: 'Nachhaltige Sichtbarkeit für KMU, Startups und NGOs. Datengetrieben, transparent, ohne Agentur-Overhead.',
    noscriptCta: 'Kostenlose SEO-Analyse',
    scroll: 'Scroll',
  },
  en: {
    brandUrl: 'valorferrum.de',
    positionBadge: 'Position 1',
    tagline: <>Not promised. <span className="text-primary font-medium">Delivered.</span></>,
    heroH1Main: 'SEO Freelancer',
    heroH1Sub: 'Improve Your Google Ranking — Sustainably',
    heroH2: 'Lasting visibility instead of short-term tricks.',
    heroIntro: 'SEO analysis, technical SEO and content strategy for small businesses, startups and NGOs – data-driven, transparent, without agency overhead.',
    ctaPrimary: 'Free SEO Analysis',
    ctaSecondary: 'View SEO Pricing',
    noscriptH1: 'SEO Freelancer – Improve Your Google Ranking',
    noscriptP: 'Sustainable visibility for SMEs, startups and NGOs. Data-driven, transparent, without agency overhead.',
    noscriptCta: 'Free SEO Analysis',
    scroll: 'Scroll',
  },
};

interface Props {
  lang?: 'de' | 'en';
}

const SeoRankingClimb = ({ lang = 'de' }: Props) => {
  const t = STRINGS[lang];
  const [frameIn, setFrameIn] = useState(false);
  const [rank, setRank] = useState(4);
  const [settled, setSettled] = useState(false);
  const [zoom, setZoom] = useState(false);
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setReduced(true);
      setRank(1);
      setSettled(true);
      setZoom(true);
      return;
    }
    let timers: number[] = [];
    const raf = requestAnimationFrame(() => {
      timers = [
        window.setTimeout(() => setFrameIn(true), 400),
        window.setTimeout(() => setRank(3), 1600),
        window.setTimeout(() => setRank(2), 2400),
        window.setTimeout(() => setRank(1), 3200),
        window.setTimeout(() => setSettled(true), 4000),
        window.setTimeout(() => setZoom(true), 5400),
      ];
    });
    return () => { cancelAnimationFrame(raf); timers.forEach(clearTimeout); };
  }, []);

  const stageStyle: CSSProperties = {
    transform: zoom ? 'scale(1)' : 'scale(0.96)',
    transition: `transform 1000ms ${EASE}`,
    pointerEvents: zoom ? 'none' : 'auto',
  };

  const frameStyle: CSSProperties = {
    opacity: frameIn && !zoom ? 1 : 0,
    transform: zoom ? 'scale(1.04)' : (frameIn ? 'scale(1)' : 'scale(0.985)'),
    transition: 'opacity 800ms ease, transform 1000ms ease',
    pointerEvents: zoom ? 'none' : 'auto',
  };

  const competitorStyle = (pos: number): CSSProperties => {
    const visible = frameIn && rank > pos;
    return {
      opacity: visible ? 1 : 0,
      transform: visible ? 'translateY(0)' : 'translateY(44px)',
      transition: `opacity 600ms ${EASE}, transform 600ms ${EASE}`,
    };
  };

  const brandStyle: CSSProperties = {
    opacity: frameIn && !zoom ? 1 : 0,
    transform: zoom ? 'translateY(8px)' : (frameIn ? 'translateY(0)' : 'translateY(16px)'),
    transition: `opacity 800ms ease, transform 800ms ease`,
    borderColor: settled ? BRAND : 'rgba(166,92,246,0.25)',
    animation: settled && !reduced ? 'einrast 500ms ease-out 1' : 'none',
    pointerEvents: zoom ? 'none' : 'auto',
  };

  const heroStyle: CSSProperties = {
    opacity: zoom ? 1 : 0,
    transform: zoom ? 'translateY(0)' : 'translateY(16px)',
    transition: `opacity 900ms ${EASE} 200ms, transform 900ms ${EASE} 200ms`,
    pointerEvents: zoom ? 'auto' : 'none',
  };

  const taglineStyle: CSSProperties = {
    opacity: settled && !zoom ? 1 : 0,
    transform: zoom ? 'translateY(8px)' : (settled ? 'translateY(0)' : 'translateY(12px)'),
    transition: `opacity 800ms ease, transform 800ms ease`,
    pointerEvents: zoom ? 'none' : 'auto',
  };

  const scrollStyle: CSSProperties = {
    opacity: zoom ? 1 : 0,
    transition: 'opacity 600ms ease 300ms',
  };

  const contactHref = lang === 'de' ? '/de/kontakt' : '/en/contact';
  const pricingHref = lang === 'de' ? '/de/preise/kalkulation' : '/en/pricing/calculation';

  return (
    <div className="relative w-full min-h-[100dvh] flex items-center justify-center overflow-hidden px-4 pt-24 pb-12">

      {/* STATIC FALLBACK */}
      <noscript>
        <div className="absolute inset-0 z-20 flex items-center justify-center px-6 bg-bg">
          <div className="text-center max-w-4xl">
            <h1 className="font-display font-bold text-text-primary text-4xl sm:text-5xl md:text-6xl leading-[1.05] mb-6">
              {t.noscriptH1}
            </h1>
            <p className="text-lg text-text-secondary max-w-2xl mx-auto mb-10">{t.noscriptP}</p>
            <a href={contactHref} className="px-8 py-4 bg-primary text-white font-semibold rounded-lg">{t.noscriptCta}</a>
          </div>
        </div>
      </noscript>

      {/* Orbs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-[120px] pulse-anim" aria-hidden="true"></div>
      <div className="absolute bottom-1/3 right-1/4 w-72 h-72 bg-primary/8 rounded-full blur-[100px] float-anim" aria-hidden="true"></div>

      {/* ===== EBENE 1: Echter SEO-Hero ===== */}
      <div className="absolute inset-0 z-0 flex items-center justify-center px-6" style={heroStyle}>
        <div className="text-center max-w-4xl">
          <h1 className="font-display font-bold text-text-primary leading-[1.05] mb-6">
            <span className="block text-4xl sm:text-5xl md:text-6xl">{t.heroH1Main}</span>
            <span className="block text-xl sm:text-2xl md:text-3xl text-text-secondary font-normal mt-3">{t.heroH1Sub}</span>
          </h1>
          <h2 className="text-lg md:text-xl text-primary font-display font-medium max-w-2xl mx-auto mb-8">{t.heroH2}</h2>
          <p className="text-base md:text-lg text-text-secondary max-w-2xl mx-auto mb-10 leading-relaxed">{t.heroIntro}</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a href={contactHref} className="px-8 py-4 bg-primary hover:bg-primary-light text-white font-semibold rounded-lg transition-all shadow-lg shadow-primary/25 hover:-translate-y-0.5">{t.ctaPrimary}</a>
            <a href={pricingHref} className="px-8 py-4 border border-primary/30 hover:border-primary text-primary rounded-lg transition-all hover:bg-primary/5">{t.ctaSecondary}</a>
          </div>
        </div>
      </div>

      {/* ===== EBENE 2: SERP-Animation ===== */}
      <div className="relative w-full max-w-2xl z-10" style={stageStyle}>
        <div className="absolute -inset-4 sm:-inset-6 rounded-3xl border border-primary/15 bg-surface/40 shadow-2xl overflow-hidden" style={frameStyle}>
          <div className="h-11 flex items-center gap-2 px-5 border-b border-border/50 bg-bg/40">
            <span className="w-3 h-3 rounded-full bg-text-muted/30"></span>
            <span className="w-3 h-3 rounded-full bg-text-muted/30"></span>
            <span className="w-3 h-3 rounded-full bg-text-muted/30"></span>
          </div>
          <div className="absolute inset-0 top-11 bg-gradient-to-b from-primary/5 via-transparent to-transparent" aria-hidden="true"></div>
        </div>

        <div className="relative py-12 sm:py-14 px-5 sm:px-6">
          <div className="relative" style={{ height: `${BRAND_TOP + 64}px` }}>

            {/* Platzhalter */}
            {COMPETITORS.map((c) => (
              <div key={c.pos} className="absolute left-0 right-0 flex items-center gap-3 p-3 rounded-xl bg-surface/50 border border-border/40" style={{ top: `${c.top}px`, ...competitorStyle(c.pos) }}>
                <span className="shrink-0 w-8 h-8 rounded-lg bg-bg/60 border border-border/50 flex items-center justify-center text-sm font-mono text-text-muted">{c.pos}</span>
                <div className="flex-1 space-y-2">
                  <div className="h-2.5 rounded-full bg-text-muted/25 w-2/3"></div>
                  <div className="h-2 rounded-full bg-text-muted/15 w-full"></div>
                </div>
              </div>
            ))}

            {/* Valorferrum */}
            <div className="absolute left-0 right-0 flex items-center gap-3 p-3 rounded-xl bg-surface border-2 shadow-lg" style={{ top: `${BRAND_TOP}px`, ...brandStyle }}>
              <span key={rank} className="shrink-0 w-8 h-8 rounded-lg flex items-center justify-center text-sm font-mono font-bold text-white bg-primary" style={{ animation: !reduced ? 'rankTick 300ms ease-out' : 'none' }}>{rank}</span>
              <div className="flex-1 min-w-0">
                <span className="block text-xs font-mono text-primary mb-1.5 truncate">{t.brandUrl}</span>
                <div className="h-2.5 rounded-full w-3/4" style={{ background: 'linear-gradient(90deg, rgba(166,92,246,0.5), rgba(166,92,246,0.15))' }}></div>
              </div>
              {settled && (
                <span className="shrink-0 text-[10px] font-bold text-white bg-primary px-2.5 py-1 rounded-full whitespace-nowrap">{t.positionBadge}</span>
              )}
            </div>
          </div>

          {/* Tagline */}
          <div className="mt-5 text-center" style={taglineStyle}>
            <p className="text-sm text-text-secondary">{t.tagline}</p>
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

export default SeoRankingClimb;
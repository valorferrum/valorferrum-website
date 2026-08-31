import { useState, useEffect } from 'react';
import type { CSSProperties } from 'react';

const EASE = 'cubic-bezier(0.16, 1, 0.3, 1)';

// --- i18n Strings (Keywords laut Briefing §7.2: "sea freelancer", "google werbung", "ppc") ---
const STRINGS = {
  de: {
    query: 'sea freelancer',
    sponsored: 'Gesponsert',
    labelShopping: 'Shopping',
    labelSearch: 'Suchanzeigen',
    labelDisplay: 'Display',
    tagline: <>Drei Netzwerke. <span className="text-primary font-medium">Ein messbares Ergebnis.</span></>,
    heroH1Main: 'SEA Freelancer',
    heroH1Sub: 'Google Werbung, die sich rechnet',
    heroH2: 'PPC-Kampagnen mit messbarem Return.',
    heroIntro: 'Google Ads, Microsoft Ads und Conversion-Tracking – über Suche, Shopping und Display. Datengetrieben, transparent, ohne Agentur-Overhead. Für KMU, Startups und NGOs.',
    ctaPrimary: 'Kostenlose Ads-Analyse',
    ctaSecondary: 'Google Ads Kosten ansehen',
    noscriptH1: 'SEA Freelancer – Google Werbung, die sich rechnet',
    noscriptP: 'PPC-Kampagnen mit messbarem Return für KMU, Startups und NGOs. Datengetrieben, transparent, ohne Agentur-Overhead.',
    scroll: 'Scroll',
  },
  en: {
    query: 'sea freelancer',
    sponsored: 'Sponsored',
    labelShopping: 'Shopping',
    labelSearch: 'Search Ads',
    labelDisplay: 'Display',
    tagline: <>Three networks. <span className="text-primary font-medium">One measurable result.</span></>,
    heroH1Main: 'SEA Freelancer',
    heroH1Sub: 'Google Ads that pay for themselves',
    heroH2: 'PPC campaigns with measurable return.',
    heroIntro: 'Google Ads, Microsoft Ads and conversion tracking – across search, shopping and display. Data-driven, transparent, without agency overhead. For SMEs, startups and NGOs.',
    ctaPrimary: 'Free Ads Analysis',
    ctaSecondary: 'View Google Ads Costs',
    noscriptH1: 'SEA Freelancer – Google Ads That Pay for Themselves',
    noscriptP: 'PPC campaigns with measurable return for SMEs, startups and NGOs. Data-driven, transparent, without agency overhead.',
    scroll: 'Scroll',
  },
};

interface Props {
  lang?: 'de' | 'en';
}

const SeaAdGlow = ({ lang = 'de' }: Props) => {
  const t = STRINGS[lang];
  const [frameIn, setFrameIn] = useState(false);
  const [lit, setLit] = useState(0);          // Anzahl aufgeglühter Formate (0–6)
  const [settled, setSettled] = useState(false);
  const [zoom, setZoom] = useState(false);
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setReduced(true);
      setLit(6);
      setSettled(true);
      setZoom(true);
      return;
    }
    let timers: number[] = [];
    const raf = requestAnimationFrame(() => {
      timers = [
        window.setTimeout(() => setFrameIn(true), 400),  // Frame + Suchleiste
        window.setTimeout(() => setLit(1), 1200),        // Shopping 1
        window.setTimeout(() => setLit(2), 1500),        // Shopping 2
        window.setTimeout(() => setLit(3), 1800),        // Shopping 3
        window.setTimeout(() => setLit(4), 2200),        // Suchanzeige 1 (mit Bild)
        window.setTimeout(() => setLit(5), 2600),        // Suchanzeige 2
        window.setTimeout(() => setLit(6), 3000),        // Display am Rand
        window.setTimeout(() => setSettled(true), 3800), // synchroner Einrast-Puls
        window.setTimeout(() => setZoom(true), 5200),    // Frame löst sich auf → echter Hero
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

  const searchBarStyle: CSSProperties = {
    opacity: frameIn && !zoom ? 1 : 0,
    transform: zoom ? 'translateY(8px)' : (frameIn ? 'translateY(0)' : 'translateY(-16px)'),
    transition: `opacity 700ms ${EASE}, transform 700ms ${EASE}`,
  };

  // Format-Slots: faden ein + Glow (Impression), synchroner Puls bei settled, faden nach unten weg beim Zoom
  const slotStyle = (i: number): CSSProperties => {
    const visible = frameIn && lit > i;
    return {
      opacity: visible && !zoom ? 1 : 0,
      transform: visible ? (zoom ? 'translateY(44px)' : 'translateY(0)') : 'translateY(-12px)',
      transition: `opacity 600ms ${EASE}, transform 600ms ${EASE}`,
      animation: visible && !reduced && !zoom
        ? (settled ? 'einrast 500ms ease-out 1' : 'rankGlow 700ms ease-out 1')
        : 'none',
    };
  };

  // Format-Labels: faden mit der ersten Karte der Gruppe ein
  const labelStyle = (i: number): CSSProperties => ({
    opacity: frameIn && lit > i && !zoom ? 1 : 0,
    transition: 'opacity 600ms ease',
  });

  const taglineStyle: CSSProperties = {
    opacity: settled && !zoom ? 1 : 0,
    transform: zoom ? 'translateY(8px)' : (settled ? 'translateY(0)' : 'translateY(12px)'),
    transition: `opacity 800ms ease, transform 800ms ease`,
    pointerEvents: zoom ? 'none' : 'auto',
  };

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
  const pricingHref = lang === 'de' ? '/de/preise/kalkulation' : '/en/pricing/calculation';

  return (
    <div className="relative w-full min-h-[100dvh] flex items-center justify-center overflow-hidden px-4 pt-24 pb-12">

      {/* STATIC FALLBACK */}
      <noscript>
        <div className="absolute inset-0 z-20 flex items-center justify-center px-6 bg-bg">
          <div className="text-center max-w-4xl">
            <h1 className="font-display font-bold text-text-primary text-4xl sm:text-5xl md:text-6xl leading-[1.05] mb-6">{t.noscriptH1}</h1>
            <p className="text-lg text-text-secondary max-w-2xl mx-auto mb-10">{t.noscriptP}</p>
            <a href={contactHref} className="px-8 py-4 bg-primary text-white font-semibold rounded-lg">{t.ctaPrimary}</a>
          </div>
        </div>
      </noscript>

      {/* Orbs – nur Brand-Lila */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-[120px] pulse-anim" aria-hidden="true"></div>
      <div className="absolute bottom-1/3 right-1/4 w-72 h-72 bg-primary/8 rounded-full blur-[100px] float-anim" aria-hidden="true"></div>

      {/* ===== EBENE 1: Echter SEA-Hero ===== */}
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

      {/* ===== EBENE 2: SERP mit Shopping, Search & Display ===== */}
      <div className="relative w-full max-w-3xl z-10" style={stageStyle}>

        {/* Frame (ohne URL, nur Punkte) */}
        <div className="absolute -inset-4 sm:-inset-6 rounded-3xl border border-primary/15 bg-surface/40 shadow-2xl overflow-hidden" style={frameStyle}>
          <div className="h-11 flex items-center gap-2 px-5 border-b border-border/50 bg-bg/40">
            <span className="w-3 h-3 rounded-full bg-text-muted/30"></span>
            <span className="w-3 h-3 rounded-full bg-text-muted/30"></span>
            <span className="w-3 h-3 rounded-full bg-text-muted/30"></span>
          </div>
          <div className="absolute inset-0 top-11 bg-gradient-to-b from-primary/5 via-transparent to-transparent" aria-hidden="true"></div>
        </div>

        {/* Inhalt */}
        <div className="relative py-12 sm:py-14 px-5 sm:px-6">

          {/* Suchleiste */}
          <div className="mb-6" style={searchBarStyle}>
            <div className="flex items-center gap-3 h-12 px-5 rounded-full bg-bg/60 border border-border/60">
              <svg className="w-5 h-5 text-text-muted shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <span className="text-sm text-text-secondary font-mono truncate">{t.query}</span>
            </div>
          </div>

          <div className="flex gap-4">
            {/* ===== Hauptspalte: Shopping + Suchanzeigen ===== */}
            <div className="flex-1 min-w-0">

              {/* Shopping-Carousel (über den Suchanzeigen) */}
              <div className="mb-2" style={labelStyle(0)}>
                <span className="text-[10px] uppercase tracking-widest text-text-muted font-mono">{t.labelShopping}</span>
              </div>
              <div className="flex gap-3 mb-6">
                {[0, 1, 2].map((i) => (
                  <div key={i} className="flex-1 p-3 rounded-xl bg-surface/50 border border-border/40" style={slotStyle(i)}>
                    {/* Bild-Platzhalter */}
                    <div className="h-14 sm:h-16 rounded-lg bg-gradient-to-br from-primary/15 to-surface-elevated mb-2"></div>
                    <div className="h-2 rounded-full bg-text-muted/25 w-4/5 mb-1.5"></div>
                    <div className="h-2 rounded-full bg-text-muted/15 w-1/2"></div>
                  </div>
                ))}
              </div>

              {/* Suchanzeigen */}
              <div className="mb-2" style={labelStyle(3)}>
                <span className="text-[10px] uppercase tracking-widest text-text-muted font-mono">{t.labelSearch}</span>
              </div>
              <div className="space-y-3">
                {/* Suchanzeige MIT Bild-Extension */}
                <div className="flex items-center gap-3 p-4 rounded-xl bg-surface/50 border border-border/40" style={slotStyle(3)}>
                  <div className="flex-1 min-w-0 space-y-2">
                    <span className="inline-block text-[10px] font-semibold text-text-muted border border-border/50 rounded px-1.5 py-0.5 mb-1">{t.sponsored}</span>
                    <div className="h-2.5 rounded-full bg-text-muted/25 w-3/4"></div>
                    <div className="h-2 rounded-full bg-text-muted/15 w-full"></div>
                  </div>
                  {/* Bild-Extension rechts */}
                  <div className="w-14 h-14 rounded-lg bg-gradient-to-br from-primary/20 to-surface-elevated shrink-0"></div>
                </div>

                {/* Suchanzeige ohne Bild */}
                <div className="p-4 rounded-xl bg-surface/50 border border-border/40" style={slotStyle(4)}>
                  <span className="inline-block text-[10px] font-semibold text-text-muted border border-border/50 rounded px-1.5 py-0.5 mb-2">{t.sponsored}</span>
                  <div className="space-y-2">
                    <div className="h-2.5 rounded-full bg-text-muted/25 w-3/4"></div>
                    <div className="h-2 rounded-full bg-text-muted/15 w-full"></div>
                  </div>
                </div>
              </div>
            </div>

            {/* ===== Display am rechten Rand ===== */}
            <div className="hidden sm:flex flex-col w-28 shrink-0">
              <div className="mb-2" style={labelStyle(5)}>
                <span className="text-[10px] uppercase tracking-widest text-text-muted font-mono">{t.labelDisplay}</span>
              </div>
              <div className="flex-1 p-3 rounded-xl bg-surface/50 border border-border/40 flex flex-col items-center" style={slotStyle(5)}>
                {/* Display-Bild */}
                <div className="w-full aspect-[3/4] rounded-lg bg-gradient-to-br from-primary/15 to-surface-elevated mb-3"></div>
                <div className="h-2 rounded-full bg-text-muted/25 w-full mb-1.5"></div>
                <div className="h-2 rounded-full bg-text-muted/15 w-2/3 mb-4"></div>
                {/* CTA-Platzhalter */}
                <div className="mt-auto w-full h-6 rounded-md bg-primary/20"></div>
              </div>
            </div>
          </div>

          {/* Tagline */}
          <div className="mt-6 text-center" style={taglineStyle}>
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

export default SeaAdGlow;
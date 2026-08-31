import { useState, useEffect } from 'react';
import type { CSSProperties } from 'react';

const EASE = 'cubic-bezier(0.16, 1, 0.3, 1)';

// --- i18n Strings (Keywords laut Briefing §7.2: "website erstellen lassen", "webentwicklung", "freelancer webentwicklung") ---
const STRINGS = {
  de: {
    fileTab: 'index.astro',
    perfLabel: 'Ladezeit',
    perfValues: ['2,5 s', '0,8 s', '0,3 s'],
    tagline: <>Gebaut, um zu <span className="text-primary font-medium">bestehen.</span></>,
    heroH1Main: 'Website erstellen lassen',
    heroH1Sub: 'Schnell, barrierefrei & suchmaschinenoptimiert',
    heroH2: 'Webentwicklung mit Astro, WordPress & TYPO3 – von einem Freelancer.',
    heroIntro: 'Performance-first und technisch sauber – inklusive SEO-Basis-Setup bei jeder Website. Für KMU, Startups und NGOs.',
    ctaPrimary: 'Website-Projekt anfragen',
    ctaSecondary: 'Webentwicklung-Kosten ansehen',
    noscriptH1: 'Website erstellen lassen – schnell, barrierefrei & SEO-optimiert',
    noscriptP: 'Webentwicklung mit Astro, WordPress & TYPO3 von einem Freelancer. Performance-first, inklusive SEO-Basis-Setup. Für KMU, Startups und NGOs.',
    scroll: 'Scroll',
  },
  en: {
    fileTab: 'index.astro',
    perfLabel: 'Load time',
    perfValues: ['2.5s', '0.8s', '0.3s'],
    tagline: <>Built to <span className="text-primary font-medium">endure.</span></>,
    heroH1Main: 'Have your website built',
    heroH1Sub: 'Fast, accessible & search-engine optimized',
    heroH2: 'Web development with Astro, WordPress & TYPO3 – by a freelancer.',
    heroIntro: 'Performance-first and technically clean – including a basic SEO setup with every website. For SMEs, startups and NGOs.',
    ctaPrimary: 'Request a website project',
    ctaSecondary: 'View web development costs',
    noscriptH1: 'Have your website built – fast, accessible & SEO-optimized',
    noscriptP: 'Web development with Astro, WordPress & TYPO3 by a freelancer. Performance-first, including basic SEO setup. For SMEs, startups and NGOs.',
    scroll: 'Scroll',
  },
};

interface Props {
  lang?: 'de' | 'en';
}

// Code-Zeilen (Skeleton mit Indents = Syntax-Optik)
const CODE_LINES = [
  { indent: '0%',  w: '55%', tone: 'bg-primary/50' },
  { indent: '10%', w: '70%', tone: 'bg-text-muted/25' },
  { indent: '10%', w: '45%', tone: 'bg-text-muted/25' },
  { indent: '20%', w: '60%', tone: 'bg-primary/35' },
  { indent: '10%', w: '35%', tone: 'bg-text-muted/25' },
  { indent: '0%',  w: '25%', tone: 'bg-primary/50' },
];

const WebDevCodeMorph = ({ lang = 'de' }: Props) => {
  const t = STRINGS[lang];
  const [frameIn, setFrameIn] = useState(false);
  const [lines, setLines] = useState(0);   // Code-Zeilen "getippt" (0–6)
  const [built, setBuilt] = useState(false); // Morph: Code → fertige Website
  const [perf, setPerf] = useState(0);     // Ladezeit-Counter (0–3)
  const [settled, setSettled] = useState(false);
  const [zoom, setZoom] = useState(false);
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setReduced(true);
      setLines(6);
      setBuilt(true);
      setPerf(3);
      setSettled(true);
      setZoom(true);
      return;
    }
    let timers: number[] = [];
    const raf = requestAnimationFrame(() => {
      timers = [
        window.setTimeout(() => setFrameIn(true), 400),   // Frame + Editor
        window.setTimeout(() => setLines(1), 1000),       // Code wird "getippt"
        window.setTimeout(() => setLines(2), 1300),
        window.setTimeout(() => setLines(3), 1600),
        window.setTimeout(() => setLines(4), 1900),
        window.setTimeout(() => setLines(5), 2200),
        window.setTimeout(() => setLines(6), 2500),
        window.setTimeout(() => setBuilt(true), 3000),    // Morph zur fertigen Website
        window.setTimeout(() => setPerf(1), 3300),        // Ladezeit tickt runter
        window.setTimeout(() => setPerf(2), 3700),
        window.setTimeout(() => setPerf(3), 4100),
        window.setTimeout(() => setSettled(true), 4700),  // Einrast + Tagline
        window.setTimeout(() => setZoom(true), 6100),     // Zoom in echten Hero
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

  // Inhalt: fadet beim Zoom nach unten weg
  const innerStyle: CSSProperties = {
    opacity: frameIn && !zoom ? 1 : 0,
    transform: zoom ? 'translateY(44px)' : 'translateY(0)',
    transition: `opacity 700ms ease, transform 700ms ease`,
  };

  // Code-Editor: sichtbar bis zum Build, schrumpft leicht beim Morph
  const codeStyle: CSSProperties = {
    opacity: !built ? 1 : 0,
    transform: built ? 'scale(0.97)' : 'scale(1)',
    transition: `opacity 700ms ${EASE}, transform 700ms ${EASE}`,
  };

  // Fertige Website: erscheint beim Build
  const previewStyle: CSSProperties = {
    opacity: built ? 1 : 0,
    transform: built ? 'scale(1)' : 'scale(0.96)',
    transition: `opacity 700ms ${EASE}, transform 700ms ${EASE}`,
    animation: settled && !reduced ? 'einrast 500ms ease-out 1' : 'none',
  };

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

      {/* ===== EBENE 1: Echter Webentwicklungs-Hero ===== */}
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

      {/* ===== EBENE 2: Code → Website Morph ===== */}
      <div className="relative w-full max-w-2xl z-10" style={stageStyle}>

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
          <div className="relative h-64 sm:h-72 rounded-xl bg-bg/40 border border-border/40 overflow-hidden" style={innerStyle}>

            {/* ===== Code-Editor ===== */}
            <div className="absolute inset-0 flex flex-col" style={codeStyle}>
              <div className="h-8 flex items-center gap-2 px-4 border-b border-border/40 shrink-0">
                <span className="w-1.5 h-1.5 rounded-full bg-primary/60"></span>
                <span className="text-[10px] font-mono text-text-muted">{t.fileTab}</span>
              </div>
              <div className="p-4 space-y-3">
                {CODE_LINES.map((l, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-3"
                    style={{
                      opacity: lines > i ? 1 : 0,
                      transform: lines > i ? 'translateX(0)' : 'translateX(-8px)',
                      transition: `opacity 400ms ${EASE}, transform 400ms ${EASE}`,
                    }}
                  >
                    <span className="w-5 text-right text-[10px] font-mono text-text-muted/60 select-none">{i + 1}</span>
                    <div className={`h-2 rounded-full ${l.tone}`} style={{ width: l.w, marginLeft: l.indent }}></div>
                  </div>
                ))}
              </div>
            </div>

            {/* ===== Fertige Website (nach dem Build) ===== */}
            <div className="absolute inset-0 flex flex-col" style={previewStyle}>
              {/* Navbar */}
              <div className="h-8 border-b border-border/40 flex items-center gap-2 px-3 shrink-0">
                <div className="w-10 h-2 rounded-full bg-primary/40"></div>
                <div className="ml-auto flex gap-2">
                  <div className="w-6 h-2 rounded-full bg-text-muted/15"></div>
                  <div className="w-6 h-2 rounded-full bg-text-muted/15"></div>
                  <div className="w-6 h-2 rounded-full bg-text-muted/15"></div>
                </div>
              </div>
              {/* Hero-Block */}
              <div className="p-4 text-center">
                <div className="h-3 rounded-full bg-text-muted/30 w-2/3 mx-auto mb-2"></div>
                <div className="h-2 rounded-full bg-text-muted/15 w-1/2 mx-auto mb-4"></div>
                <div className="h-7 w-24 rounded-lg bg-primary/40 mx-auto"></div>
              </div>
              {/* Content-Karten */}
              <div className="grid grid-cols-3 gap-3 px-4 pb-4">
                {[0, 1, 2].map((i) => (
                  <div key={i} className="h-14 sm:h-16 rounded-lg bg-surface-elevated/60 p-2">
                    <div className="h-2 rounded-full bg-text-muted/25 w-3/4 mb-1.5"></div>
                    <div className="h-2 rounded-full bg-text-muted/15 w-1/2"></div>
                  </div>
                ))}
              </div>

              {/* Performance-Badge */}
              {perf > 0 && (
                <div className="absolute bottom-3 right-3 flex items-center gap-2 px-3 py-1.5 rounded-full bg-bg/80 border border-primary/30">
                  <svg className="w-3.5 h-3.5 text-primary" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M13 2L3 14h7l-1 8 10-12h-7l1-8z" />
                  </svg>
                  <span className="text-[10px] font-mono text-text-muted">{t.perfLabel}</span>
                  <span key={perf} className="text-xs font-mono font-bold text-primary" style={{ animation: !reduced ? 'rankTick 300ms ease-out' : 'none' }}>
                    {t.perfValues[perf - 1]}
                  </span>
                </div>
              )}
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

export default WebDevCodeMorph;
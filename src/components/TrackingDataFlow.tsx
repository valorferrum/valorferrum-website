import { useState, useEffect } from 'react';
import type { CSSProperties } from 'react';

const EASE = 'cubic-bezier(0.16, 1, 0.3, 1)';

// --- i18n Strings (Keywords laut Briefing §7.2: "web tracking", "website tracking check", "tag manager conversion tracking") ---
const STRINGS = {
  de: {
    dashboardLabel: 'Live-Dashboard',
    usersLabel: 'Aktive Nutzer',
    eventsLabel: 'Events',
    chipUser: '+1 Nutzer',
    chipEvent: '+1 Event',
    tagline: <>Entscheidungen aus <span className="text-primary font-medium">Daten</span>, nicht aus Bauchgefühl.</>,
    heroH1Main: 'Tracking Freelancer',
    heroH1Sub: 'Web Tracking, das Entscheidungen liefert',
    heroH2: 'GA4, Tag Manager & Conversion-Tracking – DSGVO-konform.',
    heroIntro: 'Vom Website Tracking Check bis zum Server-Side-Setup: Ich baue die Infrastruktur für datengetriebene Entscheidungen. Für KMU, Startups und NGOs.',
    ctaPrimary: 'Website Tracking Check',
    ctaSecondary: 'Tracking-Kosten ansehen',
    noscriptH1: 'Tracking Freelancer – Web Tracking, das Entscheidungen liefert',
    noscriptP: 'GA4, Google Tag Manager & Conversion-Tracking – DSGVO-konform und datengetrieben. Für KMU, Startups und NGOs.',
    scroll: 'Scroll',
  },
  en: {
    dashboardLabel: 'Live Dashboard',
    usersLabel: 'Active Users',
    eventsLabel: 'Events',
    chipUser: '+1 user',
    chipEvent: '+1 event',
    tagline: <>Decisions from <span className="text-primary font-medium">data</span>, not gut feeling.</>,
    heroH1Main: 'Tracking Freelancer',
    heroH1Sub: 'Web tracking that drives decisions',
    heroH2: 'GA4, Tag Manager & conversion tracking – GDPR-compliant.',
    heroIntro: 'From website tracking checks to server-side setups: I build the infrastructure for data-driven decisions. For SMEs, startups and NGOs.',
    ctaPrimary: 'Website Tracking Check',
    ctaSecondary: 'View Tracking Costs',
    noscriptH1: 'Tracking Freelancer – Web Tracking That Drives Decisions',
    noscriptP: 'GA4, Google Tag Manager & conversion tracking – GDPR-compliant and data-driven. For SMEs, startups and NGOs.',
    scroll: 'Scroll',
  },
};

interface Props {
  lang?: 'de' | 'en';
}

// Maus-Wegpunkte (in % des Mini-Website-Containers) – bei Bedarf fein justieren
const WAYPOINTS = [
  { x: '12%', y: '82%' },  // Start
  { x: '22%', y: '56%' },  // CTA-Button (Conversion)
  { x: '66%', y: '70%' },  // Zweites Element (Engagement)
];

const TrackingDataFlow = ({ lang = 'de' }: Props) => {
  const t = STRINGS[lang];
  const [frameIn, setFrameIn] = useState(false);
  const [cursorIn, setCursorIn] = useState(false);
  const [pos, setPos] = useState(0);
  const [clicks, setClicks] = useState(0);
  const [settled, setSettled] = useState(false);
  const [zoom, setZoom] = useState(false);
  const [reduced, setReduced] = useState(false);

  const users = clicks >= 1 ? 1 : 0;

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setReduced(true);
      setClicks(2);
      setSettled(true);
      setZoom(true);
      return;
    }
    let timers: number[] = [];
    const raf = requestAnimationFrame(() => {
      timers = [
        window.setTimeout(() => setFrameIn(true), 400),    // Frame + Mini-Website
        window.setTimeout(() => setCursorIn(true), 900),   // Mauszeiger erscheint
        window.setTimeout(() => setPos(1), 1300),          // gleitet zum CTA
        window.setTimeout(() => setClicks(1), 2100),       // Klick 1 → +1 Nutzer + Event
        window.setTimeout(() => setPos(2), 2700),          // gleitet zum 2. Element
        window.setTimeout(() => setClicks(2), 3500),       // Klick 2 → +1 Event
        window.setTimeout(() => setSettled(true), 4300),   // Dashboard rastet ein
        window.setTimeout(() => setZoom(true), 5700),      // Zoom in echten Hero
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

  // Inhalt (Mini-Website + Dashboard): fadet beim Zoom nach unten weg
  const innerStyle: CSSProperties = {
    opacity: frameIn && !zoom ? 1 : 0,
    transform: zoom ? 'translateY(44px)' : 'translateY(0)',
    transition: `opacity 700ms ease, transform 700ms ease`,
  };

  // Mauszeiger: gleitet zwischen den Wegpunkten
  const cursorStyle: CSSProperties = {
    opacity: cursorIn && !zoom ? 1 : 0,
    left: WAYPOINTS[pos].x,
    top: WAYPOINTS[pos].y,
    transition: `left 700ms ${EASE}, top 700ms ${EASE}, opacity 500ms ease`,
  };

  // Dashboard: rastet bei settled ein
  const dashStyle: CSSProperties = {
    ...innerStyle,
    animation: settled && !reduced && !zoom ? 'einrast 500ms ease-out 1' : 'none',
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

      {/* ===== EBENE 1: Echter Tracking-Hero ===== */}
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

      {/* ===== EBENE 2: Mini-Website + Live-Dashboard ===== */}
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
          <div className="flex gap-4" style={innerStyle}>

            {/* ===== Mini-Website (links) ===== */}
            <div className="relative flex-1 min-w-0 rounded-xl bg-bg/40 border border-border/40 overflow-hidden">
              {/* Navbar */}
              <div className="h-8 border-b border-border/40 flex items-center gap-2 px-3">
                <div className="w-10 h-2 rounded-full bg-text-muted/25"></div>
                <div className="ml-auto flex gap-2">
                  <div className="w-6 h-2 rounded-full bg-text-muted/15"></div>
                  <div className="w-6 h-2 rounded-full bg-text-muted/15"></div>
                  <div className="w-6 h-2 rounded-full bg-text-muted/15"></div>
                </div>
              </div>
              {/* Hero-Block mit CTA (Klick-Ziel 1) */}
              <div className="p-4">
                <div className="h-3 rounded-full bg-text-muted/25 w-3/4 mb-2"></div>
                <div className="h-2 rounded-full bg-text-muted/15 w-1/2 mb-4"></div>
                <div className="h-7 w-28 rounded-lg bg-primary/25"></div>
              </div>
              {/* Content-Zeile (Klick-Ziel 2 rechts) */}
              <div className="grid grid-cols-2 gap-3 p-4 pt-0">
                <div className="space-y-2">
                  <div className="h-2 rounded-full bg-text-muted/15 w-full"></div>
                  <div className="h-2 rounded-full bg-text-muted/15 w-5/6"></div>
                  <div className="h-2 rounded-full bg-text-muted/15 w-4/6"></div>
                </div>
                <div className="space-y-2">
                  <div className="h-10 rounded-lg bg-surface-elevated/60"></div>
                  <div className="h-2 rounded-full bg-text-muted/15 w-3/4"></div>
                </div>
              </div>

              {/* Klick-Ripples + Chips an den Wegpunkten */}
              {clicks >= 1 && !zoom && (
                <div className="absolute pointer-events-none" style={{ left: WAYPOINTS[1].x, top: WAYPOINTS[1].y }}>
                  <span className="absolute -left-3 -top-3 w-6 h-6 rounded-full border-2 border-primary/60" style={{ animation: reduced ? 'none' : 'clickRipple 600ms ease-out 1' }}></span>
                  <span className="absolute left-3 -top-5 text-[10px] font-mono font-bold text-primary whitespace-nowrap" style={{ animation: reduced ? 'none' : 'chipDrift 1200ms ease-out 1 both' }}>{t.chipUser}</span>
                </div>
              )}
              {clicks >= 2 && !zoom && (
                <div className="absolute pointer-events-none" style={{ left: WAYPOINTS[2].x, top: WAYPOINTS[2].y }}>
                  <span className="absolute -left-3 -top-3 w-6 h-6 rounded-full border-2 border-primary/60" style={{ animation: reduced ? 'none' : 'clickRipple 600ms ease-out 1' }}></span>
                  <span className="absolute left-3 -top-5 text-[10px] font-mono font-bold text-primary whitespace-nowrap" style={{ animation: reduced ? 'none' : 'chipDrift 1200ms ease-out 1 both' }}>{t.chipEvent}</span>
                </div>
              )}

              {/* Mauszeiger */}
              <div className="absolute z-10 pointer-events-none" style={cursorStyle}>
                <svg className="w-5 h-5 text-text-primary drop-shadow-lg" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M6 3l12 10h-6l3.5 6.5-2.5 1.5L9.5 14 6 17V3z" />
                </svg>
              </div>
            </div>

            {/* ===== Live-Dashboard (rechts) ===== */}
            <div className="hidden sm:block w-32 shrink-0">
              <div className="h-full p-3 rounded-xl bg-surface/50 border border-border/40 flex flex-col" style={dashStyle}>
                <div className="flex items-center gap-1.5 mb-3">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse"></span>
                  <span className="text-[9px] uppercase tracking-widest text-text-muted font-mono">{t.dashboardLabel}</span>
                </div>

                <div className="mb-3">
                  <div className="text-[10px] text-text-muted mb-0.5">{t.usersLabel}</div>
                  <div key={`u${users}`} className="text-xl font-display font-bold text-primary" style={{ animation: !reduced && users > 0 ? 'rankTick 300ms ease-out' : 'none' }}>{users}</div>
                </div>

                <div className="mb-4">
                  <div className="text-[10px] text-text-muted mb-0.5">{t.eventsLabel}</div>
                  <div key={`e${clicks}`} className="text-xl font-display font-bold text-primary" style={{ animation: !reduced && clicks > 0 ? 'rankTick 300ms ease-out' : 'none' }}>{clicks}</div>
                </div>

                {/* Balken wachsen mit den Events */}
                <div className="mt-auto flex items-end gap-1.5 h-16">
                  <div className="flex-1 rounded-t bg-primary/30 transition-all duration-700" style={{ height: clicks >= 1 ? '55%' : '15%' }}></div>
                  <div className="flex-1 rounded-t bg-primary/45 transition-all duration-700" style={{ height: clicks >= 2 ? '75%' : '15%' }}></div>
                  <div className="flex-1 rounded-t bg-primary/60 transition-all duration-700" style={{ height: settled ? '95%' : '15%' }}></div>
                </div>
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

export default TrackingDataFlow;
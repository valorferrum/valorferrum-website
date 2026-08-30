import React, { useState, useEffect } from 'react';

const HeroAssembler = () => {
  const [assembled, setAssembled] = useState(false);

  useEffect(() => {
    // Starte die Animation nach 1 Sekunde
    const timer = setTimeout(() => setAssembled(true), 1000);
    return () => clearTimeout(timer);
  }, []);

  const elements = [
    { id: 1, text: 'SEO', x: '-translate-x-20', y: '-translate-y-10' },
    { id: 2, text: 'SEA', x: 'translate-x-24', y: '-translate-y-16' },
    { id: 3, text: 'Code', x: '-translate-x-16', y: 'translate-y-20' },
    { id: 4, text: 'Data', x: 'translate-x-20', y: 'translate-y-12' },
  ];

  return (
    <div className="relative h-[500px] w-full flex items-center justify-center overflow-hidden">
      {/* Finale Ansicht */}
      <div 
        className={`text-center transition-all duration-1000 ease-out ${
          assembled ? 'opacity-100 scale-100 blur-0' : 'opacity-0 scale-90 blur-sm absolute'
        }`}
      >
        <h1 className="font-display font-bold text-text-primary leading-[1.05] mb-6">
          <span className="block text-4xl sm:text-5xl md:text-6xl lg:text-7xl">Valorferrum</span>
          <span className="block text-xl sm:text-2xl md:text-3xl lg:text-4xl text-text-secondary font-normal mt-3 md:mt-4">
            Freelancer für digitale Sichtbarkeit
          </span>
        </h1>
        <h2 className="text-lg md:text-xl lg:text-2xl text-primary font-display font-medium max-w-2xl mb-8 md:mb-10 mx-auto">
          Digitale Sichtbarkeit, die bleibt. Performance, die besteht.
        </h2>
        <p className="text-base md:text-lg text-text-secondary max-w-2xl mb-10 leading-relaxed mx-auto">
          SEO, SEA, Webentwicklung und Tracking – aus einer Hand und ohne Agentur-Overhead.
          Für KMU, Startups und NGOs, die bei Google gefunden werden wollen.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <a href="/de/kontakt" className="px-8 py-4 bg-primary hover:bg-primary-light text-white font-semibold rounded-lg transition-all shadow-lg shadow-primary/25">
            Kostenlos anfragen
          </a>
          <a href="/de/leistungen" className="px-8 py-4 border border-primary/30 hover:border-primary text-primary rounded-lg transition-all hover:bg-primary/5">
            Leistungen entdecken
          </a>
        </div>
      </div>

      {/* Schwebende Elemente */}
      {!assembled && elements.map((el) => (
        <div
          key={el.id}
          className={`absolute font-mono text-2xl font-bold text-spectrum-purple/50 animate-float ${el.x} ${el.y}`}
          style={{ animationDelay: `${el.id * 200}ms` }}
        >
          {el.text}
        </div>
      ))}
    </div>
  );
};

export default HeroAssembler;
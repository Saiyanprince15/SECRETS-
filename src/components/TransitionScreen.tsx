import React, { useEffect, useState } from 'react';

interface TransitionScreenProps {
  chosenAction?: string;
  onFinishTransition?: () => void;
  autoProgress?: boolean;
}

export const TransitionScreen: React.FC<TransitionScreenProps> = ({
  chosenAction,
  onFinishTransition,
  autoProgress = true,
}) => {
  const [particles, setParticles] = useState<Array<{ id: number; size: number; left: number; delay: number; duration: number }>>([]);

  useEffect(() => {
    // Generate 25 floating stardust particles
    const generated = Array.from({ length: 25 }).map((_, i) => ({
      id: i,
      size: Math.random() * 4 + 1.5,
      left: Math.random() * 100,
      delay: Math.random() * 5,
      duration: Math.random() * 10 + 12,
    }));
    setParticles(generated);

    if (autoProgress && onFinishTransition) {
      const timer = setTimeout(() => {
        onFinishTransition();
      }, 3200);
      return () => clearTimeout(timer);
    }
  }, [autoProgress, onFinishTransition]);

  return (
    <div className="fixed inset-0 z-50 min-h-screen w-full flex items-center justify-center bg-[#131313] overflow-hidden m-0 p-0">
      {/* Deep Texture Layer */}
      <div 
        className="absolute inset-0 opacity-40 mix-blend-overlay bg-cover bg-center pointer-events-none"
        style={{
          backgroundImage: `url('https://lh3.googleusercontent.com/aida-public/AB6AXuDH0icTjOYupDwoq_D48mFwwidHhftA9md-zrXY6alr8vLjcEYbIXRbIcBIw4_Ddz6ohWAo9FVgEJozYlWVDg3mvNos40Iz8MCY07gC0tL_jPQf5M8OGYlvtmtepGlFnWz-MK-6jrjsWVJqI3PgK1bzjnddfS6EprV2ViSXyj6VOjKH1DxPk_fTe4W8XW7wysttG-vSsO2uQC_3Rre3hBgHU5_16iFFjC5ehCyr5vQ7cfdGN0WR6qR5')`
        }}
      />

      {/* Ambient Pulsing Glow */}
      <div className="ambient-bg absolute inset-0 w-[150%] h-[150%] -left-[25%] -top-[25%] blur-3xl z-10 pointer-events-none" />

      {/* Floating Particles */}
      <div className="absolute inset-0 z-20 overflow-hidden pointer-events-none">
        {particles.map((p) => (
          <div
            key={p.id}
            className="particle"
            style={{
              width: `${p.size}px`,
              height: `${p.size}px`,
              left: `${p.left}vw`,
              animationDelay: `${p.delay}s`,
              animationDuration: `${p.duration}s`,
            }}
          />
        ))}
      </div>

      {/* Main Content Canvas */}
      <main className="relative z-30 flex flex-col items-center justify-center h-screen w-full px-6 md:px-20 text-center">
        <h1 className="font-serif text-3xl sm:text-5xl md:text-7xl lg:text-8xl text-[#e9c176] pulse-text tracking-widest max-w-5xl mx-auto leading-tight">
          Another Secret Reveals Itself...
        </h1>
        {chosenAction && (
          <p className="mt-8 text-xs uppercase tracking-[0.3em] text-[#d1c5b4]/60 font-semibold max-w-md animate-pulse">
            Resonating with: "{chosenAction}"
          </p>
        )}
      </main>
    </div>
  );
};

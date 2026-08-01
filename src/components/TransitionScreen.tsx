import React, { useEffect, useState } from 'react';

interface TransitionScreenProps {
  chosenAction?: string;
  onFinishTransition?: () => void;
  /** When false, the screen never self-dismisses — the caller controls it. */
  autoProgress?: boolean;
  /** True while a network request is in flight, so we can reassure the user. */
  waiting?: boolean;
}

export const TransitionScreen: React.FC<TransitionScreenProps> = ({
  chosenAction,
  onFinishTransition,
  autoProgress = true,
  waiting = false,
}) => {
  const [particles, setParticles] = useState<
    Array<{ id: number; size: number; left: number; delay: number; duration: number }>
  >([]);
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    const generated = Array.from({ length: 25 }).map((_, i) => ({
      id: i,
      size: Math.random() * 4 + 1.5,
      left: Math.random() * 100,
      delay: Math.random() * 5,
      duration: Math.random() * 10 + 12,
    }));
    setParticles(generated);
  }, []);

  useEffect(() => {
    if (!autoProgress || !onFinishTransition) return;
    const timer = setTimeout(onFinishTransition, 3200);
    return () => clearTimeout(timer);
  }, [autoProgress, onFinishTransition]);

  // Track how long we've been waiting so long generations don't feel frozen.
  useEffect(() => {
    if (!waiting) return;
    const interval = setInterval(() => setElapsed((s) => s + 1), 1000);
    return () => clearInterval(interval);
  }, [waiting]);

  return (
    <div className="fixed inset-0 z-50 min-h-screen w-full flex items-center justify-center bg-[#131313] overflow-hidden m-0 p-0">
      {/* Deep texture layer */}
      <div
        className="absolute inset-0 opacity-30 mix-blend-overlay bg-cover bg-center pointer-events-none"
        style={{
          backgroundImage:
            "url('https://images.unsplash.com/photo-1462331940025-496dfbfc7564?q=80&w=2400&auto=format&fit=crop')",
        }}
      />

      <div className="ambient-bg absolute inset-0 w-[150%] h-[150%] -left-[25%] -top-[25%] blur-3xl z-10 pointer-events-none" />

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

      <main className="relative z-30 flex flex-col items-center justify-center h-screen w-full px-6 md:px-20 text-center">
        <h1 className="font-serif text-3xl sm:text-5xl md:text-7xl lg:text-8xl text-[#e9c176] pulse-text tracking-widest max-w-5xl mx-auto leading-tight">
          Another Secret Reveals Itself...
        </h1>

        {chosenAction && (
          <p className="mt-8 text-xs uppercase tracking-[0.3em] text-[#d1c5b4]/60 font-semibold max-w-md animate-pulse">
            Resonating with: "{chosenAction}"
          </p>
        )}

        {waiting && (
          <div className="mt-12 flex flex-col items-center gap-4">
            <div className="flex items-center gap-2">
              {[0, 1, 2].map((i) => (
                <span
                  key={i}
                  className="w-1.5 h-1.5 rounded-full bg-[#e9c176]"
                  style={{
                    animation: 'sparkle-twinkle 1.4s ease-in-out infinite',
                    animationDelay: `${i * 0.2}s`,
                  }}
                />
              ))}
            </div>
            <p className="text-[10px] uppercase tracking-[0.25em] text-[#d1c5b4]/40">
              {elapsed < 6
                ? 'Composing the revelation'
                : elapsed < 14
                ? 'Painting the fragment'
                : 'Still rendering — artwork takes a moment'}
            </p>
          </div>
        )}
      </main>
    </div>
  );
};

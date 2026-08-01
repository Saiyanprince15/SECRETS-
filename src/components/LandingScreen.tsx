import React, { useEffect, useState } from 'react';
import { FallingPetals } from './FallingPetals';

interface LandingScreenProps {
  onBegin: () => void;
  onLoginClick: () => void;
}

export const LandingScreen: React.FC<LandingScreenProps> = ({
  onBegin,
  onLoginClick,
}) => {
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const timeout = setTimeout(() => setLoaded(true), 100);
    return () => clearTimeout(timeout);
  }, []);

  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden bg-white">
      {/* Background */}
      <div className="absolute inset-0 z-0 bg-white">
        <div
          className="absolute inset-0"
          style={{
            background:
              'radial-gradient(ellipse 75% 55% at 50% 45%, #ffffff 0%, #ffffff 55%, rgba(0,0,0,0.05) 100%)',
          }}
        />
      </div>

      {/* Drifting specks */}
      <div className="absolute inset-0 z-[1]">
        {Array.from({ length: 30 }).map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full"
            style={{
              width: `${1 + Math.random() * 2.5}px`,
              height: `${1 + Math.random() * 2.5}px`,
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 80}%`,
              background: `radial-gradient(circle, rgba(0,0,0,${
                0.25 + Math.random() * 0.35
              }) 0%, transparent 70%)`,
              animation: `sparkle-twinkle ${2 + Math.random() * 4}s ease-in-out ${
                Math.random() * 3
              }s infinite alternate`,
            }}
          />
        ))}
      </div>

      {/* Petals, in ink */}
      <FallingPetals petalCount={55} tone="ink" />

      {/* Foreground */}
      <div className="relative z-10 flex flex-col items-center text-center px-6">
        {/* Title lockup — the wordmark and tagline are part of the artwork */}
        <img
          src="/landing-title.png"
          alt="Secrets — A Never Ending Art"
          className={`w-[min(78vw,620px)] h-auto select-none transition-all duration-[2000ms] ease-out ${
            loaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}
          draggable={false}
        />

        {/* Ornamental divider */}
        <div
          className={`flex items-center gap-3 mt-8 transition-all duration-[1800ms] delay-300 ease-out ${
            loaded
              ? 'opacity-100 translate-y-0 scale-100'
              : 'opacity-0 translate-y-4 scale-75'
          }`}
        >
          <div
            className="h-px w-16 md:w-24"
            style={{ background: 'linear-gradient(to right, transparent, #111)' }}
          />
          <span
            className="text-xl md:text-2xl text-black"
            style={{ animation: 'star-pulse-ink 3s ease-in-out infinite' }}
          >
            ✦
          </span>
          <div
            className="h-px w-16 md:w-24"
            style={{ background: 'linear-gradient(to left, transparent, #111)' }}
          />
        </div>

        {/* CTA Buttons */}
        <div
          className={`flex flex-col items-center gap-5 mt-14 transition-all duration-[2000ms] delay-[1000ms] ease-out ${
            loaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}
        >
          <button
            onClick={onBegin}
            className="group relative px-12 py-4 cursor-pointer overflow-hidden rounded-sm border border-black/60 bg-transparent transition-all duration-500 hover:bg-black hover:scale-[1.03]"
          >
            <span className="relative z-10 font-light text-xs md:text-sm uppercase tracking-[0.4em] text-black transition-colors duration-500 group-hover:text-white">
              Begin Exploring
            </span>
            <div
              className="absolute top-0 left-[-100%] w-[60%] h-full skew-x-[-20deg] group-hover:left-[140%] transition-all duration-[1200ms] ease-out pointer-events-none"
              style={{
                background:
                  'linear-gradient(90deg, transparent, rgba(0,0,0,0.07), transparent)',
              }}
            />
          </button>

          <button
            onClick={onLoginClick}
            className="text-[10px] md:text-xs uppercase tracking-[0.25em] cursor-pointer pb-1 text-black/45 border-b border-transparent transition-all duration-500 hover:tracking-[0.35em] hover:text-black hover:border-black/40"
          >
            Already have a key? Login
          </button>
        </div>
      </div>

      {/* Bottom fade */}
      <div
        className="absolute bottom-0 left-0 w-full h-32 z-[3] pointer-events-none"
        style={{
          background:
            'linear-gradient(to top, rgba(255,255,255,0.9) 0%, transparent 100%)',
        }}
      />
    </div>
  );
};

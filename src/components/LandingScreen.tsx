import React, { useEffect, useState } from 'react';
import { FallingPetals } from './FallingPetals';

interface LandingScreenProps {
  onBegin: () => void;
  onLoginClick: () => void;
}

export const LandingScreen: React.FC<LandingScreenProps> = ({ onBegin, onLoginClick }) => {
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    // Trigger entrance animations after mount
    const timeout = setTimeout(() => setLoaded(true), 100);
    return () => clearTimeout(timeout);
  }, []);

  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden">
      {/* ═══════════════ Background Layer ═══════════════ */}
      {/* Base gradient that mimics the dark sky + warm cloud glow */}
      <div className="absolute inset-0 z-0">
        {/* Background image with overlay */}
        <div
          className="absolute inset-0 animate-slow-pan"
          style={{
            backgroundImage: 'url(/landing-bg.png)',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        />
        {/* Gradient overlays for depth */}
        <div
          className="absolute inset-0"
          style={{
            background: `
              radial-gradient(ellipse 80% 50% at 50% 45%, transparent 0%, rgba(10,5,15,0.6) 70%),
              linear-gradient(180deg, rgba(15,5,25,0.3) 0%, transparent 30%, transparent 70%, rgba(15,5,25,0.5) 100%)
            `,
          }}
        />
        {/* Warm magenta glow from bottom-left and bottom-right (clouds) */}
        <div
          className="absolute bottom-0 left-0 w-full h-[60%]"
          style={{
            background: 'radial-gradient(ellipse 100% 80% at 50% 100%, rgba(120,20,60,0.15) 0%, transparent 70%)',
          }}
        />
      </div>

      {/* ═══════════════ Sparkles / Stars Layer ═══════════════ */}
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
              background: `radial-gradient(circle, rgba(233,193,118,${0.5 + Math.random() * 0.5}) 0%, transparent 70%)`,
              boxShadow: `0 0 ${4 + Math.random() * 8}px rgba(233,193,118,${0.3 + Math.random() * 0.4})`,
              animation: `sparkle-twinkle ${2 + Math.random() * 4}s ease-in-out ${Math.random() * 3}s infinite alternate`,
            }}
          />
        ))}
      </div>

      {/* ═══════════════ Rose Petals Animation ═══════════════ */}
      <FallingPetals petalCount={55} />

      {/* ═══════════════ Foreground Content ═══════════════ */}
      <div className="relative z-10 flex flex-col items-center text-center px-4">
        {/* Main Title — "SECRETS" */}
        <h1
          className={`transition-all duration-[2000ms] ease-out ${loaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
          style={{
            fontFamily: "'Cormorant Garamond', serif",
            fontSize: 'clamp(3.5rem, 12vw, 9rem)',
            fontWeight: 300,
            fontStyle: 'italic',
            letterSpacing: '0.15em',
            color: 'transparent',
            backgroundImage: 'linear-gradient(135deg, #c5a059 0%, #e6c875 25%, #f5e4b0 45%, #e6c875 55%, #c5a059 75%, #a8803a 100%)',
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            textShadow: 'none',
            filter: 'drop-shadow(0 0 30px rgba(233,193,118,0.35)) drop-shadow(0 0 60px rgba(197,160,89,0.15))',
            lineHeight: 1.1,
          }}
        >
          Secrets
        </h1>

        {/* ✦ Ornamental Divider with Star ✦ */}
        <div
          className={`flex items-center gap-3 mt-2 mb-3 transition-all duration-[1800ms] delay-300 ease-out ${loaded ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-4 scale-75'}`}
        >
          <div className="h-px w-16 md:w-24" style={{ background: 'linear-gradient(to right, transparent, #c5a059)' }} />
          <span
            className="text-xl md:text-2xl"
            style={{
              color: '#e6c875',
              filter: 'drop-shadow(0 0 8px rgba(233,193,118,0.6))',
              animation: 'star-pulse 3s ease-in-out infinite',
            }}
          >
            ✦
          </span>
          <div className="h-px w-16 md:w-24" style={{ background: 'linear-gradient(to left, transparent, #c5a059)' }} />
        </div>

        {/* Subtitle — "A Never Ending Art" */}
        <p
          className={`transition-all duration-[1800ms] delay-500 ease-out ${loaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}
          style={{
            fontFamily: "'Cormorant Garamond', serif",
            fontSize: 'clamp(0.9rem, 2.5vw, 1.5rem)',
            fontWeight: 400,
            letterSpacing: '0.35em',
            color: '#d4b896',
            textShadow: '0 0 20px rgba(233,193,118,0.2)',
          }}
        >
          A Never Ending Art
        </p>

        {/* Bottom ornamental star */}
        <div
          className={`mt-3 transition-all duration-[1800ms] delay-700 ease-out ${loaded ? 'opacity-100 scale-100' : 'opacity-0 scale-50'}`}
        >
          <span
            className="text-lg"
            style={{
              color: '#e6c875',
              filter: 'drop-shadow(0 0 6px rgba(233,193,118,0.5))',
              animation: 'star-pulse 3s ease-in-out 1.5s infinite',
            }}
          >
            ✦
          </span>
        </div>

        {/* ═══════════════ CTA Buttons ═══════════════ */}
        <div
          className={`flex flex-col items-center gap-5 mt-14 transition-all duration-[2000ms] delay-[1000ms] ease-out ${loaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
        >
          <button
            onClick={onBegin}
            className="group relative px-12 py-4 cursor-pointer overflow-hidden rounded-sm transition-all duration-700 hover:scale-105"
            style={{
              border: '1px solid rgba(197,160,89,0.4)',
              background: 'rgba(197,160,89,0.08)',
              backdropFilter: 'blur(6px)',
            }}
          >
            {/* Hover glow */}
            <div
              className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700"
              style={{
                background: 'radial-gradient(ellipse at center, rgba(197,160,89,0.15) 0%, transparent 70%)',
              }}
            />
            <span
              className="relative z-10 font-light text-xs md:text-sm uppercase tracking-[0.4em]"
              style={{
                fontFamily: "'Cormorant Garamond', serif",
                color: '#e6c875',
                textShadow: '0 0 10px rgba(233,193,118,0.2)',
              }}
            >
              Begin Exploring
            </span>
            {/* Shimmer effect */}
            <div
              className="absolute top-0 left-[-100%] w-[60%] h-full skew-x-[-20deg] group-hover:left-[140%] transition-all duration-[1200ms] ease-out"
              style={{
                background: 'linear-gradient(90deg, transparent, rgba(233,193,118,0.1), transparent)',
              }}
            />
          </button>

          <button
            onClick={onLoginClick}
            className="text-[10px] md:text-xs uppercase tracking-[0.25em] cursor-pointer pb-1 transition-all duration-500 hover:tracking-[0.35em]"
            style={{
              fontFamily: "'Cormorant Garamond', serif",
              color: 'rgba(212,184,150,0.5)',
              borderBottom: '1px solid transparent',
            }}
            onMouseEnter={(e) => {
              (e.target as HTMLElement).style.color = '#e6c875';
              (e.target as HTMLElement).style.borderBottomColor = 'rgba(197,160,89,0.3)';
            }}
            onMouseLeave={(e) => {
              (e.target as HTMLElement).style.color = 'rgba(212,184,150,0.5)';
              (e.target as HTMLElement).style.borderBottomColor = 'transparent';
            }}
          >
            Already have a key? Login
          </button>
        </div>
      </div>

      {/* ═══════════════ Bottom Vignette ═══════════════ */}
      <div
        className="absolute bottom-0 left-0 w-full h-32 z-[3] pointer-events-none"
        style={{
          background: 'linear-gradient(to top, rgba(13,13,13,0.8) 0%, transparent 100%)',
        }}
      />
    </div>
  );
};

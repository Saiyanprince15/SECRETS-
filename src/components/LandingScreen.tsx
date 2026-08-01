import React from 'react';
import { FallingPetals } from './FallingPetals';

interface LandingScreenProps {
  onBegin: () => void;
  onLoginClick: () => void;
}

export const LandingScreen: React.FC<LandingScreenProps> = ({ onBegin, onLoginClick }) => {
  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden bg-gradient-to-b from-[#1a0510] via-[#0D0D0D] to-[#0D0D0D]">
      {/* Background Petals Animation */}
      <FallingPetals petalCount={60} />
      
      {/* Dramatic glow behind text */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80vw] h-[80vw] md:w-[40vw] md:h-[40vw] bg-[#ff1493]/10 blur-[120px] rounded-full pointer-events-none" />
      
      <div className="relative z-10 flex flex-col items-center text-center fade-in-rise">
        <h1 className="font-serif text-6xl md:text-8xl lg:text-9xl text-[#FF4E00] tracking-widest uppercase mb-4" style={{ textShadow: '0 0 40px rgba(255, 78, 0, 0.4)' }}>
          Secrets
        </h1>
        <div className="flex items-center gap-4 mb-16">
          <div className="h-px w-12 bg-white/30" />
          <p className="font-sans text-sm md:text-base uppercase tracking-[0.4em] font-light text-[#E0D8D0]">
            A Never Ending Art
          </p>
          <div className="h-px w-12 bg-white/30" />
        </div>

        <div className="flex flex-col items-center gap-6">
          <button
            onClick={onBegin}
            className="px-10 py-4 bg-[#FF4E00] text-black font-semibold text-xs md:text-sm uppercase tracking-widest hover:bg-[#ff6d2b] transition-all duration-500 cursor-pointer rounded-sm hover:scale-105 hover:shadow-[0_0_30px_rgba(255,78,0,0.4)]"
          >
            Begin Exploring
          </button>
          
          <button
            onClick={onLoginClick}
            className="text-[10px] md:text-xs uppercase tracking-[0.2em] text-[#E0D8D0]/60 hover:text-white transition-colors cursor-pointer pb-1 border-b border-transparent hover:border-white/30"
          >
            Already have a key? Login
          </button>
        </div>
      </div>
    </div>
  );
};

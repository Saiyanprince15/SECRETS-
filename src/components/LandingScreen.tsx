import React, { useEffect, useState } from 'react';
import { FallingPetals } from './FallingPetals';
import { audioEngine } from '../lib/audioEngine';

interface LandingScreenProps {
  onBegin: () => void;
  onLoginClick: () => void;
}

const PLATE = '#D9D9D9';

export const LandingScreen: React.FC<LandingScreenProps> = ({
  onBegin,
  onLoginClick,
}) => {
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const timeout = setTimeout(() => setLoaded(true), 100);
    return () => clearTimeout(timeout);
  }, []);

  /**
   * Browsers block AudioContext until the first user gesture (click/tap/key).
   * We attach a one-shot listener to the whole page so the soundscape kicks in
   * the instant the user interacts — before they even reach "Begin Exploring".
   */
  useEffect(() => {
    const startAudio = () => {
      if (!audioEngine.getIsPlaying()) {
        audioEngine.play();
      }
      window.removeEventListener('click', startAudio);
      window.removeEventListener('touchstart', startAudio);
      window.removeEventListener('keydown', startAudio);
    };

    window.addEventListener('click', startAudio, { once: true });
    window.addEventListener('touchstart', startAudio, { once: true });
    window.addEventListener('keydown', startAudio, { once: true });

    return () => {
      window.removeEventListener('click', startAudio);
      window.removeEventListener('touchstart', startAudio);
      window.removeEventListener('keydown', startAudio);
    };
  }, []);

  return (
    <div
      className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden"
      style={{ backgroundColor: PLATE }}
    >
      <FallingPetals petalCount={55} tone="ink" />

      <div className="relative z-10 flex flex-col items-center text-center px-6">
        <img
          src="/Component_1.png"
          alt="Secrets"
          width={720}
          height={400}
          className={`w-[min(92vw,720px)] h-auto select-none transition-opacity duration-[2000ms] ease-out ${
            loaded ? 'opacity-100' : 'opacity-0'
          }`}
          draggable={false}
        />

        <div
          className={`flex flex-col items-center gap-5 -mt-4 transition-all duration-[2000ms] delay-[900ms] ease-out ${
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
    </div>
  );
};

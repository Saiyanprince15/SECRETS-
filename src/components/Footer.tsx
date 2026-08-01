import React from 'react';

interface FooterProps {
  currentSeason?: string;
}

export const Footer: React.FC<FooterProps> = ({ currentSeason = "Season of Roses" }) => {
  return (
    <footer className="w-full border-t border-white/5 bg-[#131313]/80 backdrop-blur-md py-8 px-6 md:px-20 flex flex-col md:flex-row justify-between items-center text-[12px] uppercase tracking-[0.2em] text-[#d1c5b4]/60 z-20">
      <div className="text-[#e9c176] mb-4 md:mb-0 text-center md:text-left">
        © 2024 Secrets Art Collective. Currently: {currentSeason}.
      </div>
      <ul className="flex items-center gap-6 md:gap-8">
        <li>
          <a
            href="#terms"
            onClick={(e) => e.preventDefault()}
            className="hover:text-[#e9c176] transition-colors"
          >
            Terms
          </a>
        </li>
        <li className="text-[#e9c176]/30">✦</li>
        <li>
          <a
            href="#privacy"
            onClick={(e) => e.preventDefault()}
            className="hover:text-[#e9c176] transition-colors"
          >
            Privacy
          </a>
        </li>
        <li className="text-[#e9c176]/30">✦</li>
        <li>
          <a
            href="#archive"
            onClick={(e) => e.preventDefault()}
            className="hover:text-[#e9c176] transition-colors"
          >
            Archive
          </a>
        </li>
      </ul>
    </footer>
  );
};

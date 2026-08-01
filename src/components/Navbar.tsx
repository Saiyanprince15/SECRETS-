import React, { useState } from 'react';
import { AppTab } from '../types';
import { AmbientSoundscapeControl } from './AmbientSoundscapeControl';
import { hapticTap, hapticToggle } from '../lib/haptics';

interface NavbarProps {
  currentTab: AppTab;
  onSelectTab: (tab: AppTab) => void;
  onOpenSearch?: () => void;
  onSignOut?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  onSelectTab,
  onOpenSearch,
  onSignOut,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  if (currentTab === 'auth') {
    return null;
  }

  return (
    <nav className="bg-transparent flex justify-between items-center w-full px-6 md:px-12 lg:px-20 py-4 md:py-6 z-50 fixed top-0 backdrop-blur-md bg-[#0D0D0D]/70 border-b border-white/10">
      <div className="flex items-center gap-6">
        <button
          onClick={() => { hapticTap(); onSelectTab('explore'); }}
          className="font-serif text-2xl md:text-3xl text-[#E0D8D0] tracking-[0.2em] uppercase text-left cursor-pointer hover:text-[#FF4E00] transition-colors"
        >
          Secrets
        </button>
        <span className="hidden lg:inline-block h-3 w-px bg-white/20" />
        <span className="hidden lg:inline-block text-[10px] uppercase tracking-[0.3em] font-medium text-[#ffffff66]">
          Editorial Archive
        </span>
      </div>

      <ul className="hidden md:flex gap-10 text-xs uppercase tracking-[0.25em] font-semibold text-[#a0a0a0]">
        {(['explore', 'seasons', 'profile'] as const).map((tab) => (
          <li key={tab}>
            <button
              onClick={() => { hapticTap(); onSelectTab(tab); }}
              className={`transition-all duration-300 pb-1 cursor-pointer block capitalize ${
                currentTab === tab
                  ? 'text-[#FF4E00] border-b-2 border-[#FF4E00] scale-105'
                  : 'text-[#E0D8D0]/70 hover:text-[#FF4E00]'
              }`}
            >
              {tab}
            </button>
          </li>
        ))}
      </ul>

      <div className="flex items-center space-x-3 sm:space-x-4">
        <AmbientSoundscapeControl />

        {onOpenSearch && (
          <button
            onClick={() => { hapticTap(); onOpenSearch(); }}
            aria-label="Search"
            className="text-[#a0a0a0] hover:text-[#FF4E00] transition-colors p-1 cursor-pointer"
          >
            <span className="material-symbols-outlined text-xl">search</span>
          </button>
        )}

        {onSignOut && (
          <button
            onClick={() => { hapticTap(); onSignOut(); }}
            className="hidden md:inline-block text-[10px] uppercase tracking-[0.25em] text-[#E0D8D0]/50 hover:text-[#FF4E00] transition-colors cursor-pointer border-b border-transparent hover:border-[#FF4E00]/40 pb-0.5"
          >
            Sign Out
          </button>
        )}

        <button
          onClick={() => { hapticToggle(); setMobileMenuOpen(!mobileMenuOpen); }}
          aria-label="Toggle Menu"
          className="text-[#E0D8D0] hover:text-[#FF4E00] transition-all p-1 cursor-pointer md:hidden"
        >
          <span className="material-symbols-outlined">
            {mobileMenuOpen ? 'close' : 'menu'}
          </span>
        </button>
      </div>

      {mobileMenuOpen && (
        <div className="absolute top-full left-0 w-full bg-[#131313]/95 backdrop-blur-xl border-b border-white/10 p-6 flex flex-col space-y-4 md:hidden z-50 animate-fadeInUp">
          {(['explore', 'seasons', 'profile'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => {
                hapticTap();
                onSelectTab(tab);
                setMobileMenuOpen(false);
              }}
              className={`text-left text-sm uppercase tracking-widest py-2 capitalize ${
                currentTab === tab ? 'text-[#e9c176]' : 'text-[#e5e2e1]/70'
              }`}
            >
              {tab}
            </button>
          ))}

          <button
            onClick={() => {
              hapticTap();
              setMobileMenuOpen(false);
              if (onSignOut) onSignOut();
              else onSelectTab('auth');
            }}
            className="text-left text-xs uppercase tracking-widest text-[#d1c5b4]/50 hover:text-[#e9c176] pt-4 border-t border-white/10"
          >
            {onSignOut ? 'Sign Out' : 'Enter With A Key'}
          </button>
        </div>
      )}
    </nav>
  );
};

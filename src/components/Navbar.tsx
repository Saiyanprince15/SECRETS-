import React, { useState } from 'react';
import { AppTab } from '../types';
import { AmbientSoundscapeControl } from './AmbientSoundscapeControl';

interface NavbarProps {
  currentTab: AppTab;
  onSelectTab: (tab: AppTab) => void;
  onOpenSearch?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentTab, onSelectTab, onOpenSearch }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  if (currentTab === 'auth') {
    return null; // Don't render top navbar on full auth screen
  }

  return (
    <nav className="bg-transparent flex justify-between items-center w-full px-6 md:px-12 lg:px-20 py-4 md:py-6 z-50 fixed top-0 backdrop-blur-md bg-[#0D0D0D]/70 border-b border-white/10">
      {/* Brand */}
      <div className="flex items-center gap-6">
        <button 
          onClick={() => onSelectTab('explore')}
          className="font-serif text-2xl md:text-3xl text-[#E0D8D0] tracking-[0.2em] uppercase text-left cursor-pointer hover:text-[#FF4E00] transition-colors"
        >
          Secrets
        </button>
        <span className="hidden lg:inline-block h-3 w-px bg-white/20" />
        <span className="hidden lg:inline-block text-[10px] uppercase tracking-[0.3em] font-medium text-[#ffffff66]">
          Editorial Archive
        </span>
      </div>

      {/* Navigation Links (Desktop) */}
      <ul className="hidden md:flex gap-10 text-xs uppercase tracking-[0.25em] font-semibold text-[#a0a0a0]">
        <li>
          <button
            onClick={() => onSelectTab('explore')}
            className={`transition-all duration-300 pb-1 cursor-pointer block ${
              currentTab === 'explore'
                ? 'text-[#FF4E00] border-b-2 border-[#FF4E00] scale-105'
                : 'text-[#E0D8D0]/70 hover:text-[#FF4E00]'
            }`}
          >
            Explore
          </button>
        </li>
        <li>
          <button
            onClick={() => onSelectTab('seasons')}
            className={`transition-all duration-300 pb-1 cursor-pointer block ${
              currentTab === 'seasons'
                ? 'text-[#FF4E00] border-b-2 border-[#FF4E00] scale-105'
                : 'text-[#E0D8D0]/70 hover:text-[#FF4E00]'
            }`}
          >
            Seasons
          </button>
        </li>
        <li>
          <button
            onClick={() => onSelectTab('profile')}
            className={`transition-all duration-300 pb-1 cursor-pointer block ${
              currentTab === 'profile'
                ? 'text-[#FF4E00] border-b-2 border-[#FF4E00] scale-105'
                : 'text-[#E0D8D0]/70 hover:text-[#FF4E00]'
            }`}
          >
            Profile
          </button>
        </li>
      </ul>

      {/* Trailing Actions: Soundscape Control & Search */}
      <div className="flex items-center space-x-3 sm:space-x-4">
        {/* Ambient Soundscape Controller */}
        <AmbientSoundscapeControl />

        {onOpenSearch && (
          <button 
            onClick={onOpenSearch}
            aria-label="Search"
            className="text-[#a0a0a0] hover:text-[#FF4E00] transition-colors p-1 cursor-pointer"
          >
            <span className="material-symbols-outlined text-xl">search</span>
          </button>
        )}
        
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Toggle Menu"
          className="text-[#E0D8D0] hover:text-[#FF4E00] transition-all p-1 cursor-pointer md:hidden"
        >
          <span className="material-symbols-outlined">
            {mobileMenuOpen ? 'close' : 'menu'}
          </span>
        </button>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="absolute top-full left-0 w-full bg-[#131313]/95 backdrop-blur-xl border-b border-white/10 p-6 flex flex-col space-y-4 md:hidden z-50 animate-fadeInUp">
          <button
            onClick={() => {
              onSelectTab('explore');
              setMobileMenuOpen(false);
            }}
            className={`text-left text-sm uppercase tracking-widest py-2 ${
              currentTab === 'explore' ? 'text-[#e9c176]' : 'text-[#e5e2e1]/70'
            }`}
          >
            Explore
          </button>
          <button
            onClick={() => {
              onSelectTab('seasons');
              setMobileMenuOpen(false);
            }}
            className={`text-left text-sm uppercase tracking-widest py-2 ${
              currentTab === 'seasons' ? 'text-[#e9c176]' : 'text-[#e5e2e1]/70'
            }`}
          >
            Seasons
          </button>
          <button
            onClick={() => {
              onSelectTab('profile');
              setMobileMenuOpen(false);
            }}
            className={`text-left text-sm uppercase tracking-widest py-2 ${
              currentTab === 'profile' ? 'text-[#e9c176]' : 'text-[#e5e2e1]/70'
            }`}
          >
            Profile
          </button>
          <button
            onClick={() => {
              onSelectTab('auth');
              setMobileMenuOpen(false);
            }}
            className="text-left text-xs uppercase tracking-widest text-[#d1c5b4]/50 hover:text-[#e9c176] pt-4 border-t border-white/10"
          >
            Sign Out / Reset Access
          </button>
        </div>
      )}
    </nav>
  );
};

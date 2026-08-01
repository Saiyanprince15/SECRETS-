import React, { useState, useEffect } from 'react';
import { StoryNode } from '../types';
import { CosmicDust } from './CosmicDust';

interface ExploreScreenProps {
  storyNode: StoryNode;
  onSelectChoice: (choiceText: string) => void;
  isLoading?: boolean;
}

export const ExploreScreen: React.FC<ExploreScreenProps> = ({
  storyNode,
  onSelectChoice,
  isLoading = false,
}) => {
  const [customPrompt, setCustomPrompt] = useState('');
  const [showCustomInput, setShowCustomInput] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [exploreView, setExploreView] = useState<'chapters' | 'story'>('chapters');

  // Mouse parallax effect for hero image
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const x = (e.clientX / window.innerWidth - 0.5) * 12;
      const y = (e.clientY / window.innerHeight - 0.5) * 12;
      setMousePos({ x, y });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (customPrompt.trim()) {
      onSelectChoice(customPrompt.trim());
      setCustomPrompt('');
      setShowCustomInput(false);
    }
  };

  if (exploreView === 'chapters') {
    return (
      <main className="flex-grow relative pt-32 pb-24 px-6 md:px-20 overflow-hidden min-h-screen bg-[#0D0D0D]">
        <CosmicDust particleCount={40} />
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="mb-16">
            <h1 className="font-serif text-4xl md:text-5xl text-[#FF4E00] uppercase tracking-widest mb-4">
              Archives
            </h1>
            <p className="font-sans text-sm uppercase tracking-[0.2em] text-[#E0D8D0]/60">
              Select a chapter to begin your exploration
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Season 1 Cosmos Chapter Card */}
            <div 
              onClick={() => setExploreView('story')}
              className="group relative h-[400px] border border-white/10 rounded-xl overflow-hidden cursor-pointer hover:border-[#FF4E00]/50 transition-all duration-500"
            >
              <img 
                src="https://images.unsplash.com/photo-1462331940025-496dfbfc7564?q=80&w=2000&auto=format&fit=crop" 
                alt="Season 1 Cosmos"
                className="absolute inset-0 w-full h-full object-cover opacity-60 group-hover:opacity-80 group-hover:scale-105 transition-all duration-1000"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0D0D0D] via-[#0D0D0D]/40 to-transparent" />
              
              <div className="absolute inset-x-0 bottom-0 p-8 flex flex-col justify-end">
                <span className="text-[10px] font-mono text-[#FF4E00] uppercase tracking-[0.3em] mb-3 opacity-80">
                  Chapter I
                </span>
                <h2 className="font-serif text-2xl md:text-3xl text-[#E0D8D0] mb-2 group-hover:text-[#FF4E00] transition-colors">
                  Season 1 Cosmos
                </h2>
                <p className="font-sans text-xs text-[#E0D8D0]/70 leading-relaxed">
                  Enter the primordial void and discover the resonant frequencies of the early universe.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="flex-grow relative pt-20 overflow-hidden">
      {/* Floating Cosmic Dust Particle Background */}
      <CosmicDust particleCount={70} />

      {/* Hero Artwork (75vh) */}
      <section className="relative w-full h-[75vh] overflow-hidden bg-[#0e0e0e]">
        {/* The Artwork */}
        <img
          src={storyNode.imageUrl}
          alt={storyNode.title}
          className="w-full h-full object-cover opacity-90 transition-transform duration-700 ease-out animate-slow-pan"
          style={{
            transform: `scale(1.08) translate(${-mousePos.x}px, ${-mousePos.y}px)`,
          }}
        />
        {/* Atmospheric Layering Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#131313] via-[#131313]/20 to-transparent pointer-events-none" />

        {/* Floating Metadata Pill */}
        <div className="absolute top-8 left-8 md:left-20 bg-[#0D0D0D]/80 backdrop-blur-md border border-[#FF4E00]/40 px-5 py-2 rounded-full text-[10px] uppercase tracking-[0.3em] font-semibold text-[#FF4E00] flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-[#FF4E00] animate-pulse" />
          {storyNode.cycle} • {storyNode.depth}
        </div>
      </section>

      {/* Narrative & Choices Section */}
      <section className="px-6 md:px-20 py-16 md:py-24 relative z-10 -mt-24 md:-mt-40 fade-in-rise delay-300">
        {/* Narrative Text */}
        <div className="max-w-4xl mx-auto text-center mb-20 md:mb-24">
          <h2 className="font-serif text-3xl md:text-5xl text-[#E0D8D0] italic font-normal leading-relaxed text-balance opacity-95 mb-6">
            "{storyNode.title}"
          </h2>
          <p className="font-sans text-lg md:text-2xl text-[#E0D8D0]/80 font-light leading-relaxed text-balance">
            {storyNode.text}
          </p>

          {/* Vertical line and glowing accent ornament */}
          <div className="w-px h-16 bg-[#FF4E00]/40 mx-auto mt-12 mb-4" />
          <div className="w-1.5 h-1.5 bg-[#FF4E00] rounded-full mx-auto shadow-[0_0_12px_rgba(255,78,0,0.9)]" />
        </div>

        {/* Choices (Editorial Label Style) */}
        <div className="max-w-7xl mx-auto pb-24">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 mb-12">
            {storyNode.choices.map((choice, idx) => (
              <button
                key={idx}
                disabled={isLoading}
                onClick={() => onSelectChoice(choice)}
                className="group relative p-8 h-36 md:h-44 border border-white/10 hover:border-[#FF4E00] transition-all duration-500 flex flex-col justify-between text-left overflow-hidden bg-[#161920]/70 backdrop-blur-md cursor-pointer disabled:opacity-50 rounded-xl"
              >
                <div className="absolute inset-0 bg-[#FF4E00]/0 group-hover:bg-[#FF4E00]/5 transition-colors duration-500" />
                <span className="text-[10px] font-mono text-[#FF4E00] uppercase tracking-[0.3em]">
                  0{idx + 1} // Intention
                </span>
                <span className="text-xs uppercase tracking-[0.2em] font-semibold text-[#E0D8D0] group-hover:text-[#FF4E00] transition-all duration-300 relative z-10">
                  {choice}
                </span>
                <div className="w-full h-0.5 bg-white/5 group-hover:bg-[#FF4E00] transition-colors duration-500" />
              </button>
            ))}
          </div>

          {/* Custom Action / Prompt toggle */}
          <div className="text-center pt-4">
            {!showCustomInput ? (
              <button
                type="button"
                onClick={() => setShowCustomInput(true)}
                className="text-[11px] uppercase tracking-[0.3em] text-[#FF4E00] hover:text-[#ff7433] border-b border-[#FF4E00]/40 pb-1 transition-colors cursor-pointer inline-flex items-center gap-2"
              >
                ✦ Speak a custom intention to the soundscape...
              </button>
            ) : (
              <form onSubmit={handleCustomSubmit} className="max-w-xl mx-auto flex gap-3 mt-4">
                <input
                  type="text"
                  value={customPrompt}
                  onChange={(e) => setCustomPrompt(e.target.value)}
                  placeholder="What secret action do you wish to take?"
                  className="gallery-input flex-1 py-3 text-sm text-[#E0D8D0] px-4 bg-[#161920] border border-white/10 rounded-lg focus:border-[#FF4E00] outline-none"
                  autoFocus
                />
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-[#FF4E00] text-black font-semibold text-xs uppercase tracking-widest hover:bg-[#ff6d2b] transition-colors cursor-pointer rounded-lg"
                >
                  Send
                </button>
                <button
                  type="button"
                  onClick={() => setShowCustomInput(false)}
                  className="px-3 py-2 text-xs text-[#E0D8D0]/50 hover:text-white"
                >
                  ✕
                </button>
              </form>
            )}
          </div>
        </div>
      </section>
    </main>
  );
};

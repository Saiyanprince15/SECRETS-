import React, { useState, useEffect } from 'react';
import { StoryNode } from '../types';
import { CosmicDust } from './CosmicDust';
import { CHAPTERS, Chapter, FALLBACK_HERO } from '../chapters';
import { hapticTap, hapticConfirm, hapticImpact } from '../lib/haptics';

interface ExploreScreenProps {
  storyNode: StoryNode;
  onSelectChoice: (choiceText: string) => void;
  onSelectChapter: (chapter: Chapter) => void;
  isLoading?: boolean;
}

export const ExploreScreen: React.FC<ExploreScreenProps> = ({
  storyNode,
  onSelectChoice,
  onSelectChapter,
  isLoading = false,
}) => {
  const [customPrompt, setCustomPrompt] = useState('');
  const [showCustomInput, setShowCustomInput] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [exploreView, setExploreView] = useState<'chapters' | 'story'>('chapters');
  const [heroSrc, setHeroSrc] = useState(storyNode.imageUrl);

  useEffect(() => {
    setHeroSrc(storyNode.imageUrl || FALLBACK_HERO);
  }, [storyNode.imageUrl]);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePos({
        x: (e.clientX / window.innerWidth - 0.5) * 12,
        y: (e.clientY / window.innerHeight - 0.5) * 12,
      });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (customPrompt.trim()) {
      hapticConfirm();
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
            {CHAPTERS.map((chapter) => (
              <button
                key={chapter.id}
                type="button"
                onClick={() => {
                  hapticImpact();
                  onSelectChapter(chapter);
                  setExploreView('story');
                }}
                className="group relative h-[400px] w-full text-left border border-white/10 rounded-xl overflow-hidden cursor-pointer hover:border-[#FF4E00]/50 transition-all duration-500"
              >
                <img
                  src={chapter.cardImage}
                  alt={chapter.title}
                  loading="lazy"
                  className="absolute inset-0 w-full h-full object-cover opacity-60 group-hover:opacity-80 group-hover:scale-105 transition-all duration-1000"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0D0D0D] via-[#0D0D0D]/40 to-transparent" />

                <div className="absolute inset-x-0 bottom-0 p-8 flex flex-col justify-end">
                  <span className="text-[10px] font-mono text-[#FF4E00] uppercase tracking-[0.3em] mb-3 opacity-80">
                    {chapter.label}
                  </span>
                  <h2 className="font-serif text-2xl md:text-3xl text-[#E0D8D0] mb-2 group-hover:text-[#FF4E00] transition-colors">
                    {chapter.title}
                  </h2>
                  <p className="font-sans text-xs text-[#E0D8D0]/70 leading-relaxed">
                    {chapter.blurb}
                  </p>
                </div>
              </button>
            ))}
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="flex-grow relative pt-20 overflow-hidden">
      <CosmicDust particleCount={70} />

      <section className="relative w-full px-4 md:px-12 pt-6">
        <div className="relative w-full max-w-[1600px] mx-auto aspect-[16/9] overflow-hidden rounded-2xl bg-[#0e0e0e] border border-white/10">
          <img
            key={heroSrc}
            src={heroSrc}
            alt={storyNode.title}
            onError={() => {
              if (heroSrc !== FALLBACK_HERO) setHeroSrc(FALLBACK_HERO);
            }}
            className="w-full h-full object-cover opacity-90 transition-transform duration-700 ease-out animate-slow-pan"
            style={{
              transform: `scale(1.06) translate(${-mousePos.x}px, ${-mousePos.y}px)`,
            }}
          />

          <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-[#131313]/70 to-transparent pointer-events-none" />

          <div className="absolute top-6 left-6 md:top-8 md:left-8 bg-[#0D0D0D]/80 backdrop-blur-md border border-[#FF4E00]/40 px-5 py-2 rounded-full text-[10px] uppercase tracking-[0.3em] font-semibold text-[#FF4E00] flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-[#FF4E00] animate-pulse" />
            {storyNode.cycle} • {storyNode.depth}
          </div>

          <button
            type="button"
            onClick={() => { hapticTap(); setExploreView('chapters'); }}
            className="absolute top-6 right-6 md:top-8 md:right-8 bg-[#0D0D0D]/80 backdrop-blur-md border border-white/15 px-4 py-2 rounded-full text-[10px] uppercase tracking-[0.25em] text-[#E0D8D0]/80 hover:text-[#FF4E00] hover:border-[#FF4E00]/40 transition-colors cursor-pointer"
          >
            ← Archives
          </button>
        </div>
      </section>

      <section className="px-6 md:px-20 py-16 md:py-20 relative z-10 fade-in-rise delay-300">
        <div className="max-w-4xl mx-auto text-center mb-20 md:mb-24">
          <h2 className="font-serif text-3xl md:text-5xl text-[#E0D8D0] italic font-normal leading-relaxed text-balance opacity-95 mb-6">
            "{storyNode.title}"
          </h2>
          <p className="font-sans text-lg md:text-2xl text-[#E0D8D0]/80 font-light leading-relaxed text-balance">
            {storyNode.text}
          </p>

          <div className="w-px h-16 bg-[#FF4E00]/40 mx-auto mt-12 mb-4" />
          <div className="w-1.5 h-1.5 bg-[#FF4E00] rounded-full mx-auto shadow-[0_0_12px_rgba(255,78,0,0.9)]" />
        </div>

        <div className="max-w-7xl mx-auto pb-24">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 mb-12">
            {storyNode.choices.map((choice, idx) => (
              <button
                key={`${choice}-${idx}`}
                disabled={isLoading}
                onClick={() => { hapticConfirm(); onSelectChoice(choice); }}
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

          <div className="text-center pt-4">
            {!showCustomInput ? (
              <button
                type="button"
                onClick={() => { hapticTap(); setShowCustomInput(true); }}
                className="text-[11px] uppercase tracking-[0.3em] text-[#FF4E00] hover:text-[#ff7433] border-b border-[#FF4E00]/40 pb-1 transition-colors cursor-pointer inline-flex items-center gap-2"
              >
                ✦ Speak a custom intention to the soundscape...
              </button>
            ) : (
              <form
                onSubmit={handleCustomSubmit}
                className="max-w-xl mx-auto flex gap-3 mt-4"
              >
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
                  onClick={() => { hapticTap(); setShowCustomInput(false); }}
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

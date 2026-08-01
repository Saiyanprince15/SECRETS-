import React, { useState } from 'react';
import { SeasonExhibition } from '../types';

interface SeasonsScreenProps {
  seasons: SeasonExhibition[];
  onSelectSeason: (season: SeasonExhibition) => void;
  onGenerateCustomExhibition?: (themePrompt: string) => Promise<SeasonExhibition | null>;
}

export const SeasonsScreen: React.FC<SeasonsScreenProps> = ({
  seasons,
  onSelectSeason,
  onGenerateCustomExhibition,
}) => {
  const [customPrompt, setCustomPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [showGeneratorModal, setShowGeneratorModal] = useState(false);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customPrompt.trim() || !onGenerateCustomExhibition) return;

    setIsGenerating(true);
    try {
      const newSeason = await onGenerateCustomExhibition(customPrompt.trim());
      if (newSeason) {
        onSelectSeason(newSeason);
        setShowGeneratorModal(false);
        setCustomPrompt('');
      }
    } catch (err) {
      console.error("Failed to generate custom season:", err);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <main className="flex-grow pt-32 pb-24 px-6 md:px-20 max-w-7xl mx-auto w-full">
      {/* Header Section */}
      <header className="mb-16 md:mb-20 fade-in-up">
        <h1 className="font-serif text-5xl md:text-7xl text-[#e9c176] tracking-widest mb-6">
          Seasons
        </h1>
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-white/10 pb-8">
          <p className="text-sm md:text-base text-[#d1c5b4]/80 max-w-2xl leading-relaxed font-light">
            A curated archive of immersive digital exhibitions, releasing periodically. Journey through thematic collections of art and artifacts.
          </p>
          <button
            onClick={() => setShowGeneratorModal(true)}
            className="gallery-button px-6 py-3 text-xs uppercase tracking-[0.2em] font-semibold text-[#e9c176] flex items-center gap-3 shrink-0 cursor-pointer self-start md:self-auto"
          >
            <span className="material-symbols-outlined text-sm">auto_awesome</span>
            <span>Curate Exhibition</span>
          </button>
        </div>
      </header>

      {/* Horizontal Snap Gallery */}
      <section className="relative fade-in-up delay-300">
        <div className="flex overflow-x-auto gallery-scroll snap-x snap-mandatory gap-8 pb-12 pt-2 -mx-6 md:-mx-20 px-6 md:px-20">
          {seasons.map((season) => (
            <div
              key={season.id}
              className="snap-center shrink-0 w-[85vw] sm:w-[450px] md:w-[520px] h-[600px] relative group overflow-hidden border border-white/15 hover:border-[#e9c176]/80 transition-all duration-700 bg-[#161920] flex flex-col justify-between p-8 md:p-12 cursor-pointer"
              onClick={() => onSelectSeason(season)}
            >
              {/* Background Artwork */}
              <div
                className="absolute inset-0 bg-cover bg-center opacity-40 group-hover:opacity-60 group-hover:scale-105 transition-all duration-1000 ease-out"
                style={{ backgroundImage: `url('${season.bgImage}')` }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#131313] via-[#131313]/60 to-transparent" />

              {/* Top Tag & Status */}
              <div className="relative z-10 flex justify-between items-start">
                <span className="text-[10px] uppercase tracking-[0.25em] font-semibold text-[#e9c176] bg-[#131313]/60 backdrop-blur-md px-3 py-1.5 border border-[#e9c176]/30">
                  {season.status === 'active' || season.status === 'current'
                    ? 'Current Exhibition'
                    : season.subtitle}
                </span>
                {season.isLocked && (
                  <span className="material-symbols-outlined text-[#e9c176]/60 text-lg">
                    lock
                  </span>
                )}
              </div>

              {/* Bottom Content Info */}
              <div className="relative z-10 space-y-4 pt-12">
                <h2 className="font-serif text-3xl md:text-4xl text-[#e5e2e1] group-hover:text-[#e9c176] transition-colors">
                  {season.title}
                </h2>
                <p className="text-xs md:text-sm text-[#d1c5b4]/80 leading-relaxed font-light line-clamp-3">
                  {season.description}
                </p>
                <div className="pt-4 flex items-center gap-3 text-xs uppercase tracking-[0.2em] font-semibold text-[#e9c176] group-hover:translate-x-2 transition-transform duration-500">
                  <span>Enter Gallery</span>
                  <span className="material-symbols-outlined text-sm">arrow_forward</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Generator Modal */}
      {showGeneratorModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-6">
          <div className="bg-[#1c1b1b] border border-[#e9c176]/30 p-8 rounded-sm max-w-lg w-full space-y-6">
            <div className="flex justify-between items-center border-b border-white/10 pb-4">
              <h3 className="font-serif text-2xl text-[#e9c176] flex items-center gap-2">
                <span className="material-symbols-outlined">auto_awesome</span>
                AI Exhibition Curation
              </h3>
              <button
                onClick={() => setShowGeneratorModal(false)}
                className="text-[#d1c5b4] hover:text-white"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-[#d1c5b4] leading-relaxed">
              Define a cosmic, botanical, or sub-aquatic theme. Gemini AI will synthesize an original exhibit season with artifacts and lore.
            </p>

            <form onSubmit={handleGenerate} className="space-y-6">
              <input
                type="text"
                value={customPrompt}
                onChange={(e) => setCustomPrompt(e.target.value)}
                placeholder="e.g., A forgotten clockwork nebula floating in liquid obsidian"
                className="gallery-input w-full py-3 text-sm text-[#e5e2e1]"
                required
              />

              <div className="flex justify-end gap-4 pt-2">
                <button
                  type="button"
                  onClick={() => setShowGeneratorModal(false)}
                  className="px-4 py-2 text-xs uppercase tracking-widest text-[#d1c5b4]/60 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isGenerating}
                  className="px-6 py-3 border border-[#e9c176] text-xs uppercase tracking-widest text-[#e9c176] hover:bg-[#e9c176]/10 flex items-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {isGenerating ? (
                    <>
                      <span className="animate-spin text-sm">✦</span>
                      <span>Synthesizing...</span>
                    </>
                  ) : (
                    <span>Manifest Season</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
};

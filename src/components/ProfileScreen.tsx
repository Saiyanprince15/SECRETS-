import React from 'react';
import { UserProfile, HistoryItem, SavedDiscovery } from '../types';

interface ProfileScreenProps {
  profile: UserProfile;
  history: HistoryItem[];
  savedDiscoveries: SavedDiscovery[];
  onToggleBookmark: (id: string) => void;
  onSelectDiscovery: (discovery: SavedDiscovery) => void;
}

const EmptyState: React.FC<{ line: string }> = ({ line }) => (
  <div className="py-16 text-center border border-dashed border-white/10 bg-[#131313]/40">
    <div className="w-1 h-1 bg-[#e9c176]/50 rounded-full mx-auto mb-5" />
    <p className="text-xs text-[#d1c5b4]/40 tracking-[0.15em] font-light italic">
      {line}
    </p>
  </div>
);

export const ProfileScreen: React.FC<ProfileScreenProps> = ({
  profile,
  history,
  savedDiscoveries,
  onToggleBookmark,
  onSelectDiscovery,
}) => {
  return (
    <main className="flex-grow pt-32 pb-24 px-6 md:px-20 max-w-7xl mx-auto w-full">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16">

        {/* Left sidebar */}
        <aside className="lg:col-span-4 space-y-8 fade-in-up">
          <div>
            <span className="text-[10px] uppercase tracking-[0.25em] font-semibold text-[#e9c176]/70 block mb-2">
              Explorer Journal
            </span>
            <h1 className="font-serif text-3xl md:text-5xl text-[#e5e2e1] italic mb-4">
              {profile.explorerName}
            </h1>
            <p className="text-xs text-[#d1c5b4]/60 tracking-wider">
              {profile.email}
            </p>
          </div>

          <div className="ornamental-divider my-6" />

          <div className="border border-white/10 bg-[#161920]/80 p-6 space-y-3 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-[#e9c176]/5 rounded-full blur-2xl" />
            <span className="text-[10px] uppercase tracking-[0.2em] font-semibold text-[#e9c176] block">
              Maximum Depth
            </span>
            <div className="font-serif text-xl text-[#e5e2e1] tracking-wider">
              {profile.level}
            </div>
          </div>
        </aside>

        {/* Right column */}
        <div className="lg:col-span-8 space-y-16 fade-in-up delay-300">

          <section className="space-y-6">
            <div className="flex justify-between items-baseline border-b border-white/10 pb-4">
              <h2 className="font-serif text-2xl text-[#e5e2e1] tracking-wide">
                Exploration History
              </h2>
              <span className="text-[10px] uppercase tracking-[0.2em] text-[#e9c176]/70">
                Chronicles ({history.length})
              </span>
            </div>

            {history.length === 0 ? (
              <EmptyState line="No chronicles yet. Make a choice to begin recording." />
            ) : (
              <div className="space-y-6">
                {history.map((item) => (
                  <div
                    key={item.id}
                    className="group grid grid-cols-1 md:grid-cols-12 gap-6 p-4 border border-white/5 hover:border-[#e9c176]/40 bg-[#131313]/50 backdrop-blur-sm transition-all duration-500"
                  >
                    <div className="md:col-span-4 aspect-video md:aspect-square overflow-hidden bg-black/40">
                      <img
                        src={item.imageUrl}
                        alt={item.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                      />
                    </div>
                    <div className="md:col-span-8 flex flex-col justify-between space-y-3">
                      <div>
                        <span className="text-[10px] uppercase tracking-[0.2em] text-[#e9c176] font-semibold block mb-1">
                          {item.cycle} • {item.depth}
                        </span>
                        <h3 className="font-serif text-xl text-[#e5e2e1] group-hover:text-[#e9c176] transition-colors mb-2">
                          "{item.title}"
                        </h3>
                        <p className="text-xs text-[#d1c5b4]/80 leading-relaxed font-light">
                          {item.description}
                        </p>
                      </div>
                      <span className="text-[10px] text-[#d1c5b4]/40 uppercase tracking-widest self-end">
                        {item.date}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          <section className="space-y-6">
            <div className="flex justify-between items-baseline border-b border-white/10 pb-4">
              <h2 className="font-serif text-2xl text-[#e5e2e1] tracking-wide">
                Saved Discoveries
              </h2>
              <span className="text-[10px] uppercase tracking-[0.2em] text-[#e9c176]/70">
                Fragments ({savedDiscoveries.length})
              </span>
            </div>

            {savedDiscoveries.length === 0 ? (
              <EmptyState line="No fragments saved. Discoveries collect here as you explore." />
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                {savedDiscoveries.map((disc) => (
                  <div
                    key={disc.id}
                    className="group relative border border-white/10 hover:border-[#e9c176]/60 bg-[#161920] overflow-hidden transition-all duration-500 cursor-pointer flex flex-col"
                    onClick={() => onSelectDiscovery(disc)}
                  >
                    <div className="aspect-square overflow-hidden relative">
                      <img
                        src={disc.imageUrl}
                        alt={disc.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                      />
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onToggleBookmark(disc.id);
                        }}
                        className="absolute top-3 right-3 w-8 h-8 rounded-full bg-[#131313]/70 backdrop-blur-md flex items-center justify-center text-[#e9c176] hover:scale-110 transition-transform"
                      >
                        <span className="material-symbols-outlined text-sm">
                          {disc.bookmarked ? 'bookmark' : 'bookmark_border'}
                        </span>
                      </button>
                    </div>
                    <div className="p-4 flex-1 flex flex-col justify-between">
                      <div>
                        <h4 className="font-serif text-sm text-[#e5e2e1] group-hover:text-[#e9c176] transition-colors line-clamp-1 mb-1">
                          {disc.title}
                        </h4>
                        {disc.cycle && (
                          <p className="text-[10px] uppercase tracking-widest text-[#d1c5b4]/50">
                            {disc.cycle} • {disc.depth}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

        </div>
      </div>
    </main>
  );
};

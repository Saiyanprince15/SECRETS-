import React, { useState } from 'react';
import { SavedDiscovery } from '../types';

interface SecretModalProps {
  discovery: SavedDiscovery | null;
  onClose: () => void;
  onToggleBookmark: (id: string) => void;
}

export const SecretModal: React.FC<SecretModalProps> = ({
  discovery,
  onClose,
  onToggleBookmark,
}) => {
  const [copied, setCopied] = useState(false);

  if (!discovery) return null;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-xl p-4 md:p-8 animate-fadeInUp">
      <div className="relative bg-[#161920] border border-[#e9c176]/40 max-w-3xl w-full overflow-hidden shadow-2xl flex flex-col md:flex-row">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 w-8 h-8 rounded-full bg-black/50 text-[#e5e2e1] hover:text-[#e9c176] flex items-center justify-center transition-colors cursor-pointer"
        >
          ✕
        </button>

        {/* Artwork Image */}
        <div className="md:w-1/2 aspect-square md:aspect-auto relative bg-black">
          <img
            src={discovery.imageUrl}
            alt={discovery.title}
            className="w-full h-full object-cover"
          />
        </div>

        {/* Content Side */}
        <div className="md:w-1/2 p-6 md:p-8 flex flex-col justify-between space-y-6">
          <div className="space-y-4">
            <span className="text-[10px] uppercase tracking-[0.25em] font-semibold text-[#e9c176] block">
              {discovery.cycle || 'Cycle 44'} • {discovery.depth || 'Depth VII'}
            </span>
            <h3 className="font-serif text-2xl md:text-3xl text-[#e5e2e1] leading-tight">
              "{discovery.title}"
            </h3>
            <p className="text-xs text-[#d1c5b4]/80 leading-relaxed font-light">
              {discovery.description || "An ancient digital echo preserved in the exhibition core."}
            </p>
          </div>

          <div className="pt-6 border-t border-white/10 flex items-center justify-between gap-4">
            <button
              onClick={() => onToggleBookmark(discovery.id)}
              className="px-4 py-2 border border-[#e9c176]/50 text-xs uppercase tracking-widest text-[#e9c176] hover:bg-[#e9c176]/10 flex items-center gap-2 cursor-pointer"
            >
              <span className="material-symbols-outlined text-sm">
                {discovery.bookmarked ? 'bookmark' : 'bookmark_border'}
              </span>
              <span>{discovery.bookmarked ? 'Saved' : 'Save Fragment'}</span>
            </button>

            <button
              onClick={handleCopyLink}
              className="text-xs uppercase tracking-widest text-[#d1c5b4]/60 hover:text-[#e9c176] transition-colors flex items-center gap-1 cursor-pointer"
            >
              <span className="material-symbols-outlined text-sm">share</span>
              <span>{copied ? 'Copied Link' : 'Share'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

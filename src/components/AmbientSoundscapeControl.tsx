import React, { useEffect, useState } from 'react';
import { audioEngine, SoundscapePreset } from '../lib/audioEngine';
import { Volume2, VolumeX, Sparkles, SlidersHorizontal, Play, Pause } from 'lucide-react';

export const AmbientSoundscapeControl: React.FC = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [preset, setPreset] = useState<SoundscapePreset>(audioEngine.getPreset());
  const [volume, setVolume] = useState(audioEngine.getVolume());
  const [showVolumeSlider, setShowVolumeSlider] = useState(false);

  useEffect(() => {
    const unsubscribe = audioEngine.subscribe((playing, currentPreset, vol) => {
      setIsPlaying(playing);
      setPreset(currentPreset);
      setVolume(vol);
    });
    return unsubscribe;
  }, []);

  const handleToggle = () => {
    audioEngine.togglePlay();
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    audioEngine.setVolume(val);
  };

  return (
    <div className="relative inline-flex items-center">
      <div 
        className={`flex items-center gap-3 px-3 py-1.5 rounded-full border transition-all duration-500 backdrop-blur-md cursor-pointer ${
          isPlaying 
            ? 'bg-[#1a1a1a]/80 border-[#ffffff1a] shadow-[0_0_15px_rgba(255,78,0,0.15)]' 
            : 'bg-[#131313]/60 border-white/10 hover:border-white/20'
        }`}
        style={{
          borderColor: isPlaying ? `${preset.accentColor}55` : undefined
        }}
      >
        {/* Play/Pause Button */}
        <button
          onClick={handleToggle}
          className="p-1 rounded-full text-[#e0d8d0] hover:text-white transition-colors flex items-center justify-center cursor-pointer"
          title={isPlaying ? "Mute Ambient Soundscape" : "Activate Ambient Soundscape"}
        >
          {isPlaying ? (
            <div className="relative flex items-center justify-center">
              <span className="animate-ping absolute inline-flex h-3 w-3 rounded-full opacity-40" style={{ backgroundColor: preset.accentColor }}></span>
              <Pause size={14} style={{ color: preset.accentColor }} />
            </div>
          ) : (
            <Play size={14} className="text-[#a0a0a0] hover:text-[#e0d8d0]" />
          )}
        </button>

        {/* Dynamic Texture Label & Equalizer Animation */}
        <button 
          onClick={handleToggle}
          className="flex items-center gap-2 text-left cursor-pointer group"
        >
          <div className="flex items-end gap-[2px] h-3">
            <span className={`w-[2px] rounded-full transition-all duration-300 ${isPlaying ? 'animate-bounce h-3' : 'h-1.5 bg-[#ffffff33]'}`} style={{ backgroundColor: isPlaying ? preset.accentColor : undefined, animationDelay: '0ms' }} />
            <span className={`w-[2px] rounded-full transition-all duration-300 ${isPlaying ? 'animate-bounce h-2' : 'h-1 bg-[#ffffff33]'}`} style={{ backgroundColor: isPlaying ? preset.accentColor : undefined, animationDelay: '150ms' }} />
            <span className={`w-[2px] rounded-full transition-all duration-300 ${isPlaying ? 'animate-bounce h-3.5' : 'h-2 bg-[#ffffff33]'}`} style={{ backgroundColor: isPlaying ? preset.accentColor : undefined, animationDelay: '300ms' }} />
          </div>

          <div className="hidden sm:flex flex-col">
            <span className="text-[9px] uppercase tracking-[0.25em] font-medium text-[#ffffff99] flex items-center gap-1 group-hover:text-white transition-colors">
              <Sparkles size={8} style={{ color: preset.accentColor }} />
              Soundscape
            </span>
            <span className="text-[10px] font-serif italic text-[#e0d8d0] truncate max-w-[130px] sm:max-w-[160px]">
              {preset.name}
            </span>
          </div>
        </button>

        {/* Volume Popover Toggle */}
        <button
          onClick={() => setShowVolumeSlider(!showVolumeSlider)}
          className="p-1 text-[#ffffff80] hover:text-[#e0d8d0] transition-colors cursor-pointer"
          title="Adjust Ambient Volume"
        >
          {volume === 0 ? <VolumeX size={13} /> : <SlidersHorizontal size={13} />}
        </button>
      </div>

      {/* Volume Slider Popover */}
      {showVolumeSlider && (
        <div className="absolute right-0 top-full mt-2 p-3 bg-[#161920] border border-[#ffffff1a] rounded-xl shadow-2xl backdrop-blur-xl z-50 flex items-center gap-3 w-44 fade-in-rise">
          <button 
            onClick={() => audioEngine.setVolume(volume > 0 ? 0 : 0.35)}
            className="text-[#e0d8d0] hover:text-white"
          >
            {volume === 0 ? <VolumeX size={14} /> : <Volume2 size={14} />}
          </button>
          <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={volume}
            onChange={handleVolumeChange}
            className="w-full h-1 bg-[#ffffff20] rounded-lg appearance-none cursor-pointer accent-[#FF4E00]"
          />
          <span className="text-[9px] font-mono text-[#ffffff70] w-6 text-right">
            {Math.round(volume * 100)}%
          </span>
        </div>
      )}
    </div>
  );
};

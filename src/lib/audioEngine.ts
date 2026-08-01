// Web Audio API Ambient Soundscape Engine for Cosmic Textures

export interface SoundscapePreset {
  id: string;
  name: string;
  description: string;
  baseFreq: number;       // Fundamental tone (Hz)
  subFreq: number;        // Deep sub-bass (Hz)
  chordIntervals: number[]; // Ratios for harmonic pad
  filterCutoff: number;   // Lowpass filter cutoff frequency (Hz)
  noiseLevel: number;     // Cosmic wind noise gain (0 - 0.15)
  modSpeed: number;       // LFO modulation speed (Hz)
  accentColor: string;    // UI accent color hex
}

// Preset definitions corresponding to narrative atmospheres
export const SOUNDSCAPE_PRESETS: Record<string, SoundscapePreset> = {
  cosmic_void: {
    id: 'cosmic_void',
    name: 'Cosmic Void • 432 Hz',
    description: 'Ethereal sub-bass sweep with soft deep space noise',
    baseFreq: 108,         // Low A
    subFreq: 43.2,         // Deep 432Hz sub harmonic
    chordIntervals: [1.0, 1.5, 2.0, 2.25], // Root, 5th, Octave, 9th
    filterCutoff: 180,
    noiseLevel: 0.04,
    modSpeed: 0.08,
    accentColor: '#FF4E00',
  },
  stellar_resonance: {
    id: 'stellar_resonance',
    name: 'Stellar Resonance • 528 Hz',
    description: 'Harmonic sine textures and resonant solar solar glow',
    baseFreq: 132,         // C3Sol
    subFreq: 52.8,
    chordIntervals: [1.0, 1.25, 1.5, 1.875], // Major 7th chord
    filterCutoff: 320,
    noiseLevel: 0.02,
    modSpeed: 0.15,
    accentColor: '#E9C176',
  },
  quantum_abyss: {
    id: 'quantum_abyss',
    name: 'Quantum Abyss • 36 Hz',
    description: 'Low-frequency rumble with sweeping resonant filter',
    baseFreq: 72,
    subFreq: 36.0,
    chordIntervals: [1.0, 1.333, 1.5, 1.777], // Minor 7th chord
    filterCutoff: 120,
    noiseLevel: 0.06,
    modSpeed: 0.05,
    accentColor: '#8A2BE2',
  },
  season_of_roses: {
    id: 'season_of_roses',
    name: 'Season of Roses • 216 Hz',
    description: 'Warm organic drone with gentle binaural breathing',
    baseFreq: 108,
    subFreq: 54.0,
    chordIntervals: [1.0, 1.2, 1.5, 1.8], // Minor pad
    filterCutoff: 240,
    noiseLevel: 0.015,
    modSpeed: 0.1,
    accentColor: '#FF3366',
  },
  monolith_sanctuary: {
    id: 'monolith_sanctuary',
    name: 'Monolith Sanctuary • 639 Hz',
    description: 'Crystalline harmonic hum with deep structural resonance',
    baseFreq: 159.75,
    subFreq: 39.9,
    chordIntervals: [1.0, 1.5, 2.25, 3.0],
    filterCutoff: 450,
    noiseLevel: 0.03,
    modSpeed: 0.12,
    accentColor: '#00F2FE',
  }
};

class AudioEngine {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private filter: BiquadFilterNode | null = null;
  private subOsc: OscillatorNode | null = null;
  private subGain: GainNode | null = null;
  private padOscs: OscillatorNode[] = [];
  private padGains: GainNode[] = [];
  private noiseNode: AudioBufferSourceNode | null = null;
  private noiseGain: GainNode | null = null;
  private lfo: OscillatorNode | null = null;
  private lfoGain: GainNode | null = null;

  private isPlaying: boolean = false;
  private currentPreset: SoundscapePreset = SOUNDSCAPE_PRESETS.cosmic_void;
  private volume: number = 0.35;
  private listeners: Set<(isPlaying: boolean, preset: SoundscapePreset, volume: number) => void> = new Set();

  public subscribe(fn: (isPlaying: boolean, preset: SoundscapePreset, volume: number) => void) {
    this.listeners.add(fn);
    fn(this.isPlaying, this.currentPreset, this.volume);
    return () => {
      this.listeners.delete(fn);
    };
  }

  private notify() {
    this.listeners.forEach(fn => fn(this.isPlaying, this.currentPreset, this.volume));
  }

  // Derive preset from StoryNode text or properties
  public getPresetForStoryNode(title: string = '', text: string = '', depth: string = ''): SoundscapePreset {
    const combined = `${title} ${text} ${depth}`.toLowerCase();

    if (combined.includes('rose') || combined.includes('flower') || combined.includes('garden') || combined.includes('petal')) {
      return SOUNDSCAPE_PRESETS.season_of_roses;
    }
    if (combined.includes('abyss') || combined.includes('shadow') || combined.includes('depth ix') || combined.includes('dark')) {
      return SOUNDSCAPE_PRESETS.quantum_abyss;
    }
    if (combined.includes('star') || combined.includes('light') || combined.includes('celestial') || combined.includes('sun') || combined.includes('glow')) {
      return SOUNDSCAPE_PRESETS.stellar_resonance;
    }
    if (combined.includes('monolith') || combined.includes('sanctuary') || combined.includes('temple') || combined.includes('pillar') || combined.includes('crystal')) {
      return SOUNDSCAPE_PRESETS.monolith_sanctuary;
    }

    // Default or cyclic fallback
    return SOUNDSCAPE_PRESETS.cosmic_void;
  }

  private initContext() {
    if (this.ctx) return;
    const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    this.ctx = new AudioCtx();

    // Master Gain
    this.masterGain = this.ctx.createGain();
    this.masterGain.gain.setValueAtTime(this.volume, this.ctx.currentTime);
    this.masterGain.connect(this.ctx.destination);

    // Biquad Filter
    this.filter = this.ctx.createBiquadFilter();
    this.filter.type = 'lowpass';
    this.filter.frequency.setValueAtTime(this.currentPreset.filterCutoff, this.ctx.currentTime);
    this.filter.Q.setValueAtTime(3.5, this.ctx.currentTime);
    this.filter.connect(this.masterGain);

    // LFO for subtle Filter Wobble
    this.lfo = this.ctx.createOscillator();
    this.lfo.frequency.setValueAtTime(this.currentPreset.modSpeed, this.ctx.currentTime);
    this.lfoGain = this.ctx.createGain();
    this.lfoGain.gain.setValueAtTime(25, this.ctx.currentTime); // Filter modulation range
    this.lfo.connect(this.lfoGain);
    this.lfoGain.connect(this.filter.frequency);
    this.lfo.start();

    // Sub-bass Oscillator
    this.subOsc = this.ctx.createOscillator();
    this.subOsc.type = 'sine';
    this.subOsc.frequency.setValueAtTime(this.currentPreset.subFreq, this.ctx.currentTime);
    this.subGain = this.ctx.createGain();
    this.subGain.gain.setValueAtTime(0.5, this.ctx.currentTime);
    this.subOsc.connect(this.subGain);
    this.subGain.connect(this.filter);
    this.subOsc.start();

    // Harmonic Chord Oscillators (4 sine/triangle pad voices)
    this.padOscs = [];
    this.padGains = [];
    this.currentPreset.chordIntervals.forEach((interval, idx) => {
      if (!this.ctx || !this.filter) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = idx % 2 === 0 ? 'sine' : 'triangle';
      osc.frequency.setValueAtTime(this.currentPreset.baseFreq * interval, this.ctx.currentTime);
      
      // Slight detune for analog warmth
      osc.detune.setValueAtTime((idx - 1.5) * 4, this.ctx.currentTime);

      // Distribute volume across voices
      const voiceGain = 0.25 / (idx + 1);
      gain.gain.setValueAtTime(voiceGain, this.ctx.currentTime);

      osc.connect(gain);
      gain.connect(this.filter);
      osc.start();

      this.padOscs.push(osc);
      this.padGains.push(gain);
    });

    // Cosmic Pink Noise Generator
    const bufferSize = this.ctx.sampleRate * 4;
    const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
    
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      b0 = 0.99886 * b0 + white * 0.0555179;
      b1 = 0.99332 * b1 + white * 0.0750759;
      b2 = 0.96900 * b2 + white * 0.1538520;
      b3 = 0.86650 * b3 + white * 0.3104856;
      b4 = 0.55000 * b4 + white * 0.5329522;
      b5 = -0.7616 * b5 - white * 0.0168980;
      output[i] = b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362;
      output[i] *= 0.11; // Scale down
      b6 = white * 0.115926;
    }

    this.noiseNode = this.ctx.createBufferSource();
    this.noiseNode.buffer = noiseBuffer;
    this.noiseNode.loop = true;

    this.noiseGain = this.ctx.createGain();
    this.noiseGain.gain.setValueAtTime(this.currentPreset.noiseLevel, this.ctx.currentTime);

    this.noiseNode.connect(this.noiseGain);
    this.noiseGain.connect(this.filter);
    this.noiseNode.start();
  }

  public async play() {
    if (!this.ctx) {
      this.initContext();
    }

    if (this.ctx && this.ctx.state === 'suspended') {
      await this.ctx.resume();
    }

    if (this.masterGain && this.ctx) {
      this.masterGain.gain.cancelScheduledValues(this.ctx.currentTime);
      this.masterGain.gain.linearRampToValueAtTime(this.volume, this.ctx.currentTime + 1.5);
    }

    this.isPlaying = true;
    this.notify();
  }

  public pause() {
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.cancelScheduledValues(this.ctx.currentTime);
      this.masterGain.gain.linearRampToValueAtTime(0.0001, this.ctx.currentTime + 1.0);
    }
    this.isPlaying = false;
    this.notify();
  }

  public togglePlay() {
    if (this.isPlaying) {
      this.pause();
    } else {
      this.play();
    }
  }

  public setVolume(newVol: number) {
    this.volume = Math.max(0, Math.min(1, newVol));
    if (this.masterGain && this.ctx && this.isPlaying) {
      this.masterGain.gain.cancelScheduledValues(this.ctx.currentTime);
      this.masterGain.gain.linearRampToValueAtTime(this.volume, this.ctx.currentTime + 0.1);
    }
    this.notify();
  }

  // Smoothly morph audio parameters when narrative context changes
  public transitionToPreset(preset: SoundscapePreset) {
    this.currentPreset = preset;

    if (!this.ctx || !this.isPlaying) {
      this.notify();
      return;
    }

    const now = this.ctx.currentTime;
    const fadeDuration = 3.0; // 3 seconds smooth crossfade

    // Ramp filter
    if (this.filter) {
      this.filter.frequency.cancelScheduledValues(now);
      this.filter.frequency.exponentialRampToValueAtTime(Math.max(20, preset.filterCutoff), now + fadeDuration);
    }

    // Ramp sub frequency
    if (this.subOsc) {
      this.subOsc.frequency.cancelScheduledValues(now);
      this.subOsc.frequency.exponentialRampToValueAtTime(Math.max(20, preset.subFreq), now + fadeDuration);
    }

    // Ramp pad voices
    this.padOscs.forEach((osc, idx) => {
      const interval = preset.chordIntervals[idx] || 1.0;
      const targetFreq = preset.baseFreq * interval;
      osc.frequency.cancelScheduledValues(now);
      osc.frequency.exponentialRampToValueAtTime(Math.max(20, targetFreq), now + fadeDuration);
    });

    // Ramp LFO speed
    if (this.lfo) {
      this.lfo.frequency.cancelScheduledValues(now);
      this.lfo.frequency.linearRampToValueAtTime(preset.modSpeed, now + fadeDuration);
    }

    // Ramp noise
    if (this.noiseGain) {
      this.noiseGain.gain.cancelScheduledValues(now);
      this.noiseGain.gain.linearRampToValueAtTime(preset.noiseLevel, now + fadeDuration);
    }

    this.notify();
  }

  public transitionForStoryNode(title: string, text: string, depth: string) {
    const preset = this.getPresetForStoryNode(title, text, depth);
    this.transitionToPreset(preset);
  }

  // Play a layered harmonic synth chime when a new story node is unlocked
  public playUnlockChime() {
    try {
      if (!this.ctx) {
        this.initContext();
      }

      if (!this.ctx) return;

      if (this.ctx.state === 'suspended') {
        this.ctx.resume();
      }

      const now = this.ctx.currentTime;
      const baseFrequency = this.currentPreset.baseFreq ? this.currentPreset.baseFreq * 2.5 : 432;

      // Master output for chime
      const chimeMasterGain = this.ctx.createGain();
      chimeMasterGain.gain.setValueAtTime(0, now);
      chimeMasterGain.gain.linearRampToValueAtTime(0.35, now + 0.04);
      chimeMasterGain.gain.exponentialRampToValueAtTime(0.0001, now + 3.2);

      // Connect chime gain to destination or master
      if (this.masterGain) {
        chimeMasterGain.connect(this.masterGain);
      } else {
        chimeMasterGain.connect(this.ctx.destination);
      }

      // Harmonic interval ratios for crystalline synth resonance (Root, Major 3rd, 5th, Octave + 3rd)
      const chimeRatios = [1.0, 1.25, 1.5, 2.5];

      chimeRatios.forEach((ratio, idx) => {
        if (!this.ctx) return;

        const osc = this.ctx.createOscillator();
        const voiceGain = this.ctx.createGain();
        const filter = this.ctx.createBiquadFilter();

        // Sine/Triangle combination for analog shimmer
        osc.type = idx % 2 === 0 ? 'sine' : 'triangle';
        const freq = baseFrequency * ratio;
        osc.frequency.setValueAtTime(freq, now + idx * 0.12); // Staggered arpeggio effect

        // Subtle frequency sweep for ethereal bloom
        osc.frequency.exponentialRampToValueAtTime(freq * 1.015, now + idx * 0.12 + 2.0);

        // Filter envelope for sparkling sweep
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(800, now);
        filter.frequency.exponentialRampToValueAtTime(3500 + idx * 500, now + 0.3);
        filter.frequency.exponentialRampToValueAtTime(400, now + 2.8);

        // Individual voice envelope
        const voiceDelay = idx * 0.12;
        voiceGain.gain.setValueAtTime(0, now + voiceDelay);
        voiceGain.gain.linearRampToValueAtTime(0.25 / (idx + 1), now + voiceDelay + 0.05);
        voiceGain.gain.exponentialRampToValueAtTime(0.0001, now + voiceDelay + 2.5);

        osc.connect(filter);
        filter.connect(voiceGain);
        voiceGain.connect(chimeMasterGain);

        osc.start(now + voiceDelay);
        osc.stop(now + voiceDelay + 3.0);
      });
    } catch (err) {
      console.warn("AudioEngine unlock chime trigger error:", err);
    }
  }

  public getPreset() {
    return this.currentPreset;
  }

  public getIsPlaying() {
    return this.isPlaying;
  }

  public getVolume() {
    return this.volume;
  }
}

export const audioEngine = new AudioEngine();

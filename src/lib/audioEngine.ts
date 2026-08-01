// Web Audio API Ambient Soundscape Engine for Cosmic Textures

export interface SoundscapePreset {
  id: string;
  name: string;
  description: string;
  baseFreq: number;
  subFreq: number;
  chordIntervals: number[];
  filterCutoff: number;
  noiseLevel: number;
  modSpeed: number;
  accentColor: string;
}

export const SOUNDSCAPE_PRESETS: Record<string, SoundscapePreset> = {
  cosmic_void: {
    id: 'cosmic_void',
    name: 'Cosmic Void • 432 Hz',
    description: 'Ethereal sub-bass sweep with soft deep space noise',
    baseFreq: 108,
    subFreq: 43.2,
    chordIntervals: [1.0, 1.5, 2.0, 2.25],
    filterCutoff: 180,
    noiseLevel: 0.04,
    modSpeed: 0.08,
    accentColor: '#FF4E00',
  },
  stellar_resonance: {
    id: 'stellar_resonance',
    name: 'Stellar Resonance • 528 Hz',
    description: 'Harmonic sine textures and resonant solar glow',
    baseFreq: 132,
    subFreq: 52.8,
    chordIntervals: [1.0, 1.25, 1.5, 1.875],
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
    chordIntervals: [1.0, 1.333, 1.5, 1.777],
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
    chordIntervals: [1.0, 1.2, 1.5, 1.8],
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
  },
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
    return () => { this.listeners.delete(fn); };
  }

  private notify() {
    this.listeners.forEach(fn => fn(this.isPlaying, this.currentPreset, this.volume));
  }

  public getPresetForStoryNode(title = '', text = '', depth = ''): SoundscapePreset {
    const combined = `${title} ${text} ${depth}`.toLowerCase();
    if (combined.includes('rose') || combined.includes('flower') || combined.includes('garden') || combined.includes('petal'))
      return SOUNDSCAPE_PRESETS.season_of_roses;
    if (combined.includes('abyss') || combined.includes('shadow') || combined.includes('depth ix') || combined.includes('dark'))
      return SOUNDSCAPE_PRESETS.quantum_abyss;
    if (combined.includes('star') || combined.includes('light') || combined.includes('celestial') || combined.includes('sun') || combined.includes('glow'))
      return SOUNDSCAPE_PRESETS.stellar_resonance;
    if (combined.includes('monolith') || combined.includes('sanctuary') || combined.includes('temple') || combined.includes('pillar') || combined.includes('crystal'))
      return SOUNDSCAPE_PRESETS.monolith_sanctuary;
    return SOUNDSCAPE_PRESETS.cosmic_void;
  }

  private initContext() {
    if (this.ctx) return;
    const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    this.ctx = new AudioCtx();

    this.masterGain = this.ctx.createGain();
    this.masterGain.gain.setValueAtTime(this.volume, this.ctx.currentTime);
    this.masterGain.connect(this.ctx.destination);

    this.filter = this.ctx.createBiquadFilter();
    this.filter.type = 'lowpass';
    this.filter.frequency.setValueAtTime(this.currentPreset.filterCutoff, this.ctx.currentTime);
    this.filter.Q.setValueAtTime(3.5, this.ctx.currentTime);
    this.filter.connect(this.masterGain);

    this.lfo = this.ctx.createOscillator();
    this.lfo.frequency.setValueAtTime(this.currentPreset.modSpeed, this.ctx.currentTime);
    this.lfoGain = this.ctx.createGain();
    this.lfoGain.gain.setValueAtTime(25, this.ctx.currentTime);
    this.lfo.connect(this.lfoGain);
    this.lfoGain.connect(this.filter.frequency);
    this.lfo.start();

    this.subOsc = this.ctx.createOscillator();
    this.subOsc.type = 'sine';
    this.subOsc.frequency.setValueAtTime(this.currentPreset.subFreq, this.ctx.currentTime);
    this.subGain = this.ctx.createGain();
    this.subGain.gain.setValueAtTime(0.5, this.ctx.currentTime);
    this.subOsc.connect(this.subGain);
    this.subGain.connect(this.filter);
    this.subOsc.start();

    this.padOscs = [];
    this.padGains = [];
    this.currentPreset.chordIntervals.forEach((interval, idx) => {
      if (!this.ctx || !this.filter) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = idx % 2 === 0 ? 'sine' : 'triangle';
      osc.frequency.setValueAtTime(this.currentPreset.baseFreq * interval, this.ctx.currentTime);
      osc.detune.setValueAtTime((idx - 1.5) * 4, this.ctx.currentTime);
      gain.gain.setValueAtTime(0.25 / (idx + 1), this.ctx.currentTime);
      osc.connect(gain);
      gain.connect(this.filter);
      osc.start();
      this.padOscs.push(osc);
      this.padGains.push(gain);
    });

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
      output[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.11;
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
    if (!this.ctx) this.initContext();
    if (this.ctx?.state === 'suspended') await this.ctx.resume();
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
    this.isPlaying ? this.pause() : this.play();
  }

  public setVolume(newVol: number) {
    this.volume = Math.max(0, Math.min(1, newVol));
    if (this.masterGain && this.ctx && this.isPlaying) {
      this.masterGain.gain.cancelScheduledValues(this.ctx.currentTime);
      this.masterGain.gain.linearRampToValueAtTime(this.volume, this.ctx.currentTime + 0.1);
    }
    this.notify();
  }

  public transitionToPreset(preset: SoundscapePreset) {
    this.currentPreset = preset;
    if (!this.ctx || !this.isPlaying) { this.notify(); return; }
    const now = this.ctx.currentTime;
    const fade = 3.0;
    this.filter?.frequency.cancelScheduledValues(now);
    this.filter?.frequency.exponentialRampToValueAtTime(Math.max(20, preset.filterCutoff), now + fade);
    this.subOsc?.frequency.cancelScheduledValues(now);
    this.subOsc?.frequency.exponentialRampToValueAtTime(Math.max(20, preset.subFreq), now + fade);
    this.padOscs.forEach((osc, idx) => {
      const freq = preset.baseFreq * (preset.chordIntervals[idx] || 1.0);
      osc.frequency.cancelScheduledValues(now);
      osc.frequency.exponentialRampToValueAtTime(Math.max(20, freq), now + fade);
    });
    this.lfo?.frequency.cancelScheduledValues(now);
    this.lfo?.frequency.linearRampToValueAtTime(preset.modSpeed, now + fade);
    this.noiseGain?.gain.cancelScheduledValues(now);
    this.noiseGain?.gain.linearRampToValueAtTime(preset.noiseLevel, now + fade);
    this.notify();
  }

  public transitionForStoryNode(title: string, text: string, depth: string) {
    this.transitionToPreset(this.getPresetForStoryNode(title, text, depth));
  }

  /**
   * Subtle soft click — a quiet sine blip at ~900 Hz that decays in ~80 ms.
   * Barely audible but gives tactile audio feedback on every button press.
   * Safe to call without checking ctx state; initialises context if needed.
   */
  public playButtonClick() {
    try {
      if (!this.ctx) this.initContext();
      if (!this.ctx) return;
      if (this.ctx.state === 'suspended') this.ctx.resume();

      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(900, now);
      osc.frequency.exponentialRampToValueAtTime(600, now + 0.06);

      gain.gain.setValueAtTime(0, now);
      gain.gain.linearRampToValueAtTime(0.08, now + 0.005);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.08);

      osc.connect(gain);
      gain.connect(this.masterGain ?? this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.1);
    } catch (err) {
      // Silently swallow — button sound failing is never critical
    }
  }

  public playUnlockChime() {
    try {
      if (!this.ctx) this.initContext();
      if (!this.ctx) return;
      if (this.ctx.state === 'suspended') this.ctx.resume();

      const now = this.ctx.currentTime;
      const baseFrequency = this.currentPreset.baseFreq ? this.currentPreset.baseFreq * 2.5 : 432;
      const chimeMasterGain = this.ctx.createGain();
      chimeMasterGain.gain.setValueAtTime(0, now);
      chimeMasterGain.gain.linearRampToValueAtTime(0.35, now + 0.04);
      chimeMasterGain.gain.exponentialRampToValueAtTime(0.0001, now + 3.2);
      chimeMasterGain.connect(this.masterGain ?? this.ctx.destination);

      [1.0, 1.25, 1.5, 2.5].forEach((ratio, idx) => {
        if (!this.ctx) return;
        const osc = this.ctx.createOscillator();
        const voiceGain = this.ctx.createGain();
        const filter = this.ctx.createBiquadFilter();
        osc.type = idx % 2 === 0 ? 'sine' : 'triangle';
        const freq = baseFrequency * ratio;
        osc.frequency.setValueAtTime(freq, now + idx * 0.12);
        osc.frequency.exponentialRampToValueAtTime(freq * 1.015, now + idx * 0.12 + 2.0);
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(800, now);
        filter.frequency.exponentialRampToValueAtTime(3500 + idx * 500, now + 0.3);
        filter.frequency.exponentialRampToValueAtTime(400, now + 2.8);
        const d = idx * 0.12;
        voiceGain.gain.setValueAtTime(0, now + d);
        voiceGain.gain.linearRampToValueAtTime(0.25 / (idx + 1), now + d + 0.05);
        voiceGain.gain.exponentialRampToValueAtTime(0.0001, now + d + 2.5);
        osc.connect(filter);
        filter.connect(voiceGain);
        voiceGain.connect(chimeMasterGain);
        osc.start(now + d);
        osc.stop(now + d + 3.0);
      });
    } catch (err) {
      console.warn('AudioEngine unlock chime trigger error:', err);
    }
  }

  public getPreset() { return this.currentPreset; }
  public getIsPlaying() { return this.isPlaying; }
  public getVolume() { return this.volume; }
}

export const audioEngine = new AudioEngine();

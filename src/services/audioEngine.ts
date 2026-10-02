import { Track, EqualizerBand } from '../types/music';

export const EQ_FREQUENCIES = [31, 63, 125, 250, 500, 1000, 2000, 4000, 8000, 16000];

export class AudioEngine {
  private static instance: AudioEngine;
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private analyser: AnalyserNode | null = null;
  private eqFilters: BiquadFilterNode[] = [];
  private bassBoostFilter: BiquadFilterNode | null = null;
  private pannerNode: StereoPannerNode | null = null;
  private pannerAngle = 0;
  private pannerInterval: number | null = null;

  // File audio playback
  private audioElement: HTMLAudioElement | null = null;
  private audioSourceNode: MediaElementAudioSourceNode | null = null;

  // Synthesizer playback state
  private isSynthPlaying = false;
  private synthInterval: number | null = null;
  private synthStep = 0;
  private currentTrack: Track | null = null;
  private playbackStartTime = 0;
  private pausedAtTime = 0;
  private isCustomPlaying = false;

  private onTimeUpdateCallback: ((time: number) => void) | null = null;
  private onEndedCallback: (() => void) | null = null;

  private constructor() {}

  public static getInstance(): AudioEngine {
    if (!AudioEngine.instance) {
      AudioEngine.instance = new AudioEngine();
    }
    return AudioEngine.instance;
  }

  public init() {
    if (this.ctx) return;
    const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    this.ctx = new AudioCtx();

    // Master Gain
    this.masterGain = this.ctx.createGain();
    this.masterGain.gain.value = 0.85;

    // Analyser Node
    this.analyser = this.ctx.createAnalyser();
    this.analyser.fftSize = 128;
    this.analyser.smoothingTimeConstant = 0.8;

    // Bass Boost Filter
    this.bassBoostFilter = this.ctx.createBiquadFilter();
    this.bassBoostFilter.type = 'lowshelf';
    this.bassBoostFilter.frequency.value = 100;
    this.bassBoostFilter.gain.value = 0;

    // Stereo Panner (for 8D audio)
    if (this.ctx.createStereoPanner) {
      this.pannerNode = this.ctx.createStereoPanner();
    }

    // 10-Band EQ filters
    this.eqFilters = EQ_FREQUENCIES.map((freq, i) => {
      const filter = this.ctx!.createBiquadFilter();
      if (i === 0) {
        filter.type = 'lowshelf';
      } else if (i === EQ_FREQUENCIES.length - 1) {
        filter.type = 'highshelf';
      } else {
        filter.type = 'peaking';
        filter.Q.value = 1.4;
      }
      filter.frequency.value = freq;
      filter.gain.value = 0;
      return filter;
    });

    // Wire up filter chain:
    // eq[0] -> eq[1] -> ... -> eq[9] -> bassBoost -> (panner) -> masterGain -> analyser -> destination
    for (let i = 0; i < this.eqFilters.length - 1; i++) {
      this.eqFilters[i].connect(this.eqFilters[i + 1]);
    }

    const lastEq = this.eqFilters[this.eqFilters.length - 1];
    lastEq.connect(this.bassBoostFilter);

    if (this.pannerNode) {
      this.bassBoostFilter.connect(this.pannerNode);
      this.pannerNode.connect(this.masterGain);
    } else {
      this.bassBoostFilter.connect(this.masterGain);
    }

    this.masterGain.connect(this.analyser);
    this.analyser.connect(this.ctx.destination);
  }

  public setCallbacks(onTimeUpdate: (time: number) => void, onEnded: () => void) {
    this.onTimeUpdateCallback = onTimeUpdate;
    this.onEndedCallback = onEnded;
  }

  public playTrack(track: Track, startTime = 0) {
    this.init();
    if (this.ctx?.state === 'suspended') {
      this.ctx.resume();
    }

    this.stop();
    this.currentTrack = track;
    this.pausedAtTime = startTime;

    if (track.isCustomFile && track.fileUrl) {
      this.playCustomAudio(track.fileUrl, startTime);
    } else {
      this.playSynthTrack(track, startTime);
    }
  }

  private playCustomAudio(url: string, startTime: number) {
    if (!this.ctx || !this.eqFilters[0]) return;
    this.isCustomPlaying = true;

    if (!this.audioElement) {
      this.audioElement = new Audio();
      this.audioElement.crossOrigin = 'anonymous';
      this.audioSourceNode = this.ctx.createMediaElementSource(this.audioElement);
      this.audioSourceNode.connect(this.eqFilters[0]);

      this.audioElement.addEventListener('timeupdate', () => {
        if (this.onTimeUpdateCallback && this.audioElement) {
          this.onTimeUpdateCallback(this.audioElement.currentTime);
        }
      });

      this.audioElement.addEventListener('ended', () => {
        if (this.onEndedCallback) {
          this.onEndedCallback();
        }
      });
    }

    this.audioElement.src = url;
    this.audioElement.currentTime = startTime;
    this.audioElement.play().catch(() => {
      // Autoplay fallback
    });
  }

  private playSynthTrack(track: Track, startTime: number) {
    if (!this.ctx) return;
    this.isSynthPlaying = true;
    this.isCustomPlaying = false;
    this.playbackStartTime = this.ctx.currentTime - startTime;

    const bpm = track.bpm || 120;
    const intervalMs = (60 / bpm / 4) * 1000; // 16th note interval
    this.synthStep = Math.floor((startTime / (60 / bpm)) * 4);

    // Track progression notes based on musical key
    // Using rich pentatonic / minor modes
    const rootFreq = this.getRootFreqForTrack(track.id);
    const chords = this.getChordProgression(track.genre, rootFreq);

    this.synthInterval = window.setInterval(() => {
      if (!this.isSynthPlaying || !this.ctx) return;

      const elapsed = this.ctx.currentTime - this.playbackStartTime;
      if (this.onTimeUpdateCallback) {
        this.onTimeUpdateCallback(elapsed);
      }

      if (elapsed >= track.duration) {
        this.stop();
        if (this.onEndedCallback) this.onEndedCallback();
        return;
      }

      this.renderSynthStep(track, this.synthStep, chords);
      this.synthStep++;
    }, intervalMs);
  }

  private getRootFreqForTrack(id: string): number {
    switch (id) {
      case 'track-1': return 130.81; // C3 (Synthwave)
      case 'track-2': return 146.83; // D3 (Chillhop)
      case 'track-3': return 110.00; // A2 (Cyber Electro)
      case 'track-4': return 164.81; // E3 (Ambient)
      case 'track-5': return 123.47; // B2 (Lo-Fi)
      case 'track-6': return 138.59; // C#3 (Future Electro)
      case 'track-7': return 174.61; // F3 (Nu-Disco)
      default: return 146.83; // D3
    }
  }

  private getChordProgression(genre: string, root: number): number[][] {
    // Return 4 chords (each chord is an array of frequencies)
    if (genre.includes('Synthwave') || genre.includes('Electro')) {
      // i - VI - III - VII
      return [
        [root, root * 1.2, root * 1.5], // Minor
        [root * 0.8, root, root * 1.25], // VI
        [root * 1.2, root * 1.5, root * 1.8], // III
        [root * 1.05, root * 1.33, root * 1.6], // VII
      ];
    } else if (genre.includes('Chill') || genre.includes('Lo-Fi')) {
      // ii7 - V7 - Imaj7 - VI7 (Jazz / Neo-soul)
      return [
        [root * 1.12, root * 1.33, root * 1.6, root * 2],
        [root * 1.5, root * 1.88, root * 2.25, root * 2.66],
        [root, root * 1.25, root * 1.5, root * 1.88],
        [root * 0.89, root * 1.12, root * 1.33, root * 1.6],
      ];
    } else {
      // Pop / Nu-Disco
      return [
        [root, root * 1.25, root * 1.5],
        [root * 1.33, root * 1.66, root * 2],
        [root * 1.5, root * 1.88, root * 2.25],
        [root * 1.12, root * 1.33, root * 1.66],
      ];
    }
  }

  private renderSynthStep(track: Track, step: number, chords: number[][]) {
    if (!this.ctx || !this.eqFilters[0]) return;
    const now = this.ctx.currentTime;
    const chordIndex = Math.floor((step / 16) % chords.length);
    const currentChord = chords[chordIndex];
    const beatInBar = step % 16;

    // 1. Kick Drum on beats 0, 4, 8, 12
    if (beatInBar === 0 || beatInBar === 8 || (track.genre.includes('Electro') && (beatInBar === 4 || beatInBar === 12))) {
      this.triggerKick(now);
    }

    // 2. Snare / Clap on beats 4 and 12
    if (beatInBar === 4 || beatInBar === 12) {
      this.triggerSnare(now, track.genre.includes('Chill') ? 0.3 : 0.5);
    }

    // 3. Hi-Hats on every second 16th note
    if (beatInBar % 2 === 0) {
      this.triggerHiHat(now, beatInBar % 4 === 2);
    }

    // 4. Bass synth: driving rhythm
    if (beatInBar % 4 === 0 || beatInBar % 4 === 2) {
      const bassNote = currentChord[0] * 0.5;
      this.triggerBass(now, bassNote, (60 / track.bpm / 4) * 1.8);
    }

    // 5. Ambient Pad / Chords on every downbeat of bar
    if (beatInBar === 0) {
      this.triggerPad(now, currentChord, (60 / track.bpm) * 3.8);
    }

    // 6. Arpeggiator / Lead melody
    if (beatInBar % 2 === 1 || beatInBar === 14) {
      const arpNote = currentChord[(step * 2) % currentChord.length] * (step % 8 < 4 ? 2 : 2.5);
      this.triggerLead(now, arpNote, 0.25);
    }
  }

  private triggerKick(time: number) {
    if (!this.ctx || !this.eqFilters[0]) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.frequency.setValueAtTime(140, time);
    osc.frequency.exponentialRampToValueAtTime(38, time + 0.12);

    gain.gain.setValueAtTime(0.7, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + 0.25);

    osc.connect(gain);
    gain.connect(this.eqFilters[0]);

    osc.start(time);
    osc.stop(time + 0.25);
  }

  private triggerSnare(time: number, volume = 0.5) {
    if (!this.ctx || !this.eqFilters[0]) return;
    // Tone component
    const osc = this.ctx.createOscillator();
    const oscGain = this.ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(180, time);
    osc.frequency.exponentialRampToValueAtTime(60, time + 0.1);
    oscGain.gain.setValueAtTime(volume * 0.4, time);
    oscGain.gain.exponentialRampToValueAtTime(0.001, time + 0.1);
    osc.connect(oscGain);
    oscGain.connect(this.eqFilters[0]);
    osc.start(time);
    osc.stop(time + 0.1);

    // Noise component
    const bufferSize = this.ctx.sampleRate * 0.18;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }
    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'highpass';
    filter.frequency.value = 1000;

    const noiseGain = this.ctx.createGain();
    noiseGain.gain.setValueAtTime(volume * 0.5, time);
    noiseGain.gain.exponentialRampToValueAtTime(0.001, time + 0.18);

    noise.connect(filter);
    filter.connect(noiseGain);
    noiseGain.connect(this.eqFilters[0]);

    noise.start(time);
    noise.stop(time + 0.18);
  }

  private triggerHiHat(time: number, accented = false) {
    if (!this.ctx || !this.eqFilters[0]) return;
    const bufferSize = this.ctx.sampleRate * 0.05;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }
    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'highpass';
    filter.frequency.value = 7000;

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(accented ? 0.25 : 0.12, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + (accented ? 0.06 : 0.035));

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.eqFilters[0]);

    noise.start(time);
    noise.stop(time + 0.06);
  }

  private triggerBass(time: number, freq: number, duration: number) {
    if (!this.ctx || !this.eqFilters[0]) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const filter = this.ctx.createBiquadFilter();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(freq, time);

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(450, time);
    filter.frequency.exponentialRampToValueAtTime(150, time + duration);

    gain.gain.setValueAtTime(0.45, time);
    gain.gain.linearRampToValueAtTime(0.35, time + duration * 0.5);
    gain.gain.exponentialRampToValueAtTime(0.001, time + duration);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.eqFilters[0]);

    osc.start(time);
    osc.stop(time + duration);
  }

  private triggerPad(time: number, chord: number[], duration: number) {
    if (!this.ctx || !this.eqFilters[0]) return;
    chord.forEach((freq) => {
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();
      const filter = this.ctx!.createBiquadFilter();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, time);

      filter.type = 'lowpass';
      filter.frequency.value = 800;

      // Soft envelope
      gain.gain.setValueAtTime(0.001, time);
      gain.gain.linearRampToValueAtTime(0.12, time + 0.5);
      gain.gain.exponentialRampToValueAtTime(0.001, time + duration);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.eqFilters[0]);

      osc.start(time);
      osc.stop(time + duration);
    });
  }

  private triggerLead(time: number, freq: number, duration: number) {
    if (!this.ctx || !this.eqFilters[0]) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const filter = this.ctx.createBiquadFilter();

    osc.type = 'square';
    osc.frequency.setValueAtTime(freq, time);

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(2200, time);
    filter.frequency.exponentialRampToValueAtTime(600, time + duration);

    gain.gain.setValueAtTime(0.18, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + duration);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.eqFilters[0]);

    osc.start(time);
    osc.stop(time + duration);
  }

  public pause() {
    if (this.isCustomPlaying && this.audioElement) {
      this.audioElement.pause();
    }
    if (this.isSynthPlaying && this.ctx) {
      this.pausedAtTime = this.ctx.currentTime - this.playbackStartTime;
      this.isSynthPlaying = false;
      if (this.synthInterval) {
        clearInterval(this.synthInterval);
        this.synthInterval = null;
      }
    }
  }

  public resume() {
    if (!this.currentTrack) return;
    if (this.isCustomPlaying && this.audioElement) {
      this.audioElement.play();
    } else {
      this.playSynthTrack(this.currentTrack, this.pausedAtTime);
    }
  }

  public stop() {
    this.isSynthPlaying = false;
    this.isCustomPlaying = false;
    if (this.synthInterval) {
      clearInterval(this.synthInterval);
      this.synthInterval = null;
    }
    if (this.audioElement) {
      this.audioElement.pause();
      this.audioElement.currentTime = 0;
    }
  }

  public seek(seconds: number) {
    if (this.isCustomPlaying && this.audioElement) {
      this.audioElement.currentTime = seconds;
    } else if (this.currentTrack) {
      const wasPlaying = this.isSynthPlaying;
      this.stop();
      this.pausedAtTime = seconds;
      if (wasPlaying) {
        this.playSynthTrack(this.currentTrack, seconds);
      } else if (this.onTimeUpdateCallback) {
        this.onTimeUpdateCallback(seconds);
      }
    }
  }

  public setVolume(vol: number) {
    this.init();
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setValueAtTime(Math.max(0, Math.min(1, vol)), this.ctx.currentTime);
    }
  }

  public setEqualizerBand(index: number, gainDb: number) {
    this.init();
    if (this.eqFilters[index] && this.ctx) {
      this.eqFilters[index].gain.setValueAtTime(gainDb, this.ctx.currentTime);
    }
  }

  public setBassBoost(gainDb: number) {
    this.init();
    if (this.bassBoostFilter && this.ctx) {
      this.bassBoostFilter.gain.setValueAtTime(gainDb, this.ctx.currentTime);
    }
  }

  public setSpatial8D(enabled: boolean) {
    this.init();
    if (!this.pannerNode) return;

    if (enabled) {
      if (!this.pannerInterval) {
        this.pannerInterval = window.setInterval(() => {
          if (!this.pannerNode || !this.ctx) return;
          this.pannerAngle += 0.05;
          const pan = Math.sin(this.pannerAngle);
          this.pannerNode.pan.setValueAtTime(pan, this.ctx.currentTime);
        }, 50);
      }
    } else {
      if (this.pannerInterval) {
        clearInterval(this.pannerInterval);
        this.pannerInterval = null;
      }
      if (this.pannerNode && this.ctx) {
        this.pannerNode.pan.setValueAtTime(0, this.ctx.currentTime);
      }
    }
  }

  public getFrequencyData(array: Uint8Array<ArrayBuffer>) {
    if (this.analyser) {
      this.analyser.getByteFrequencyData(array);
    }
  }

  // Authentic Windows Phone gentle UI tap feedback sound
  public playClickSound() {
    try {
      this.init();
      if (!this.ctx) return;
      if (this.ctx.state === 'suspended') {
        this.ctx.resume();
      }
      const time = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(1400, time);
      osc.frequency.exponentialRampToValueAtTime(600, time + 0.015);

      gain.gain.setValueAtTime(0.08, time);
      gain.gain.exponentialRampToValueAtTime(0.0001, time + 0.018);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(time);
      osc.stop(time + 0.02);
    } catch {
      // Audio click sound ignore
    }
  }
}

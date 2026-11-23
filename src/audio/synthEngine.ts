import { MusicGenre, SongMood } from '../types/game';

class SynthAudioEngine {
  private ctx: AudioContext | null = null;
  private isPlaying = false;
  private muted = false;
  private stepTimer: number | null = null;
  private currentStep = 0;
  private onTickCallback: ((step: number) => void) | null = null;

  private ensureContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
    return this.ctx;
  }

  public setMuted(muted: boolean) {
    this.muted = muted;
    if (muted) {
      this.stopSong();
    }
  }

  public getMuted(): boolean {
    return this.muted;
  }

  public playSfx(type: 'tap' | 'cash' | 'record' | 'advance' | 'notification' | 'chart_hit') {
    if (this.muted) return;
    const ctx = this.ensureContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);

    switch (type) {
      case 'tap': {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(520, now);
        osc.frequency.exponentialRampToValueAtTime(340, now + 0.045);
        gain.gain.setValueAtTime(0.05, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);
        osc.start(now);
        osc.stop(now + 0.055);
        break;
      }
      case 'cash': {
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(880, now);
        osc.frequency.setValueAtTime(1318.5, now + 0.06);
        gain.gain.setValueAtTime(0.09, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.22);
        osc.start(now);
        osc.stop(now + 0.24);
        break;
      }
      case 'record': {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(440, now);
        osc.frequency.setValueAtTime(554.37, now + 0.07);
        osc.frequency.setValueAtTime(659.25, now + 0.14);
        gain.gain.setValueAtTime(0.08, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.28);
        osc.start(now);
        osc.stop(now + 0.3);
        break;
      }
      case 'advance': {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(320, now);
        osc.frequency.exponentialRampToValueAtTime(480, now + 0.09);
        gain.gain.setValueAtTime(0.05, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.1);
        osc.start(now);
        osc.stop(now + 0.11);
        break;
      }
      case 'notification': {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(784, now);
        osc.frequency.setValueAtTime(1046.5, now + 0.08);
        gain.gain.setValueAtTime(0.07, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.24);
        osc.start(now);
        osc.stop(now + 0.25);
        break;
      }
      case 'chart_hit': {
        const notes = [523.25, 659.25, 783.99, 1046.5];
        notes.forEach((freq, idx) => {
          const o = ctx.createOscillator();
          const g = ctx.createGain();
          o.type = 'triangle';
          o.frequency.setValueAtTime(freq, now + idx * 0.07);
          g.gain.setValueAtTime(0.08, now + idx * 0.07);
          g.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.07 + 0.25);
          o.connect(g);
          g.connect(ctx.destination);
          o.start(now + idx * 0.07);
          o.stop(now + idx * 0.07 + 0.26);
        });
        break;
      }
    }
  }

  public startSong(
    params: { bpm: number; genre: MusicGenre; mood: SongMood; seed: number },
    onTick?: (step: number) => void
  ) {
    this.stopSong();
    if (this.muted) return;

    const ctx = this.ensureContext();
    if (!ctx) return;

    this.isPlaying = true;
    this.currentStep = 0;
    this.onTickCallback = onTick || null;

    const stepMs = (60 / Math.max(70, Math.min(170, params.bpm)) / 4) * 1000;

    // Scales by mood
    const minorScale = [220, 261.63, 293.66, 329.63, 392.0, 440, 523.25];
    const majorScale = [261.63, 293.66, 329.63, 392.0, 440, 523.25, 587.33];
    const scale =
      params.mood === 'Hype' || params.mood === 'Flex' || params.mood === 'Chill'
        ? majorScale
        : minorScale;

    const bassRoot = params.mood === 'Dark' ? 55 : 65.41;

    const triggerKick = (time: number) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(135, time);
      osc.frequency.exponentialRampToValueAtTime(38, time + 0.14);
      gain.gain.setValueAtTime(0.28, time);
      gain.gain.exponentialRampToValueAtTime(0.001, time + 0.18);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(time);
      osc.stop(time + 0.19);
    };

    const triggerSnare = (time: number) => {
      const bufferSize = ctx.sampleRate * 0.09;
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.35));
      }
      const noise = ctx.createBufferSource();
      noise.buffer = buffer;
      const filter = ctx.createBiquadFilter();
      filter.type = 'highpass';
      filter.frequency.value = 1100;
      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.12, time);
      gain.gain.exponentialRampToValueAtTime(0.001, time + 0.09);
      noise.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);
      noise.start(time);
    };

    const triggerHat = (time: number, accent = false) => {
      const bufferSize = ctx.sampleRate * 0.03;
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.25));
      }
      const noise = ctx.createBufferSource();
      noise.buffer = buffer;
      const filter = ctx.createBiquadFilter();
      filter.type = 'highpass';
      filter.frequency.value = 6500;
      const gain = ctx.createGain();
      gain.gain.setValueAtTime(accent ? 0.06 : 0.03, time);
      gain.gain.exponentialRampToValueAtTime(0.001, time + 0.03);
      noise.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);
      noise.start(time);
    };

    const triggerSynth = (time: number, freq: number, dur: number, vol = 0.065) => {
      const osc = ctx.createOscillator();
      const filter = ctx.createBiquadFilter();
      const gain = ctx.createGain();
      osc.type = params.genre === 'Rock' || params.genre === 'Trap' ? 'sawtooth' : 'triangle';
      osc.frequency.setValueAtTime(freq, time);
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(params.genre === 'R&B' ? 1200 : 2100, time);
      gain.gain.setValueAtTime(vol, time);
      gain.gain.exponentialRampToValueAtTime(0.001, time + dur);
      osc.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);
      osc.start(time);
      osc.stop(time + dur + 0.01);
    };

    this.stepTimer = window.setInterval(() => {
      if (!this.isPlaying || this.muted) return;
      const step = this.currentStep % 16;
      const now = ctx.currentTime;

      // Kick pattern
      if (step === 0 || step === 6 || (params.genre === 'Trap' && step === 10) || (params.genre === 'Pop' && (step === 4 || step === 8 || step === 12))) {
        triggerKick(now);
      }

      // Snare / Clap on 4 & 12
      if (step === 4 || step === 12) {
        triggerSnare(now);
      }

      // Hi-hats
      if (step % 2 === 0 || (params.genre === 'Trap' && (step === 7 || step === 11))) {
        triggerHat(now, step % 4 === 0);
      }

      // 808 Bass on downbeats
      if (step === 0 || step === 6 || step === 10) {
        const bassMult = step === 10 ? 1.122 : 1;
        triggerSynth(now, bassRoot * bassMult, 0.24, 0.12);
      }

      // Melody lead derived from seed
      if (step % 2 === 0) {
        const idx = (params.seed + step * 3 + Math.floor(this.currentStep / 16)) % scale.length;
        if ((params.seed + step) % 3 !== 0) {
          triggerSynth(now, scale[idx], 0.16, 0.055);
        }
      }

      if (this.onTickCallback) {
        this.onTickCallback(this.currentStep);
      }
      this.currentStep++;
    }, stepMs);
  }

  public stopSong() {
    this.isPlaying = false;
    if (this.stepTimer !== null) {
      window.clearInterval(this.stepTimer);
      this.stepTimer = null;
    }
    this.onTickCallback = null;
  }
}

export const synthAudio = new SynthAudioEngine();

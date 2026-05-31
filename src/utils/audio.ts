/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

class AudioEngine {
  private ctx: AudioContext | null = null;
  private muted: boolean = false;

  constructor() {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('aviator_muted');
      this.muted = saved === 'true';
    }
  }

  setMuted(m: boolean) {
    this.muted = m;
    if (typeof window !== 'undefined') {
      localStorage.setItem('aviator_muted', String(m));
    }
  }

  isMuted() {
    return this.muted;
  }

  private initCtx(): AudioContext | null {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtxClass = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtxClass) {
        this.ctx = new AudioCtxClass();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
    return this.ctx;
  }

  playFlightStart() {
    if (this.muted) return;
    const ctx = this.initCtx();
    if (!ctx) return;

    try {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);

      // Pitch sweep up (resembling airplane engine take-off)
      const now = ctx.currentTime;
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(140, now);
      osc.frequency.exponentialRampToValueAtTime(480, now + 0.7);

      gain.gain.setValueAtTime(0.01, now);
      gain.gain.linearRampToValueAtTime(0.12, now + 0.1);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.7);

      osc.start(now);
      osc.stop(now + 0.7);
    } catch (e) {
      console.warn('Audio playback failed', e);
    }
  }

  playCashout() {
    if (this.muted) return;
    const ctx = this.initCtx();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;

      // Primary double chime
      const o1 = ctx.createOscillator();
      const g1 = ctx.createGain();
      o1.connect(g1);
      g1.connect(ctx.destination);
      o1.type = 'sine';
      o1.frequency.setValueAtTime(523.25, now); // C5
      g1.gain.setValueAtTime(0.01, now);
      g1.gain.linearRampToValueAtTime(0.18, now + 0.05);
      g1.gain.exponentialRampToValueAtTime(0.01, now + 0.35);
      o1.start(now);
      o1.stop(now + 0.35);

      const o2 = ctx.createOscillator();
      const g2 = ctx.createGain();
      o2.connect(g2);
      g2.connect(ctx.destination);
      o2.type = 'sine';
      o2.frequency.setValueAtTime(783.99, now + 0.1); // G5
      g2.gain.setValueAtTime(0.01, now + 0.1);
      g2.gain.linearRampToValueAtTime(0.18, now + 0.15);
      g2.gain.exponentialRampToValueAtTime(0.01, now + 0.5);
      o2.start(now + 0.1);
      o2.stop(now + 0.5);
    } catch (e) {
      console.warn('Audio playback failed', e);
    }
  }

  playCrash() {
    if (this.muted) return;
    const ctx = this.initCtx();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;

      // Heavy rumble/downward pitch sweep
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(220, now);
      osc.frequency.linearRampToValueAtTime(50, now + 0.85);

      gain.gain.setValueAtTime(0.01, now);
      gain.gain.linearRampToValueAtTime(0.25, now + 0.05);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.85);

      // Low sub-bass thud generator
      const subOsc = ctx.createOscillator();
      const subGain = ctx.createGain();
      subOsc.connect(subGain);
      subGain.connect(ctx.destination);
      subOsc.type = 'sawtooth';
      subOsc.frequency.setValueAtTime(75, now);
      subOsc.frequency.linearRampToValueAtTime(25, now + 0.5);

      subGain.gain.setValueAtTime(0.01, now);
      subGain.gain.linearRampToValueAtTime(0.18, now + 0.05);
      subGain.gain.exponentialRampToValueAtTime(0.01, now + 0.5);

      osc.start(now);
      osc.stop(now + 0.85);

      subOsc.start(now);
      subOsc.stop(now + 0.5);
    } catch (e) {
      console.warn('Audio playback failed', e);
    }
  }
}

export const audioEngine = new AudioEngine();

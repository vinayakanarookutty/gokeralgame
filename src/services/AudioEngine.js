/**
 * AudioEngine.js
 * Synthesizes authentic Kerala Chenda percussion rhythms,
 * temple bells, ambient backwater/monsoon soundscapes, and game SFX
 * using the Web Audio API (no external asset download required!).
 */

class AudioEngine {
  constructor() {
    this.ctx = null;
    this.isMuted = false;
    this.isPlayingMusic = false;
    this.bpm = 100;
    this.step = 0;
    this.timerId = null;
    this.ambientNodes = [];
    this.location = 'ALAPPUZHA';
  }

  init() {
    if (!this.ctx) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (AudioContext) {
        this.ctx = new AudioContext();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  toggleMute() {
    this.isMuted = !this.isMuted;
    return this.isMuted;
  }

  setSpeedMultiplier(multiplier) {
    // Ramp up Chenda rhythm tempo as game speeds up!
    this.bpm = Math.min(180, Math.floor(105 * multiplier));
  }

  setLocation(loc) {
    this.location = loc;
  }

  startMusic() {
    this.init();
    if (!this.ctx || this.isPlayingMusic) return;
    this.isPlayingMusic = true;
    this.scheduleNextBeat();
  }

  stopMusic() {
    this.isPlayingMusic = false;
    if (this.timerId) {
      clearTimeout(this.timerId);
      this.timerId = null;
    }
  }

  scheduleNextBeat = () => {
    if (!this.isPlayingMusic || !this.ctx) return;

    if (!this.isMuted) {
      this.playChendaStep(this.step % 16);
    }
    this.step++;

    const intervalMs = (60 / this.bpm / 4) * 1000;
    this.timerId = setTimeout(this.scheduleNextBeat, intervalMs);
  };

  /**
   * Authentic Kerala Chenda percussion synthesizer
   * Dheem (low resonant body), Tha (crisp stick snap), Ki (light ghost tap), Ta (sharp rim stroke)
   */
  playChendaStep(step) {
    const t = this.ctx.currentTime;

    // Pandi Melam rhythm pattern:
    // Beat 0: Dheem (heavy)
    // Beat 2: Tha (snap)
    // Beat 4: Dheem + bell
    // Beat 6: Tha
    // Beat 8, 10, 12, 14: Polyrhythmic accents
    if (step === 0 || step === 8) {
      this.playChendaDheem(t, 1.0);
    } else if (step === 4 || step === 12) {
      this.playChendaDheem(t, 0.7);
      this.playElathalam(t, 0.4); // Kerala bronze cymbal
    } else if (step % 2 === 0) {
      this.playChendaTha(t, 0.7);
    } else if (step % 4 === 3 && this.bpm > 120) {
      // Faster syncopated ghost note
      this.playChendaTha(t, 0.3, 380);
    }

    // Special Thrissur Pooram festival rhythm: more intense Elathalam cymbal clangs
    if (this.location === 'THRISSUR' && (step === 0 || step === 4 || step === 8 || step === 12)) {
      this.playElathalam(t, 0.6);
    }
  }

  playChendaDheem(time, volume = 0.8) {
    if (!this.ctx) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(140, time);
    osc.frequency.exponentialRampToValueAtTime(55, time + 0.16);

    gain.gain.setValueAtTime(volume * 0.7, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + 0.22);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(time);
    osc.stop(time + 0.22);
  }

  playChendaTha(time, volume = 0.6, baseFreq = 320) {
    if (!this.ctx) return;
    // Crisp stick strike with slight noise burst
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(baseFreq, time);
    osc.frequency.exponentialRampToValueAtTime(180, time + 0.08);

    gain.gain.setValueAtTime(volume * 0.6, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + 0.09);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(time);
    osc.stop(time + 0.09);
  }

  playElathalam(time, volume = 0.4) {
    if (!this.ctx) return;
    // High metallic shimmer for Kerala bell/cymbal
    const osc1 = this.ctx.createOscillator();
    const osc2 = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc1.type = 'square';
    osc1.frequency.setValueAtTime(2450, time);
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(3280, time);

    gain.gain.setValueAtTime(volume * 0.2, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + 0.18);

    osc1.connect(gain);
    osc2.connect(gain);
    gain.connect(this.ctx.destination);

    osc1.start(time);
    osc2.start(time);
    osc1.stop(time + 0.18);
    osc2.stop(time + 0.18);
  }

  // --- Sound Effects ---

  playCoinSound() {
    this.init();
    if (!this.ctx || this.isMuted) return;
    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(880, t); // A5
    osc.frequency.exponentialRampToValueAtTime(1760, t + 0.14); // A6 (crystal chime)

    gain.gain.setValueAtTime(0.3, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.16);

    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(t);
    osc.stop(t + 0.16);
  }

  playJumpSound() {
    this.init();
    if (!this.ctx || this.isMuted) return;
    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(220, t);
    osc.frequency.exponentialRampToValueAtTime(650, t + 0.18);

    gain.gain.setValueAtTime(0.35, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.2);

    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(t);
    osc.stop(t + 0.2);
  }

  playSlideSound() {
    this.init();
    if (!this.ctx || this.isMuted) return;
    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(260, t);
    osc.frequency.exponentialRampToValueAtTime(90, t + 0.2);

    gain.gain.setValueAtTime(0.28, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.22);

    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(t);
    osc.stop(t + 0.22);
  }

  playLaneShiftSound() {
    this.init();
    if (!this.ctx || this.isMuted) return;
    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(440, t);
    osc.frequency.exponentialRampToValueAtTime(550, t + 0.08);

    gain.gain.setValueAtTime(0.15, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.09);

    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(t);
    osc.stop(t + 0.09);
  }

  playPowerupSound() {
    this.init();
    if (!this.ctx || this.isMuted) return;
    const t = this.ctx.currentTime;
    const notes = [523.25, 659.25, 783.99, 1046.5]; // C E G C chord
    notes.forEach((freq, idx) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const st = t + idx * 0.06;

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, st);

      gain.gain.setValueAtTime(0.25, st);
      gain.gain.exponentialRampToValueAtTime(0.001, st + 0.25);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(st);
      osc.stop(st + 0.25);
    });
  }

  playCrashSound() {
    this.init();
    if (!this.ctx || this.isMuted) return;
    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(120, t);
    osc.frequency.exponentialRampToValueAtTime(30, t + 0.35);

    gain.gain.setValueAtTime(0.6, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.38);

    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(t);
    osc.stop(t + 0.38);
  }
}

export const audioEngine = new AudioEngine();

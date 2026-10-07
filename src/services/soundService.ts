// Web Audio API Synthesizer for 100% offline, zero-asset, instant sound alerts

let audioCtx: AudioContext | null = null;

function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (AudioContextClass) {
      audioCtx = new AudioContextClass();
    }
  }
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

export function playWaterDropSound(volume: number = 80) {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;
    const now = ctx.currentTime;
    const gainNode = ctx.createGain();
    const osc = ctx.createOscillator();

    const masterGain = (volume / 100) * 0.4;
    gainNode.gain.setValueAtTime(masterGain, now);
    gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

    // Frequency sweep for water drop effect
    osc.type = 'sine';
    osc.frequency.setValueAtTime(800, now);
    osc.frequency.exponentialRampToValueAtTime(1400, now + 0.08);
    osc.frequency.exponentialRampToValueAtTime(600, now + 0.3);

    osc.connect(gainNode);
    gainNode.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.35);
  } catch (err) {
    console.warn('Audio playback not permitted yet:', err);
  }
}

export function playPillReminderSound(volume: number = 80, tone: string = 'gentle') {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;
    const now = ctx.currentTime;
    const masterGain = (volume / 100) * 0.35;

    if (tone === 'digital') {
      // Clean modern dual smartwatch beep
      [0, 0.14].forEach((offset, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'square';
        osc.frequency.setValueAtTime(idx === 0 ? 880 : 1174.66, now + offset);
        gain.gain.setValueAtTime(masterGain * 0.28, now + offset);
        gain.gain.exponentialRampToValueAtTime(0.001, now + offset + 0.08);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now + offset);
        osc.stop(now + offset + 0.09);
      });
      return;
    }

    if (tone === 'zen') {
      // Tibetan singing bowl meditation chime with rich harmonics
      const freqs = [528, 1056];
      freqs.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now);
        gain.gain.setValueAtTime(masterGain * (idx === 0 ? 0.7 : 0.3), now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 1.4);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 1.4);
      });
      return;
    }

    if (tone === 'chime') {
      // Harmonik Çan (Harmonic Bell Chime): Crisp, resonant metallic church/temple bell toll with sparkling overtone ring
      const chimeBells = [
        { freq: 880, overtone: 1760, time: 0 },       // A5 Bell Toll
        { freq: 1318.5, overtone: 2637, time: 0.18 }, // E6 Harmonic Chime
        { freq: 1760, overtone: 3520, time: 0.38 },   // A6 Crystal Sparkle
      ];

      chimeBells.forEach((bell) => {
        const t = now + bell.time;

        // Fundamental bell tone (triangle for metallic warmth)
        const osc1 = ctx.createOscillator();
        const gain1 = ctx.createGain();
        osc1.type = 'triangle';
        osc1.frequency.setValueAtTime(bell.freq, t);
        gain1.gain.setValueAtTime(masterGain * 0.5, t);
        gain1.gain.exponentialRampToValueAtTime(0.0001, t + 0.75);
        osc1.connect(gain1);
        gain1.connect(ctx.destination);
        osc1.start(t);
        osc1.stop(t + 0.8);

        // High shimmer overtone (sine for sparkling ring)
        const osc2 = ctx.createOscillator();
        const gain2 = ctx.createGain();
        osc2.type = 'sine';
        osc2.frequency.setValueAtTime(bell.overtone, t);
        gain2.gain.setValueAtTime(masterGain * 0.25, t);
        gain2.gain.exponentialRampToValueAtTime(0.0001, t + 0.6);
        osc2.connect(gain2);
        gain2.connect(ctx.destination);
        osc2.start(t);
        osc2.stop(t + 0.65);
      });
      return;
    }

    // Default 'gentle' (Nazik Melodi): Warm, soothing 4-note ascending lullaby arpeggio (C5 -> E5 -> G5 -> C6)
    const melodyNotes = [523.25, 659.25, 783.99, 1046.5];
    melodyNotes.forEach((freq, idx) => {
      const startTime = now + idx * 0.15;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, startTime);

      gain.gain.setValueAtTime(0.001, startTime);
      gain.gain.linearRampToValueAtTime(masterGain * 0.45, startTime + 0.03);
      gain.gain.exponentialRampToValueAtTime(0.0001, startTime + 0.48);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(startTime);
      osc.stop(startTime + 0.5);
    });
  } catch (err) {
    console.warn('Audio playback error:', err);
  }
}

export function playCelebrationSound(volume: number = 80) {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;
    const now = ctx.currentTime;
    const masterGain = (volume / 100) * 0.3;

    // Upbeat arpeggio: C5, E5, G5, C6
    const chord = [523.25, 659.25, 783.99, 1046.5];
    chord.forEach((freq, idx) => {
      const startTime = now + idx * 0.1;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, startTime);

      gain.gain.setValueAtTime(0.001, startTime);
      gain.gain.linearRampToValueAtTime(masterGain, startTime + 0.03);
      gain.gain.exponentialRampToValueAtTime(0.0001, startTime + 0.45);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(startTime);
      osc.stop(startTime + 0.5);
    });
  } catch (err) {
    console.warn('Celebration audio error:', err);
  }
}

export function triggerVibration(pattern: number[] = [150, 80, 150]) {
  if (typeof window !== 'undefined' && 'vibrate' in navigator) {
    try {
      navigator.vibrate(pattern);
    } catch {
      // Ignore vibration errors if blocked by browser policy
    }
  }
}

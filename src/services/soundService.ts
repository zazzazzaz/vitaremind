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
      // Clean modern dual beep
      [0, 0.15].forEach((offset) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'square';
        osc.frequency.setValueAtTime(880, now + offset);
        gain.gain.setValueAtTime(masterGain * 0.3, now + offset);
        gain.gain.exponentialRampToValueAtTime(0.001, now + offset + 0.08);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now + offset);
        osc.stop(now + offset + 0.09);
      });
      return;
    }

    if (tone === 'zen') {
      // Singing bowl chime
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(528, now); // Solfeggio frequency
      gain.gain.setValueAtTime(masterGain, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 1.2);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 1.2);
      return;
    }

    if (tone === 'chime') {
      // Harmonik Çan: High crystal bell chimes (E6, A6, B6)
      const chimeNotes = [1318.51, 1760.00, 1975.53];
      chimeNotes.forEach((freq, idx) => {
        const startTime = now + idx * 0.18;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, startTime);

        gain.gain.setValueAtTime(0.001, startTime);
        gain.gain.linearRampToValueAtTime(masterGain * 0.9, startTime + 0.01);
        gain.gain.exponentialRampToValueAtTime(0.0001, startTime + 0.8);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(startTime);
        osc.stop(startTime + 0.85);
      });
      return;
    }

    // Default 'gentle' (Nazik Melodi): Soft 3-note warm acoustic chord (C5, E5, G5)
    const gentleNotes = [523.25, 659.25, 783.99];
    gentleNotes.forEach((freq, idx) => {
      const startTime = now + idx * 0.12;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, startTime);

      gain.gain.setValueAtTime(0.001, startTime);
      gain.gain.linearRampToValueAtTime(masterGain * 0.8, startTime + 0.03);
      gain.gain.exponentialRampToValueAtTime(0.0001, startTime + 0.5);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(startTime);
      osc.stop(startTime + 0.55);
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
      gain.gain.linearRampToValueAtTime(masterGain * 0.03, startTime + 0.03);
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

/**
 * Background Keep-Alive Service for Android PWA
 * 
 * Android Chrome aggressively sleeps / throttles timers when the screen is locked
 * or when the user switches to another app. By maintaining an inaudible, silent audio 
 * stream when alarms are active, Android treats the PWA as an active media process 
 * and prevents freezing the timer and service worker.
 */

let silentAudio: HTMLAudioElement | null = null;
let isKeepAliveActive = false;

// Minimal base64 silent WAV file (1 second of silence, ~44 bytes)
const SILENT_WAV_BASE64 = 
  'data:audio/wav;base64,UklGRigAAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YQQAAAAAAA==';

export function startBackgroundKeepAlive(): void {
  if (typeof window === 'undefined' || isKeepAliveActive) return;

  try {
    if (!silentAudio) {
      silentAudio = new Audio(SILENT_WAV_BASE64);
      silentAudio.loop = true;
      silentAudio.volume = 0.01; // Inaudible
    }

    const playPromise = silentAudio.play();
    if (playPromise !== undefined) {
      playPromise
        .then(() => {
          isKeepAliveActive = true;
          // Register MediaSession on Android to prevent OS Doze mode
          if ('mediaSession' in navigator) {
            navigator.mediaSession.metadata = new MediaMetadata({
              title: 'VitaRemind Alarm Servisi',
              artist: 'Arka Plan Bildirim Koruması Aktif',
              album: 'VitaRemind',
            });
            navigator.mediaSession.playbackState = 'playing';
          }
        })
        .catch(() => {
          // Requires user interaction, will start on next tap
          isKeepAliveActive = false;
        });
    }
  } catch (err) {
    console.warn('Background keep-alive could not start:', err);
  }
}

export function stopBackgroundKeepAlive(): void {
  if (silentAudio && isKeepAliveActive) {
    try {
      silentAudio.pause();
      if ('mediaSession' in navigator) {
        navigator.mediaSession.playbackState = 'paused';
      }
    } catch {}
    isKeepAliveActive = false;
  }
}

export function isBackgroundKeepAliveRunning(): boolean {
  return isKeepAliveActive;
}

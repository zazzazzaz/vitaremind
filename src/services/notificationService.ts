import { Capacitor } from '@capacitor/core';
import { LocalNotifications } from '@capacitor/local-notifications';

export interface ScheduledAlarmItem {
  id: string;
  type: 'medication' | 'water';
  title: string;
  description: string;
  scheduledTime: string; // "09:00"
  scheduledEpoch: number; // millisecond timestamp
}

function hashStringToInt(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

export async function requestNotificationPermission(): Promise<NotificationPermission> {
  if (Capacitor.isNativePlatform()) {
    try {
      const res = await LocalNotifications.requestPermissions();
      return res.display === 'granted' ? 'granted' : 'denied';
    } catch (e) {
      console.warn('Native permission error:', e);
    }
  }

  if (typeof window === 'undefined' || !('Notification' in window)) {
    return 'denied';
  }
  try {
    const permission = await Notification.requestPermission();
    if (permission === 'granted' && 'serviceWorker' in navigator) {
      // Ensure service worker is ready and registered
      try {
        await navigator.serviceWorker.ready;
      } catch {}
    }
    return permission;
  } catch (err) {
    console.warn('Notification permission request error:', err);
    return 'denied';
  }
}

export function getNotificationPermission(): NotificationPermission {
  if (Capacitor.isNativePlatform()) {
    return 'granted';
  }
  if (typeof window === 'undefined' || !('Notification' in window)) {
    return 'denied';
  }
  return Notification.permission;
}

/**
 * Sends a high-priority system notification.
 * On Android, ServiceWorkerRegistration.showNotification is mandatory because
 * mobile Chrome throws an illegal constructor error for new Notification().
 */
export async function sendLocalNotification(
  title: string,
  options?: NotificationOptions & { vibrate?: number[]; requireInteraction?: boolean }
): Promise<boolean> {
  if (typeof window === 'undefined') {
    return false;
  }

  if (Notification.permission !== 'granted') {
    console.warn('Notification permission not granted:', Notification.permission);
    return false;
  }

  const notificationOptions: NotificationOptions & { vibrate?: number[]; requireInteraction?: boolean } = {
    icon: '/pwa-192x192.png',
    badge: '/pwa-192x192.png',
    vibrate: [400, 150, 400, 150, 500],
    requireInteraction: true,
    renotify: true,
    data: {
      url: '/',
      timestamp: Date.now(),
    },
    ...options,
  };

  // 1. Preferred method for Android PWA: Service Worker showNotification
  if ('serviceWorker' in navigator) {
    try {
      // First check existing registration without waiting for .ready promise to avoid hanging
      const reg = await navigator.serviceWorker.getRegistration();
      if (reg && reg.showNotification) {
        await reg.showNotification(title, notificationOptions);
        return true;
      }

      // If not immediately ready, race navigator.serviceWorker.ready with a 1.2s timeout
      const readyReg = await Promise.race([
        navigator.serviceWorker.ready,
        new Promise<null>((resolve) => setTimeout(() => resolve(null), 1200))
      ]);
      if (readyReg && readyReg.showNotification) {
        await readyReg.showNotification(title, notificationOptions);
        return true;
      }
    } catch (swErr) {
      console.warn('Service Worker showNotification failed:', swErr);
    }
  }

  // 2. Desktop fallback: new Notification constructor
  try {
    new Notification(title, notificationOptions);
    return true;
  } catch (desktopErr) {
    console.warn('Desktop Notification constructor error:', desktopErr);
    return false;
  }
}

/**
 * Synchronizes upcoming alarm schedule to the Service Worker so the Service Worker
 * can trigger showNotification even when screen is locked or in background.
 */
export async function syncAlarmsToServiceWorker(alarms: ScheduledAlarmItem[]): Promise<void> {
  // If running inside native Android APK via Capacitor: use Android native AlarmManager
  if (Capacitor.isNativePlatform()) {
    try {
      const pending = await LocalNotifications.getPending();
      if (pending.notifications.length > 0) {
        await LocalNotifications.cancel({ notifications: pending.notifications });
      }
      if (alarms.length > 0) {
        const nativeNotifications = alarms.map((alarm) => ({
          id: hashStringToInt(alarm.id),
          title: alarm.title,
          body: alarm.description,
          schedule: { at: new Date(alarm.scheduledEpoch), allowWhileIdle: true },
          sound: 'beep.wav',
        }));
        await LocalNotifications.schedule({ notifications: nativeNotifications });
      }
    } catch (nativeErr) {
      console.warn('Native LocalNotifications schedule error:', nativeErr);
    }
  }

  if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
    return;
  }

  try {
    const reg = await navigator.serviceWorker.getRegistration() || await Promise.race([
      navigator.serviceWorker.ready,
      new Promise<null>((resolve) => setTimeout(() => resolve(null), 1000))
    ]);
    const targetWorker = reg?.active || navigator.serviceWorker.controller;
    if (targetWorker) {
      targetWorker.postMessage({
        type: 'SYNC_SCHEDULE',
        alarms,
      });
    }
  } catch (err) {
    console.warn('Failed to sync alarms to Service Worker:', err);
  }
}

/**
 * Schedules a test notification directly inside the Service Worker so that
 * when the user turns off the screen or locks the device, the notification fires
 * reliably without being frozen by browser tab suspension.
 */
export async function scheduleTestNotificationViaWorker(delayMs: number = 8000): Promise<boolean> {
  if (typeof window === 'undefined') return false;

  // Native Android test notification
  if (Capacitor.isNativePlatform()) {
    try {
      await LocalNotifications.schedule({
        notifications: [
          {
            id: 99999,
            title: '💊 VitaRemind: Kilitli Ekran Testi',
            body: 'Harika! Android native AlarmManager başarıyla bildirim gönderdi.',
            schedule: { at: new Date(Date.now() + delayMs), allowWhileIdle: true },
          },
        ],
      });
      return true;
    } catch (e) {
      console.warn('Native test alarm error:', e);
    }
  }

  if ('serviceWorker' in navigator) {
    try {
      const reg = await navigator.serviceWorker.getRegistration() || await Promise.race([
        navigator.serviceWorker.ready,
        new Promise<null>((resolve) => setTimeout(() => resolve(null), 1000))
      ]);
      const targetWorker = reg?.active || navigator.serviceWorker.controller;
      if (targetWorker) {
        targetWorker.postMessage({
          type: 'SCHEDULE_TEST_ALARM',
          delayMs,
          title: '💊 VitaRemind: Kilitli Ekran Testi',
          body: 'Harika! Telefonunuz kilitliyken veya uygulama açıkken bildirim başarıyla iletildi.',
        });
        return true;
      }
    } catch (swErr) {
      console.warn('Service worker test schedule error:', swErr);
    }
  }

  return false;
}

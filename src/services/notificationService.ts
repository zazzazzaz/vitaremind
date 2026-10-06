import { LocalNotifications } from '@capacitor/local-notifications';
import { Medication, WaterSettings } from '../types';

/**
 * Android ve Web için Yerel Bildirim & Arka Plan Alarm Servisi
 * Kapalıyken ve telefon kilitliyken bile alarm çalar.
 */
export async function initializeLocalNotifications() {
  try {
    const status = await LocalNotifications.checkPermissions();
    if (status.display !== 'granted') {
      await LocalNotifications.requestPermissions();
    }

    // Android bildirim kanalı oluştur (öncelikli ve sesli)
    await LocalNotifications.createChannel({
      id: 'vitaremind-alarms',
      name: 'VitaRemind İlaç ve Su Alarmları',
      description: 'Zamanı gelen ilaç ve su periyotları için yüksek öncelikli bildirimler',
      importance: 5,
      visibility: 1,
      vibration: true,
      lights: true,
      lightColor: '#0d9488',
    });
  } catch (err) {
    console.warn('Capacitor LocalNotifications başlatılamadı (web fallback devrede):', err);
  }
}

export async function requestNotificationPermission(): Promise<NotificationPermission> {
  try {
    const result = await LocalNotifications.requestPermissions();
    if (result.display === 'granted') {
      return 'granted';
    }
  } catch {
    // fallback to web standard
  }

  if (typeof window !== 'undefined' && 'Notification' in window) {
    try {
      return await Notification.requestPermission();
    } catch {
      return 'denied';
    }
  }
  return 'denied';
}

export function getNotificationPermission(): NotificationPermission {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    return 'default';
  }
  return Notification.permission;
}

/**
 * Anlık yerel bildirim gönderimi (UI açıkken veya arka plana geçerken)
 */
export async function sendLocalNotification(title: string, options?: NotificationOptions & { body?: string }) {
  try {
    await LocalNotifications.schedule({
      notifications: [
        {
          title,
          body: options?.body || 'VitaRemind Hatırlatıcı',
          id: Math.floor(Math.random() * 100000),
          channelId: 'vitaremind-alarms',
          schedule: { at: new Date(Date.now() + 500) },
          sound: 'beep.wav',
          extra: options,
        },
      ],
    });
    return;
  } catch (err) {
    console.warn('Capacitor notification error, falling back to Web Notification:', err);
  }

  // Web Notification fallback
  if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
    try {
      new Notification(title, {
        icon: '/pwa-192x192.png',
        badge: '/pwa-192x192.png',
        ...options,
      });
    } catch (err) {
      console.warn('Web notification failed:', err);
    }
  }
}

/**
 * Android Sistem Takvimine / Alarm Manager'a Tüm İlaç ve Su Saatlerini Planlar (Exact Alarm)
 * Bu sayede UYGULAMA KAPALI VEYA ARKA PLANDA OLSA BİLE TAM VAKTİNDE BİLDİRİM ÇALAR.
 */
export async function syncNativeBackgroundAlarms(
  medications: Medication[],
  waterSettings: WaterSettings,
  notificationsEnabled: boolean
) {
  if (!notificationsEnabled) {
    try {
      const pending = await LocalNotifications.getPending();
      if (pending.notifications.length > 0) {
        await LocalNotifications.cancel({ notifications: pending.notifications });
      }
    } catch (e) {
      console.warn('Alarmlar temizlenemedi:', e);
    }
    return;
  }

  try {
    // 1. Önce eski bekleyen tüm alarmları temizle
    const pending = await LocalNotifications.getPending();
    if (pending.notifications.length > 0) {
      await LocalNotifications.cancel({ notifications: pending.notifications });
    }

    const scheduledList: any[] = [];
    let notifIdCounter = 1000;

    // 2. Aktif İlaçları Gelecek 7 Gün Boyunca Planla
    const activeMeds = medications.filter((m) => m.active);
    const now = new Date();

    for (let dayOffset = 0; dayOffset < 7; dayOffset++) {
      const targetDate = new Date();
      targetDate.setDate(now.getDate() + dayOffset);
      const targetDayOfWeek = targetDate.getDay();

      for (const med of activeMeds) {
        // Gün filtresi
        if (med.daysOfWeek && med.daysOfWeek.length > 0 && !med.daysOfWeek.includes(targetDayOfWeek)) {
          continue;
        }

        for (const timeStr of med.times || []) {
          const [hStr, mStr] = timeStr.split(':');
          const fireDate = new Date(targetDate);
          fireDate.setHours(parseInt(hStr, 10), parseInt(mStr, 10), 0, 0);

          // Sadece gelecekteki saatleri ekle
          if (fireDate.getTime() > now.getTime()) {
            scheduledList.push({
              title: `💊 İlaç Vakti: ${med.name}`,
              body: `${med.dosage} almayı unutmayın.`,
              id: notifIdCounter++,
              channelId: 'vitaremind-alarms',
              schedule: { at: fireDate, allowWhileIdle: true },
              extra: { medId: med.id, time: timeStr },
            });
          }
        }
      }
    }

    // 3. Su Hatırlatıcılarını Planla (Bugün ve Yarın için)
    if (waterSettings.reminderEnabled && waterSettings.intervalMinutes > 0) {
      const [startH, startM] = waterSettings.startTime.split(':').map(Number);
      const [endH, endM] = waterSettings.endTime.split(':').map(Number);

      for (let dayOffset = 0; dayOffset < 2; dayOffset++) {
        const targetDate = new Date();
        targetDate.setDate(now.getDate() + dayOffset);

        const startTimestamp = new Date(targetDate).setHours(startH, startM || 0, 0, 0);
        const endTimestamp = new Date(targetDate).setHours(endH, endM || 0, 0, 0);

        let currentIntervalTime = startTimestamp;
        while (currentIntervalTime <= endTimestamp) {
          if (currentIntervalTime > now.getTime()) {
            scheduledList.push({
              title: '💧 Su İçme Vakti!',
              body: `Günlük hidrasyon hedefinizi yakalamak için 1 bardak su için.`,
              id: notifIdCounter++,
              channelId: 'vitaremind-alarms',
              schedule: { at: new Date(currentIntervalTime), allowWhileIdle: true },
              extra: { type: 'water' },
            });
          }
          currentIntervalTime += waterSettings.intervalMinutes * 60 * 1000;
        }
      }
    }

    // Toplu halde Android Alarm Yöneticisine kaydet (Maks 64 bildirim kapasitesi)
    if (scheduledList.length > 0) {
      await LocalNotifications.schedule({
        notifications: scheduledList.slice(0, 60),
      });
      console.log(`[VitaRemind] ${scheduledList.length} adet arka plan alarmı Android sistemine kuruldu.`);
    }
  } catch (err) {
    console.warn('Arka plan yerel alarmları senkronize edilirken hata:', err);
  }
}

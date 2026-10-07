// VitaRemind Service Worker with Android Background Alarms & Notification Support
const CACHE_NAME = 'vitaremind-cache-v2';
const ASSETS_TO_CACHE = [
  '/',
  '/index.html',
  '/manifest.json',
  '/icon.svg',
  '/pwa-192x192.png',
  '/pwa-512x512.png',
  '/apple-touch-icon.png'
];

// Active in-memory scheduled timeouts in Service Worker
let activeAlarmTimeouts = [];
let scheduledAlarmsList = [];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE).catch((err) => {
        console.warn('Pre-cache error:', err);
      });
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Cache-first / Network-first asset serving
self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;

  event.respondWith(
    fetch(event.request)
      .then((networkResponse) => {
        if (networkResponse && networkResponse.status === 200 && networkResponse.type === 'basic') {
          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache).catch(() => {});
          });
        }
        return networkResponse;
      })
      .catch(() => {
        return caches.match(event.request).then((cachedResponse) => {
          if (cachedResponse) {
            return cachedResponse;
          }
          if (event.request.mode === 'navigate') {
            return caches.match('/index.html');
          }
          return new Response('Offline', { status: 503, statusText: 'Offline' });
        });
      })
  );
});

// Schedule alarm notifications inside Service Worker
function scheduleAlarmsInWorker(alarms) {
  // Clear any existing timeouts
  activeAlarmTimeouts.forEach((t) => clearTimeout(t));
  activeAlarmTimeouts = [];
  scheduledAlarmsList = alarms || [];

  const now = Date.now();

  scheduledAlarmsList.forEach((alarm) => {
    const delay = alarm.scheduledEpoch - now;

    // If within next 24 hours and in future (or within last 30s)
    if (delay > -30000 && delay < 24 * 60 * 60 * 1000) {
      const waitMs = Math.max(0, delay);

      const timeoutId = setTimeout(() => {
        self.registration.showNotification(alarm.title, {
          body: alarm.description,
          icon: '/pwa-192x192.png',
          badge: '/pwa-192x192.png',
          vibrate: [400, 150, 400, 150, 500],
          requireInteraction: true,
          renotify: true,
          tag: alarm.id,
          data: {
            url: '/',
            alarmId: alarm.id,
            type: alarm.type,
          },
          actions: [
            { action: 'take', title: '✓ Aldım / Tamam' },
            { action: 'snooze', title: '⏱ 15 Dk Ertele' },
          ],
        });
      }, waitMs);

      activeAlarmTimeouts.push(timeoutId);
    }
  });
}

// Listen for messages from client
self.addEventListener('message', (event) => {
  if (!event.data) return;

  if (event.data.type === 'SYNC_SCHEDULE') {
    scheduleAlarmsInWorker(event.data.alarms);
  } else if (event.data.type === 'TRIGGER_NOTIFICATION') {
    self.registration.showNotification(event.data.title, event.data.options);
  }
});

// Periodic background sync if supported by Android browser
self.addEventListener('periodicsync', (event) => {
  if (event.tag === 'check-alarms') {
    event.waitUntil(
      (async () => {
        const now = Date.now();
        scheduledAlarmsList.forEach((alarm) => {
          if (Math.abs(alarm.scheduledEpoch - now) < 5 * 60 * 1000) {
            self.registration.showNotification(alarm.title, {
              body: alarm.description,
              icon: '/pwa-192x192.png',
              badge: '/pwa-192x192.png',
              vibrate: [400, 150, 400, 150, 500],
              tag: alarm.id,
              requireInteraction: true,
            });
          }
        });
      })()
    );
  }
});

// Handle notification click on Android (wake up app and focus window)
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const urlToOpen = event.notification.data?.url || '/';

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windowClients) => {
      // If client tab is already open, focus it
      for (const client of windowClients) {
        if (client.url.includes(self.location.origin) && 'focus' in client) {
          if (event.action) {
            client.postMessage({
              type: 'NOTIFICATION_ACTION',
              action: event.action,
              alarmId: event.notification.data?.alarmId,
            });
          }
          return client.focus();
        }
      }

      // Otherwise open a new window
      if (clients.openWindow) {
        return clients.openWindow(urlToOpen);
      }
    })
  );
});

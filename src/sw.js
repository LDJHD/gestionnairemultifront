import { precacheAndRoute } from 'workbox-precaching';

// Precaching des assets générés par Vite
precacheAndRoute(self.__WB_MANIFEST || []);

// Installation / activation
self.addEventListener('install', (event) => {
  self.skipWaiting();
});
self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

// Réception des notifications push (même hors app)
self.addEventListener('push', (event) => {
  let data = {};
  try { data = event.data ? event.data.json() : {}; } catch (e) { data = { body: event.data ? event.data.text() : '' }; }
  const title = data.title || 'Le Gestionnaire';
  const options = {
    body: data.body || 'Nouvelle notification',
    icon: '/image/logo.png',
    badge: '/image/logo.png',
    data: { url: data.url || '/dashboard/notifications' },
    vibrate: [100, 50, 100],
    tag: 'lg-notification',
    renotify: true,
  };
  event.waitUntil(self.registration.showNotification(title, options));
});

// Clic sur la notification → ouvre l'app
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const url = (event.notification.data && event.notification.data.url) || '/dashboard/notifications';
  event.waitUntil(
    (async () => {
      const allClients = await self.clients.matchAll({ type: 'window', includeUncontrolled: true });
      for (const client of allClients) {
        if (client.url.includes(self.location.origin) && 'focus' in client) {
          client.navigate(url);
          return client.focus();
        }
      }
      if (self.clients.openWindow) {
        return self.clients.openWindow(url);
      }
    })()
  );
});

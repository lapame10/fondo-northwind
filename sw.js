/* ============================================================
   Service worker de Northwind Capital
   ------------------------------------------------------------
   Es el "portero": un archivito que queda vivo en el telefono aunque la app este
   cerrada. Hace dos cosas:
     1. Recibe los avisos que manda Apple y los convierte en notificacion.
     2. Es OBLIGATORIO en iOS para poder pedir el permiso de notificaciones.
        Sin este archivo, iPhone NI SIQUIERA pregunta si quieres permitirlas.
   ============================================================ */

const VERSION = 'nw1';

self.addEventListener('install', function (e) {
  self.skipWaiting();   // que tome el mando ya, sin esperar a cerrar la app
});

self.addEventListener('activate', function (e) {
  e.waitUntil(self.clients.claim());
});

/* Llega un aviso empujado desde fuera */
self.addEventListener('push', function (e) {
  let d = {};
  try { d = e.data ? e.data.json() : {}; } catch (err) { d = {}; }
  const titulo = d.title || 'Northwind Capital';
  const cuerpo = d.body  || 'Nueva entrada en la mesa.';

  e.waitUntil(
    self.registration.showNotification(titulo, {
      body: cuerpo,
      icon: 'icons/icon-192-v1.png',
      badge: 'icons/icon-192-v1.png',
      tag: 'nwcap',
      renotify: true,
      silent: false,
      data: { url: './' }
    }).then(function () {
      /* y el numerito en el icono */
      if (self.navigator && self.navigator.setAppBadge) {
        const n = d.count || 1;
        return self.navigator.setAppBadge(n).catch(function () {});
      }
    })
  );
});

/* Tocan la notificacion: abrir la app */
self.addEventListener('notificationclick', function (e) {
  e.notification.close();
  e.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then(function (lista) {
      for (const c of lista) {
        if (c.url.indexOf('fondo-northwind') >= 0 && 'focus' in c) return c.focus();
      }
      if (self.clients.openWindow) return self.clients.openWindow('./');
    })
  );
});

/* Cerramos una notificacion: quitamos el numerito */
self.addEventListener('notificationclose', function () {
  if (self.navigator && self.navigator.clearAppBadge) {
    self.navigator.clearAppBadge().catch(function () {});
  }
});

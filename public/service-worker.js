const CACHE_NAME = "workpilot360-pwa-v9";
const APP_SHELL = [
  "/",
  "/manifest.webmanifest",
  "/pwa-icon-192.png",
  "/pwa-icon-512.png",
  "/pwa-icon-maskable-512.png",
  "/apple-touch-icon.png",
  "/workpilot360-logo-header.png",
  "/workpilot360-logo-wide.png",
  "/oks-logo.png",
  "/oki-logo.png"
];

self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll(APP_SHELL)));
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key)))
      )
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  const request = event.request;
  const url = new URL(request.url);

  if (request.method !== "GET") return;

  if (url.pathname.startsWith("/api/")) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          const copy = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, copy));
          return response;
        })
        .catch(() => caches.match(request))
    );
    return;
  }

  event.respondWith(caches.match(request).then((cached) => cached ?? fetch(request)));
});

self.addEventListener("push", (event) => {
  let payload = {};
  try {
    payload = event.data ? event.data.json() : {};
  } catch {
    payload = {
      title: "WorkPilot360",
      body: event.data ? event.data.text() : "Neue Benachrichtigung",
    };
  }

  const title = payload.title || payload.subject || "WorkPilot360";
  const options = {
    body: payload.body || "Neue Benachrichtigung",
    icon: "/pwa-icon-192.png",
    badge: "/pwa-icon-192.png",
    tag: payload.tag || payload.notificationId || "workpilot360-notification",
    data: {
      url: payload.url || "/",
      notificationId: payload.notificationId || "",
      linkTarget: payload.linkTarget || "",
      linkTargetId: payload.linkTargetId || "",
    },
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const data = event.notification.data || {};
  const targetUrl = new URL(data.url || "/", self.location.origin);
  if (data.linkTarget) targetUrl.searchParams.set("target", data.linkTarget);
  if (data.linkTargetId) targetUrl.searchParams.set("targetId", data.linkTargetId);

  event.waitUntil(
    self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((clients) => {
      const existingClient = clients.find((client) => "focus" in client);
      if (existingClient) {
        existingClient.focus();
        existingClient.postMessage({
          type: "WORKPILOT_NOTIFICATION_CLICK",
          target: data.linkTarget || "",
          targetId: data.linkTargetId || "",
        });
        return;
      }
      return self.clients.openWindow(targetUrl.href);
    })
  );
});

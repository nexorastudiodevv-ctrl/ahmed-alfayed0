const CACHE_PREFIX = "nexora-pwa-";
const CACHE_NAME = `${CACHE_PREFIX}v1`;
const APP_SHELL = [
  "/",
  "/index.html",
  "/index-en.html",
  "/offline.html",
  "/manifest.webmanifest",
  "/styles.css",
  "/app-pages.css",
  "/pwa.css",
  "/script.js",
  "/assets/app-icon-192.png",
  "/assets/app-icon-512.png",
  "/assets/nexora-brand.png",
  "/assets/megabit-icon.png",
  "/assets/nexora-office-icon.png",
  "/assets/quran-icon.png",
  "/assets/gold-currency-dashboard.png",
  "/assets/avam-flight-booking.png",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(APP_SHELL)).then(() => self.skipWaiting()),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => Promise.all(
        cacheNames
          .filter((cacheName) => cacheName.startsWith(CACHE_PREFIX) && cacheName !== CACHE_NAME)
          .map((cacheName) => caches.delete(cacheName)),
      ))
      .then(() => self.clients.claim()),
  );
});

self.addEventListener("fetch", (event) => {
  const { request } = event;
  const requestUrl = new URL(request.url);

  if (request.method !== "GET" || requestUrl.origin !== self.location.origin) return;

  event.respondWith(
    fetch(request)
      .then((response) => {
        if (response.ok && response.type === "basic") {
          return caches.open(CACHE_NAME)
            .then((cache) => cache.put(request, response.clone()))
            .then(() => response);
        }
        return response;
      })
      .catch(async () => {
        const cachedResponse = await caches.match(request, { ignoreSearch: true });
        if (cachedResponse) return cachedResponse;

        if (request.mode === "navigate") {
          const offlinePage = await caches.match("/offline.html");
          if (offlinePage) return offlinePage;
        }

        return Response.error();
      }),
  );
});

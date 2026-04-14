// NON OMNIS MORIAR — Afterlife Decks Service Worker
// Cache strategy: cache first para assets, network first para API
const CACHE_NAME = "afterlife-decks-v1";
const ASSETS_TO_CACHE = ["/", "/index.html"];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS_TO_CACHE)),
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((key) => key !== CACHE_NAME)
            .map((key) => caches.delete(key)),
        ),
      ),
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  // Solo cachear GET requests del mismo origen
  if (event.request.method !== "GET") return;
  if (!event.request.url.startsWith(self.location.origin)) return;
  // No cachear Supabase API calls
  if (event.request.url.includes("supabase.co")) return;

  event.respondWith(
    caches.match(event.request).then((cached) => {
      return (
        cached || fetch(event.request).catch(() => caches.match("/index.html"))
      );
    }),
  );
});

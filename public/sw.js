// NON OMNIS MORIAR — Afterlife Decks Service Worker
// Cache bust automático: el nombre incluye timestamp del build
// Esto fuerza limpieza de caches viejos en cada deploy

const BUILD_TIME = "__BUILD_TIME__";
const CACHE_NAME = `afterlife-decks-${BUILD_TIME}`;

self.addEventListener("install", (event) => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  // Elimina TODOS los caches viejos automáticamente
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((key) => key !== CACHE_NAME)
            .map((key) => {
              console.log("[AfterlifeDecks] Clearing old cache:", key);
              return caches.delete(key);
            }),
        ),
      )
      .then(() => self.clients.claim()),
  );
});

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;
  if (!event.request.url.startsWith(self.location.origin)) return;
  if (event.request.url.includes("supabase.co")) return;

  // Network first — siempre intenta la red primero para assets hasheados
  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // Solo cachear respuestas válidas
        if (response && response.status === 200) {
          const cached = response.clone();
          caches
            .open(CACHE_NAME)
            .then((cache) => cache.put(event.request, cached));
        }
        return response;
      })
      .catch(() =>
        // Fallback a caché si no hay red
        caches
          .match(event.request)
          .then((cached) => cached || caches.match("/index.html")),
      ),
  );
});

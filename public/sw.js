const CACHE_NAME = "tripant-v2";
const TILE_CACHE = "tripant-tiles-v1";
const API_CACHE  = "tripant-api-v1";

const STATIC_ASSETS = [
  "/manifest.json",
  "/icons/icon-192.svg",
  "/icons/icon-512.svg",
  "/leaflet/leaflet.css",
];

// Install: pre-cache only stable, non-hashed assets
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(STATIC_ASSETS))
      .then(() => self.skipWaiting())
  );
});

// Activate: delete every old cache so stale JS/CSS chunks can't linger
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((k) => k !== CACHE_NAME && k !== TILE_CACHE && k !== API_CACHE)
            .map((k) => caches.delete(k))
        )
      )
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  const url = new URL(event.request.url);

  // ─── CRITICAL: never intercept Next.js build artefacts ──────────────
  // _next/static/ files are content-hashed by Next.js; the browser's
  // built-in HTTP cache handles them correctly. If the SW intercepts them
  // with a cache-first strategy it can serve stale chunks from a previous
  // build, which strips styles or causes JS errors after every deploy.
  if (url.pathname.startsWith("/_next/")) return;

  // Map tiles — cache-first, long-lived
  if (
    url.hostname.includes("openstreetmap.org") &&
    url.pathname.includes("/tile")
  ) {
    event.respondWith(
      caches.open(TILE_CACHE).then(async (cache) => {
        const cached = await cache.match(event.request);
        if (cached) return cached;
        const response = await fetch(event.request);
        if (response.ok) cache.put(event.request, response.clone());
        return response;
      })
    );
    return;
  }

  // Wikipedia photo API — stale-while-revalidate (photos rarely change)
  if (
    url.hostname.includes("wikipedia.org") ||
    url.hostname.includes("wikimedia.org")
  ) {
    event.respondWith(
      caches.open(API_CACHE).then(async (cache) => {
        const cached = await cache.match(event.request);
        const fresh = fetch(event.request)
          .then((r) => { if (r.ok) cache.put(event.request, r.clone()); return r; })
          .catch(() => cached);
        return cached ?? fresh;
      })
    );
    return;
  }

  // Internal API routes — stale-while-revalidate
  if (url.pathname.startsWith("/api/")) {
    event.respondWith(
      caches.open(API_CACHE).then(async (cache) => {
        const cached = await cache.match(event.request);
        const fresh = fetch(event.request)
          .then((r) => { if (r.ok) cache.put(event.request, r.clone()); return r; })
          .catch(() => cached);
        return cached ?? fresh;
      })
    );
    return;
  }

  // Page navigation — network-first, fall back to cache for offline
  if (event.request.mode === "navigate") {
    event.respondWith(
      fetch(event.request).catch(() =>
        caches.match(event.request).then((c) => c ?? caches.match("/explore"))
      )
    );
    return;
  }

  // Stable public assets (icons, manifest, leaflet CSS) — cache-first
  event.respondWith(
    caches.match(event.request).then((cached) => {
      if (cached) return cached;
      return fetch(event.request).then((response) => {
        if (response.ok && event.request.method === "GET") {
          caches.open(CACHE_NAME).then((cache) =>
            cache.put(event.request, response.clone())
          );
        }
        return response;
      });
    })
  );
});

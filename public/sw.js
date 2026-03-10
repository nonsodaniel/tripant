// ─── Service Worker for Tripant ─────────────────────────────────────────────
// Strategy: only cache things that are TRULY static (tiles, icons, manifest).
// Everything else — Next.js chunks, CSS, RSC payloads, API responses — goes
// through the network. HTTP Cache-Control headers on the server handle
// caching at the HTTP layer; the SW does NOT try to second-guess that.
//
// Bump VERSION whenever you deploy so old caches are purged immediately.
const VERSION = "v7";
const TILE_CACHE   = `tripant-tiles-${VERSION}`;
const STATIC_CACHE = `tripant-static-${VERSION}`;

const PRECACHE = [
  "/manifest.json",
  "/icons/icon-192.svg",
  "/icons/icon-512.svg",
  "/leaflet/leaflet.css",
];

// ── Install ──────────────────────────────────────────────────────────────────
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then((c) => c.addAll(PRECACHE))
      // Skip waiting so the new SW activates immediately, replacing the old one.
      .then(() => self.skipWaiting())
  );
});

// ── Activate ─────────────────────────────────────────────────────────────────
self.addEventListener("activate", (event) => {
  event.waitUntil(
    // Delete every cache that is not from this build version.
    // This removes stale RSC payloads, CSS, and chunk references.
    caches.keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((k) => k !== TILE_CACHE && k !== STATIC_CACHE)
            .map((k) => caches.delete(k))
        )
      )
      // Claim all open pages so this SW is in control immediately.
      .then(() => self.clients.claim())
      // Tell all controlled pages to reload so they get fresh HTML/CSS/chunks.
      .then(() =>
        self.clients.matchAll({ type: "window", includeUncontrolled: false })
          .then((clients) =>
            clients.forEach((client) =>
              client.postMessage({ type: "SW_ACTIVATED" })
            )
          )
      )
  );
});

// ── Fetch ────────────────────────────────────────────────────────────────────
self.addEventListener("fetch", (event) => {
  const url = new URL(event.request.url);

  // 1. NEVER intercept Next.js build artifacts.
  //    These are content-hashed; the browser's HTTP cache manages them.
  if (url.pathname.startsWith("/_next/")) return;

  // 2. Map tiles — cache-first (tiles for a given coord never change).
  if (
    url.hostname.includes("tile.openstreetmap.org") ||
    (url.hostname.includes("openstreetmap.org") && url.pathname.includes("/tile"))
  ) {
    event.respondWith(cacheFirst(TILE_CACHE, event.request));
    return;
  }

  // 3. Small static assets (icons, manifest, Leaflet CSS) — cache-first.
  if (
    url.pathname.startsWith("/icons/") ||
    url.pathname.startsWith("/leaflet/") ||
    url.pathname === "/manifest.json"
  ) {
    event.respondWith(cacheFirst(STATIC_CACHE, event.request));
    return;
  }

  // 4. Everything else (page HTML, RSC payloads, API routes, etc.) goes
  //    straight to the network. HTTP Cache-Control headers on the API
  //    routes (s-maxage, stale-while-revalidate) handle server-side
  //    caching — no need for the SW to duplicate that logic.
  //    Do NOT call event.respondWith() → browser handles it natively.
});

// ── Helpers ───────────────────────────────────────────────────────────────────
async function cacheFirst(cacheName, request) {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(request);
  if (cached) return cached;
  const fresh = await fetch(request);
  if (fresh.ok) cache.put(request, fresh.clone());
  return fresh;
}

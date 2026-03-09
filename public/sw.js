// Increment this version whenever you deploy a new build.
// This forces the SW to reinstall, clearing all old caches.
const VERSION = "v5";

const CACHE_STATIC = `tripant-static-${VERSION}`;
const TILE_CACHE   = `tripant-tiles-${VERSION}`;

const STATIC_ASSETS = [
  "/manifest.json",
  "/icons/icon-192.svg",
  "/icons/icon-512.svg",
  "/leaflet/leaflet.css",
];

// ── Install: pre-cache small set of stable static assets ────────────────────
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_STATIC)
      .then((cache) => cache.addAll(STATIC_ASSETS))
      .then(() => self.skipWaiting())  // activate immediately
  );
});

// ── Activate: delete ALL old caches so stale chunks never linger ─────────────
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((k) => k !== CACHE_STATIC && k !== TILE_CACHE)
            .map((k) => caches.delete(k))
        )
      )
      .then(() => self.clients.claim())
  );
});

// ── Fetch strategy ───────────────────────────────────────────────────────────
self.addEventListener("fetch", (event) => {
  const url = new URL(event.request.url);

  // 1. NEVER touch Next.js build artifacts — content-hashed, always fresh
  if (url.pathname.startsWith("/_next/")) return;

  // 2. Map tiles — cache-first (tiles never change for a given zoom/x/y)
  if (
    url.hostname.includes("tile.openstreetmap.org") ||
    (url.hostname.includes("openstreetmap.org") && url.pathname.includes("/tile"))
  ) {
    event.respondWith(tileFirst(event.request));
    return;
  }

  // 3. Internal API routes — NETWORK-FIRST
  //    Always try the network first. Only fall back to cache when offline.
  //    This prevents stale empty-array or error responses from being served.
  if (url.pathname.startsWith("/api/")) {
    event.respondWith(networkFirst(event.request, CACHE_STATIC, 12));
    return;
  }

  // 4. Page navigation — network-first, offline fallback to /explore
  if (event.request.mode === "navigate") {
    event.respondWith(
      fetch(event.request).catch(() =>
        caches.match(event.request).then((c) => c ?? caches.match("/explore"))
      )
    );
    return;
  }

  // 5. Static public assets (icons, manifest, leaflet CSS) — cache-first
  if (
    url.pathname.startsWith("/icons/") ||
    url.pathname.startsWith("/leaflet/") ||
    url.pathname === "/manifest.json"
  ) {
    event.respondWith(cacheFirst(event.request, CACHE_STATIC));
    return;
  }

  // 6. Everything else — network only (do not cache)
  // This avoids accidentally caching page HTML or other dynamic content.
});

// ── Strategy helpers ─────────────────────────────────────────────────────────

async function networkFirst(request, cacheName, maxAgeHours = 24) {
  const cache = await caches.open(cacheName);
  try {
    const response = await fetch(request);
    // Only cache successful, non-empty responses
    if (response.ok) {
      const clone = response.clone();
      // Peek at the response body — don't cache empty arrays
      clone.json().then((body) => {
        if (Array.isArray(body) && body.length === 0) return; // skip empty arrays
        cache.put(request, response.clone());
      }).catch(() => {
        // Not JSON or parse error — cache it anyway (e.g. weather object)
        cache.put(request, response.clone());
      });
    }
    return response;
  } catch {
    // Offline — try cache
    const cached = await cache.match(request);
    return cached ?? new Response(
      JSON.stringify({ error: "You are offline" }),
      { status: 503, headers: { "Content-Type": "application/json" } }
    );
  }
}

async function tileFirst(request) {
  const cache = await caches.open(TILE_CACHE);
  const cached = await cache.match(request);
  if (cached) return cached;
  const response = await fetch(request);
  if (response.ok) cache.put(request, response.clone());
  return response;
}

async function cacheFirst(request, cacheName) {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(request);
  if (cached) return cached;
  const response = await fetch(request);
  if (response.ok) cache.put(request, response.clone());
  return response;
}

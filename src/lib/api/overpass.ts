import type { Place, Category, NearbyQuery, Coordinates } from "@/types";
import { haversineDistance } from "@/lib/utils/distance";

// Multiple Overpass endpoints — tried in order, fallback on failure
const OVERPASS_ENDPOINTS = [
  "https://overpass-api.de/api/interpreter",
  "https://overpass.kumi.systems/api/interpreter",
  "https://overpass.openstreetmap.ru/api/interpreter",
];

// ─── In-process cache ────────────────────────────────────────────────────────

interface CacheEntry {
  data: Place[];
  expiresAt: number;
}
const _cache = new Map<string, CacheEntry>();

function getCached(key: string): Place[] | null {
  const entry = _cache.get(key);
  if (!entry) return null;
  if (Date.now() > entry.expiresAt) { _cache.delete(key); return null; }
  return entry.data;
}

function setCached(key: string, data: Place[], ttlMs: number) {
  if (_cache.size >= 100) {
    const oldest = _cache.keys().next().value;
    if (oldest) _cache.delete(oldest);
  }
  _cache.set(key, { data, expiresAt: Date.now() + ttlMs });
}

// ─── Overpass query builders ──────────────────────────────────────────────────

const CATEGORY_QUERIES: Record<Category, string> = {
  food:       `node["amenity"~"restaurant|cafe|bar|pub|fast_food|food_court|bakery"](around:{r},{lat},{lon});`,
  attraction: `node["tourism"~"attraction|artwork|viewpoint|theme_park"](around:{r},{lat},{lon});`,
  museum:     `node["tourism"="museum"](around:{r},{lat},{lon});`,
  park:       `(node["leisure"~"park|garden|playground"](around:{r},{lat},{lon}); way["leisure"~"park|garden"](around:{r},{lat},{lon}););`,
  landmark:   `(node["historic"](around:{r},{lat},{lon}); node["tourism"~"monument|memorial"](around:{r},{lat},{lon}););`,
  nightlife:  `node["amenity"~"nightclub|bar|pub|casino"](around:{r},{lat},{lon});`,
  shopping:   `(node["shop"](around:{r},{lat},{lon}); node["amenity"~"marketplace|shopping_centre"](around:{r},{lat},{lon}););`,
  transport:  `(node["public_transport"~"station|stop_position"](around:{r},{lat},{lon}); node["amenity"~"bus_station|taxi"](around:{r},{lat},{lon}););`,
  hotel:      `node["tourism"~"hotel|motel|hostel|guest_house"](around:{r},{lat},{lon});`,
  event:      `node["amenity"~"events_venue|theatre|cinema"](around:{r},{lat},{lon});`,
  hidden_gem: `(node["tourism"~"artwork|viewpoint"](around:{r},{lat},{lon}); node["historic"~"ruins|castle|fort"](around:{r},{lat},{lon}););`,
  nature:     `(node["natural"](around:{r},{lat},{lon}); node["leisure"~"nature_reserve|park"](around:{r},{lat},{lon}););`,
  sport:      `node["leisure"~"sports_centre|gym|stadium|pitch"](around:{r},{lat},{lon});`,
  healthcare: `node["amenity"~"hospital|clinic|pharmacy|doctors"](around:{r},{lat},{lon});`,
  other:      `node["name"](around:{r},{lat},{lon});`,
};

function buildQuery(lat: number, lon: number, radius: number, category: Category): string {
  const q = CATEGORY_QUERIES[category]
    .replace(/\{r\}/g, String(radius))
    .replace(/\{lat\}/g, String(lat))
    .replace(/\{lon\}/g, String(lon));
  return `[out:json][timeout:25];\n${q}\nout body center 50;`;
}

function buildMultiCategoryQuery(lat: number, lon: number, radius: number): string {
  // Lean query — 4 key categories only to reduce Overpass load and response time
  return `[out:json][timeout:25];
(
  node["amenity"~"restaurant|cafe|bar|pub|fast_food|bakery"](around:${radius},${lat},${lon});
  node["tourism"~"attraction|museum|artwork|viewpoint"](around:${radius},${lat},${lon});
  node["leisure"~"park|garden"](around:${radius},${lat},${lon});
  node["historic"](around:${radius},${lat},${lon});
);
out body center 60;`;
}

// ─── Overpass HTTP helper with endpoint fallback ───────────────────────────────

interface OverpassNode {
  type: "node" | "way" | "relation";
  id: number;
  lat: number;
  lon: number;
  center?: { lat: number; lon: number };
  tags?: Record<string, string>;
}

interface OverpassResponse {
  elements?: OverpassNode[];
  remark?: string;
}

/**
 * POST a query to Overpass, trying each endpoint in order.
 * Throws only when ALL endpoints have failed.
 */
async function fetchFromOverpass(query: string, timeoutMs = 15000): Promise<OverpassResponse> {
  let lastError: Error = new Error("No Overpass endpoints available");

  for (const endpoint of OVERPASS_ENDPOINTS) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);

    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: `data=${encodeURIComponent(query)}`,
        signal: controller.signal,
      });
      clearTimeout(timer);

      // Rate-limited or this endpoint is overloaded — try next
      if (response.status === 429 || response.status === 503 || response.status === 504) {
        lastError = new Error(`Overpass ${response.status} at ${endpoint}`);
        continue;
      }

      if (!response.ok) {
        lastError = new Error(`Overpass HTTP ${response.status} at ${endpoint}`);
        continue;
      }

      // Parse JSON safely — Overpass sometimes sends HTML error pages
      let data: OverpassResponse;
      try {
        data = await response.json();
      } catch {
        lastError = new Error(`Overpass returned non-JSON from ${endpoint}`);
        continue;
      }

      // Overpass may return 200 with a remark but no elements (overload mode)
      if (!Array.isArray(data.elements)) {
        const remark = data.remark ?? "no elements in response";
        // If it says "overload", try next endpoint; otherwise treat as empty result
        if (remark.toLowerCase().includes("overload") || remark.toLowerCase().includes("timeout")) {
          lastError = new Error(`Overpass overloaded at ${endpoint}: ${remark}`);
          continue;
        }
        // Not an overload — just empty results (valid)
        return { elements: [] };
      }

      return data;
    } catch (err) {
      clearTimeout(timer);
      const isAbort = (err as Error).name === "AbortError";
      lastError = new Error(
        isAbort
          ? `Overpass timeout after ${timeoutMs}ms at ${endpoint}`
          : `Overpass fetch error at ${endpoint}: ${(err as Error).message}`
      );
      // Continue to next endpoint
    }
  }

  throw lastError;
}

// ─── OSM → Place conversion ───────────────────────────────────────────────────

function tagToCategory(tags: Record<string, string>): Category {
  if (tags.amenity && ["restaurant", "cafe", "bar", "pub", "fast_food", "bakery", "food_court"].includes(tags.amenity)) return "food";
  if (tags.tourism === "museum") return "museum";
  if (tags.tourism && ["attraction", "artwork", "viewpoint", "theme_park"].includes(tags.tourism)) return "attraction";
  if (tags.leisure && ["park", "garden", "playground"].includes(tags.leisure)) return "park";
  if (tags.historic) return "landmark";
  if (tags.amenity && ["nightclub", "casino"].includes(tags.amenity)) return "nightlife";
  if (tags.shop) return "shopping";
  if (tags.public_transport || tags.amenity === "bus_station") return "transport";
  if (tags.tourism && ["hotel", "motel", "hostel", "guest_house"].includes(tags.tourism)) return "hotel";
  if (tags.amenity && ["events_venue", "theatre", "cinema"].includes(tags.amenity)) return "event";
  if (tags.natural) return "nature";
  if (tags.leisure && ["sports_centre", "gym", "stadium", "pitch"].includes(tags.leisure)) return "sport";
  if (tags.amenity && ["hospital", "clinic", "pharmacy", "doctors"].includes(tags.amenity)) return "healthcare";
  return "other";
}

function nodeToPlace(node: OverpassNode, userCoords?: Coordinates): Place {
  const { lat, lon } = node.type === "node"
    ? { lat: node.lat, lon: node.lon }
    : { lat: node.center?.lat ?? 0, lon: node.center?.lon ?? 0 };

  const tags = node.tags || {};
  const category = tagToCategory(tags);

  const distance = userCoords ? haversineDistance(userCoords, { lat, lon }) : undefined;

  const address = [
    tags["addr:housenumber"],
    tags["addr:street"],
    tags["addr:city"],
  ].filter(Boolean).join(", ") || tags["addr:full"] || undefined;

  return {
    id: `osm-${node.type}-${node.id}`,
    name: tags.name || tags["name:en"] || "Unnamed Place",
    category,
    description: tags.description || tags.note || undefined,
    address,
    coordinates: { lat, lon },
    distance,
    phone: tags.phone || tags["contact:phone"] || undefined,
    website: tags.website || tags["contact:website"] || undefined,
    tags,
    source: "overpass",
    openingHours: tags.opening_hours
      ? { open: true, text: tags.opening_hours }
      : undefined,
  };
}

// ─── Public API ────────────────────────────────────────────────────────────────

export async function fetchNearbyPlaces(query: NearbyQuery): Promise<Place[]> {
  const { lat, lon, radius = 2000, category, limit = 50 } = query;

  // Round coords to 3 dp for cache key (~100 m granularity)
  const cacheKey = `nearby:${lat.toFixed(3)},${lon.toFixed(3)},${radius},${category ?? "all"}`;
  const cached = getCached(cacheKey);
  if (cached) return cached.slice(0, limit);

  const overpassQuery = category
    ? buildQuery(lat, lon, radius, category)
    : buildMultiCategoryQuery(lat, lon, radius);

  const data = await fetchFromOverpass(overpassQuery, 15000);
  const userCoords: Coordinates = { lat, lon };

  // elements is guaranteed to be an array by fetchFromOverpass
  const elements = data.elements ?? [];

  const places = elements
    .filter((el) => el.tags?.name)
    .map((el) => nodeToPlace(el, userCoords))
    .filter((p) => p.coordinates.lat !== 0 || p.coordinates.lon !== 0) // drop malformed coords
    .sort((a, b) => (a.distance ?? 0) - (b.distance ?? 0))
    .slice(0, limit);

  if (places.length > 0) {
    setCached(cacheKey, places, 5 * 60 * 1000); // 5-minute TTL
  }

  return places;
}

export async function fetchPlaceById(osmId: string): Promise<Place | null> {
  const match = osmId.match(/^osm-(node|way|relation)-(\d+)$/);
  if (!match) return null;

  const [, type, id] = match;
  const query = `[out:json][timeout:15];\n${type}(${id});\nout body center;`;

  let data: OverpassResponse;
  try {
    data = await fetchFromOverpass(query, 12000);
  } catch {
    return null;
  }

  const elements = data.elements ?? [];
  if (!elements.length) return null;

  return nodeToPlace(elements[0]);
}

export async function fetchEvents(
  lat: number,
  lon: number,
  radius: number = 5000
): Promise<Place[]> {
  const cacheKey = `events:${lat.toFixed(3)},${lon.toFixed(3)},${radius}`;
  const cached = getCached(cacheKey);
  if (cached) return cached;

  const query = `[out:json][timeout:20];
(
  node["amenity"~"events_venue|community_centre|theatre|cinema"](around:${radius},${lat},${lon});
  node["leisure"="stadium"](around:${radius},${lat},${lon});
);
out body center 40;`;

  let data: OverpassResponse;
  try {
    data = await fetchFromOverpass(query, 18000);
  } catch {
    return [];
  }

  const userCoords: Coordinates = { lat, lon };
  const elements = data.elements ?? [];

  const places = elements
    .filter((el) => el.tags?.name)
    .map((el) => ({ ...nodeToPlace(el, userCoords), category: "event" as Category }))
    .sort((a, b) => (a.distance ?? 0) - (b.distance ?? 0))
    .slice(0, 30);

  if (places.length > 0) {
    setCached(cacheKey, places, 10 * 60 * 1000);
  }
  return places;
}

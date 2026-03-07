import type { Place, Category, NearbyQuery, Coordinates } from "@/types";

const OVERPASS_API = "https://overpass-api.de/api/interpreter";

const CATEGORY_QUERIES: Record<Category, string> = {
  food: `node["amenity"~"restaurant|cafe|bar|pub|fast_food|food_court|bakery"](around:{radius},{lat},{lon});`,
  attraction: `node["tourism"~"attraction|artwork|viewpoint|theme_park"](around:{radius},{lat},{lon});`,
  museum: `node["tourism"="museum"](around:{radius},{lat},{lon});`,
  park: `(node["leisure"~"park|garden|playground"](around:{radius},{lat},{lon}); way["leisure"~"park|garden"](around:{radius},{lat},{lon}););`,
  landmark: `(node["historic"](around:{radius},{lat},{lon}); node["tourism"~"monument|memorial"](around:{radius},{lat},{lon}););`,
  nightlife: `node["amenity"~"nightclub|bar|pub|casino"](around:{radius},{lat},{lon});`,
  shopping: `(node["shop"](around:{radius},{lat},{lon}); node["amenity"~"marketplace|shopping_centre"](around:{radius},{lat},{lon}););`,
  transport: `(node["public_transport"~"station|stop_position"](around:{radius},{lat},{lon}); node["amenity"~"bus_station|taxi"](around:{radius},{lat},{lon}););`,
  hotel: `node["tourism"~"hotel|motel|hostel|guest_house"](around:{radius},{lat},{lon});`,
  event: `node["amenity"~"events_venue|theatre|cinema"](around:{radius},{lat},{lon});`,
  hidden_gem: `(node["tourism"~"artwork|viewpoint"](around:{radius},{lat},{lon}); node["historic"~"ruins|castle|fort"](around:{radius},{lat},{lon}););`,
  nature: `(node["natural"](around:{radius},{lat},{lon}); node["leisure"~"nature_reserve|park"](around:{radius},{lat},{lon}););`,
  sport: `node["leisure"~"sports_centre|gym|stadium|pitch"](around:{radius},{lat},{lon});`,
  healthcare: `node["amenity"~"hospital|clinic|pharmacy|doctors"](around:{radius},{lat},{lon});`,
  other: `node["name"](around:{radius},{lat},{lon});`,
};

function buildQuery(
  lat: number,
  lon: number,
  radius: number,
  category: Category
): string {
  const categoryQuery = CATEGORY_QUERIES[category].replace(
    /\{radius\}/g,
    radius.toString()
  ).replace(/\{lat\}/g, lat.toString()).replace(/\{lon\}/g, lon.toString());

  return `[out:json][timeout:30];
${categoryQuery}
out body center 50;`;
}

function buildMultiCategoryQuery(
  lat: number,
  lon: number,
  radius: number
): string {
  return `[out:json][timeout:30];
(
  node["amenity"~"restaurant|cafe|bar|pub|fast_food"](around:${radius},${lat},${lon});
  node["tourism"~"attraction|museum|artwork|viewpoint"](around:${radius},${lat},${lon});
  node["leisure"~"park|garden"](around:${radius},${lat},${lon});
  node["historic"](around:${radius},${lat},${lon});
  node["shop"~"mall|department_store|market"](around:${radius},${lat},${lon});
  node["amenity"~"theatre|cinema|events_venue"](around:${radius},${lat},${lon});
);
out body center 80;`;
}

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

  let distance: number | undefined;
  if (userCoords) {
    distance = haversineDistance(userCoords, { lat, lon });
  }

  const address = [
    tags["addr:housenumber"],
    tags["addr:street"],
    tags["addr:city"],
  ]
    .filter(Boolean)
    .join(", ") || tags["addr:full"] || undefined;

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

function haversineDistance(a: Coordinates, b: Coordinates): number {
  const R = 6371000; // meters
  const dLat = ((b.lat - a.lat) * Math.PI) / 180;
  const dLon = ((b.lon - a.lon) * Math.PI) / 180;
  const lat1 = (a.lat * Math.PI) / 180;
  const lat2 = (b.lat * Math.PI) / 180;
  const x =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(x), Math.sqrt(1 - x));
}

interface OverpassNode {
  type: "node" | "way" | "relation";
  id: number;
  lat: number;
  lon: number;
  center?: { lat: number; lon: number };
  tags?: Record<string, string>;
}

interface OverpassResponse {
  elements: OverpassNode[];
}

export async function fetchNearbyPlaces(
  query: NearbyQuery
): Promise<Place[]> {
  const { lat, lon, radius = 2000, category, limit = 50 } = query;

  const overpassQuery = category
    ? buildQuery(lat, lon, radius, category)
    : buildMultiCategoryQuery(lat, lon, radius);

  const response = await fetch(OVERPASS_API, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: `data=${encodeURIComponent(overpassQuery)}`,
    signal: AbortSignal.timeout(35000),
  });

  if (!response.ok) {
    throw new Error(`Overpass API error: ${response.status}`);
  }

  const data: OverpassResponse = await response.json();
  const userCoords: Coordinates = { lat, lon };

  return data.elements
    .filter((el) => el.tags?.name)
    .map((el) => nodeToPlace(el, userCoords))
    .sort((a, b) => (a.distance ?? 0) - (b.distance ?? 0))
    .slice(0, limit);
}

export async function fetchPlaceById(osmId: string): Promise<Place | null> {
  const match = osmId.match(/^osm-(node|way|relation)-(\d+)$/);
  if (!match) return null;

  const [, type, id] = match;

  const query = `[out:json][timeout:15];
${type}(${id});
out body center;`;

  const response = await fetch(OVERPASS_API, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: `data=${encodeURIComponent(query)}`,
    signal: AbortSignal.timeout(20000),
  });

  if (!response.ok) return null;

  const data: OverpassResponse = await response.json();
  if (!data.elements.length) return null;

  return nodeToPlace(data.elements[0]);
}

export async function fetchEvents(
  lat: number,
  lon: number,
  radius: number = 5000
): Promise<Place[]> {
  const query = `[out:json][timeout:30];
(
  node["amenity"~"events_venue|community_centre|theatre|cinema"](around:${radius},${lat},${lon});
  node["leisure"="stadium"](around:${radius},${lat},${lon});
  node["tourism"="attraction"]["event"](around:${radius},${lat},${lon});
);
out body center 40;`;

  const response = await fetch(OVERPASS_API, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: `data=${encodeURIComponent(query)}`,
    signal: AbortSignal.timeout(35000),
  });

  if (!response.ok) throw new Error(`Overpass API error: ${response.status}`);

  const data: OverpassResponse = await response.json();
  const userCoords: Coordinates = { lat, lon };

  return data.elements
    .filter((el) => el.tags?.name)
    .map((el) => ({ ...nodeToPlace(el, userCoords), category: "event" as Category }))
    .sort((a, b) => (a.distance ?? 0) - (b.distance ?? 0))
    .slice(0, 30);
}

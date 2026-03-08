import type { SearchResult, Coordinates, Place, Category } from "@/types";

const NOMINATIM_BASE = "https://nominatim.openstreetmap.org";

const HEADERS = {
  "User-Agent": "Tripant/1.0 (travel assistant app)",
  "Accept-Language": "en",
};

interface NominatimPlace {
  place_id: number;
  osm_type: string;
  osm_id: number;
  lat: string;
  lon: string;
  display_name: string;
  name?: string;
  type?: string;
  class?: string;
  address?: {
    city?: string;
    town?: string;
    village?: string;
    country?: string;
    state?: string;
    road?: string;
    house_number?: string;
    postcode?: string;
    country_code?: string;
  };
  boundingbox?: string[];
  importance?: number;
}

function nominatimToSearchResult(place: NominatimPlace): SearchResult {
  const type = classifyType(place.class || "", place.type || "");
  return {
    id: `nom-${place.osm_type}-${place.osm_id}`,
    name: place.name || place.display_name.split(",")[0],
    type,
    coordinates: {
      lat: parseFloat(place.lat),
      lon: parseFloat(place.lon),
    },
    address: place.display_name,
  };
}

function classifyType(cls: string, type: string): SearchResult["type"] {
  if (["city", "town", "village", "municipality", "administrative"].includes(type)) return "city";
  if (["restaurant", "cafe", "bar", "pub", "fast_food"].includes(type)) return "restaurant";
  if (["museum", "attraction", "artwork", "viewpoint", "theme_park"].includes(type)) return "attraction";
  if (["monument", "memorial", "historic", "castle", "fort"].includes(type)) return "landmark";
  return "place";
}

export async function searchPlaces(query: string, limit = 10): Promise<SearchResult[]> {
  if (!query || query.length < 2) return [];

  const params = new URLSearchParams({
    q: query,
    format: "json",
    limit: limit.toString(),
    addressdetails: "1",
    extratags: "1",
    namedetails: "1",
  });

  const response = await fetch(`${NOMINATIM_BASE}/search?${params}`, {
    headers: HEADERS,
    signal: AbortSignal.timeout(10000),
  });

  if (!response.ok) throw new Error(`Nominatim search error: ${response.status}`);

  const data: NominatimPlace[] = await response.json();
  return data.map(nominatimToSearchResult);
}

export async function reverseGeocode(coords: Coordinates): Promise<{
  city?: string;
  country?: string;
  address?: string;
  displayName?: string;
} | null> {
  const params = new URLSearchParams({
    lat: coords.lat.toString(),
    lon: coords.lon.toString(),
    format: "json",
    addressdetails: "1",
    zoom: "14",
  });

  const response = await fetch(`${NOMINATIM_BASE}/reverse?${params}`, {
    headers: HEADERS,
    signal: AbortSignal.timeout(10000),
  });

  if (!response.ok) return null;

  const data: NominatimPlace = await response.json();
  const addr = data.address || {};

  return {
    city: addr.city || addr.town || addr.village,
    country: addr.country,
    address: data.display_name,
    displayName: data.display_name,
  };
}

export async function geocodeCity(cityName: string): Promise<Coordinates | null> {
  const params = new URLSearchParams({
    q: cityName,
    format: "json",
    limit: "1",
    featuretype: "city",
  });

  const response = await fetch(`${NOMINATIM_BASE}/search?${params}`, {
    headers: HEADERS,
    signal: AbortSignal.timeout(10000),
  });

  if (!response.ok) return null;

  const data: NominatimPlace[] = await response.json();
  if (!data.length) return null;

  return {
    lat: parseFloat(data[0].lat),
    lon: parseFloat(data[0].lon),
  };
}

export async function nominatimToPlace(result: SearchResult): Promise<Place> {
  return {
    id: result.id,
    name: result.name,
    category: (result.category as Category) || "other",
    address: result.address,
    coordinates: result.coordinates,
    source: "nominatim",
  };
}

// Map osm_type letter prefix used by Nominatim lookup endpoint
const OSM_TYPE_LETTER: Record<string, string> = {
  node: "N",
  way: "W",
  relation: "R",
  n: "N",
  w: "W",
  r: "R",
};

export async function fetchPlaceByNominatimId(nomId: string): Promise<Place | null> {
  // Expect format: nom-{node|way|relation}-{numeric_id}
  const match = nomId.match(/^nom-([a-z]+)-(\d+)$/i);
  if (!match) return null;

  const [, osmType, osmId] = match;
  const typePrefix = OSM_TYPE_LETTER[osmType.toLowerCase()];
  if (!typePrefix) return null;

  const params = new URLSearchParams({
    osm_ids: `${typePrefix}${osmId}`,
    format: "json",
    addressdetails: "1",
    extratags: "1",
    namedetails: "1",
  });

  const response = await fetch(`${NOMINATIM_BASE}/lookup?${params}`, {
    headers: HEADERS,
    signal: AbortSignal.timeout(10000),
  });

  if (!response.ok) return null;

  const data: NominatimPlace[] = await response.json();
  if (!data.length) return null;

  const p = data[0];
  const addr = p.address || {};
  const addressStr = [
    addr.house_number,
    addr.road,
    addr.city || addr.town || addr.village,
    addr.country,
  ].filter(Boolean).join(", ") || p.display_name;

  const classStr = p.class || "";
  const typeStr = p.type || "";
  const category = nominatimClassToCategory(classStr, typeStr);

  return {
    id: nomId,
    name: p.name || p.display_name.split(",")[0],
    category,
    address: addressStr,
    coordinates: {
      lat: parseFloat(p.lat),
      lon: parseFloat(p.lon),
    },
    description: undefined,
    source: "nominatim",
  };
}

function nominatimClassToCategory(cls: string, type: string): Category {
  if (["restaurant", "cafe", "bar", "pub", "fast_food", "bakery"].includes(type)) return "food";
  if (type === "museum") return "museum";
  if (["attraction", "artwork", "viewpoint", "theme_park"].includes(type)) return "attraction";
  if (["park", "garden", "nature_reserve"].includes(type)) return "park";
  if (["monument", "memorial", "ruins", "castle"].includes(type) || cls === "historic") return "landmark";
  if (["nightclub", "casino"].includes(type)) return "nightlife";
  if (cls === "shop" || ["mall", "marketplace"].includes(type)) return "shopping";
  if (cls === "public_transport" || ["bus_station", "station"].includes(type)) return "transport";
  if (["hotel", "motel", "hostel", "guest_house"].includes(type)) return "hotel";
  if (["events_venue", "theatre", "cinema"].includes(type)) return "event";
  if (cls === "natural") return "nature";
  if (["sports_centre", "gym", "stadium"].includes(type)) return "sport";
  if (["hospital", "clinic", "pharmacy", "doctors"].includes(type)) return "healthcare";
  return "other";
}

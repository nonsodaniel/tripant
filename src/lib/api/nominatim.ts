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

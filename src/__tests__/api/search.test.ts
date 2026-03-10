/**
 * @jest-environment node
 */
import { GET } from "@/app/api/search/route";
import { NextRequest } from "next/server";

jest.mock("@/lib/api/nominatim", () => ({
  searchPlaces: jest.fn(),
}));

jest.mock("@/lib/api/overpass", () => ({
  fetchNearbyPlaces: jest.fn(),
  fetchEvents: jest.fn(),
}));

import { searchPlaces } from "@/lib/api/nominatim";
import { fetchNearbyPlaces } from "@/lib/api/overpass";

const mockSearchPlaces = searchPlaces as jest.MockedFunction<typeof searchPlaces>;
const mockFetchNearbyPlaces = fetchNearbyPlaces as jest.MockedFunction<typeof fetchNearbyPlaces>;

const mockSearchResults = [
  {
    id: "nominatim-1",
    name: "Paris",
    type: "city" as const,
    coordinates: { lat: 48.8566, lon: 2.3522 },
    address: "Paris, France",
  },
];

const mockPlaces = [
  {
    id: "osm-node-1",
    name: "Louvre Museum",
    category: "museum" as const,
    coordinates: { lat: 48.8606, lon: 2.3376 },
    source: "overpass" as const,
  },
];

function makeRequest(params: Record<string, string>): NextRequest {
  const url = new URL("http://localhost:3000/api/search");
  Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));
  return new NextRequest(url.toString());
}

beforeEach(() => {
  jest.clearAllMocks();
});

describe("GET /api/search", () => {
  it("returns empty array when query is too short", async () => {
    const req = makeRequest({ q: "a" });
    const res = await GET(req);
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body).toEqual([]);
  });

  it("returns empty array when no query provided", async () => {
    const req = makeRequest({});
    const res = await GET(req);
    const body = await res.json();
    expect(body).toEqual([]);
  });

  it("returns search results for valid query", async () => {
    mockSearchPlaces.mockResolvedValueOnce(mockSearchResults);
    const req = makeRequest({ q: "Paris" });
    const res = await GET(req);
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body).toHaveLength(1);
    expect(body[0].name).toBe("Paris");
  });

  it("fetches from Overpass when category + location provided", async () => {
    mockFetchNearbyPlaces.mockResolvedValueOnce(mockPlaces);
    const req = makeRequest({
      category: "museum",
      lat: "48.86",
      lon: "2.34",
    });
    const res = await GET(req);
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body[0].name).toBe("Louvre Museum");
    expect(mockFetchNearbyPlaces).toHaveBeenCalledWith(
      expect.objectContaining({ category: "museum", lat: 48.86, lon: 2.34 })
    );
  });

  it("returns 503 when Overpass throws in category mode", async () => {
    mockFetchNearbyPlaces.mockRejectedValueOnce(new Error("timeout"));
    const req = makeRequest({ category: "food", lat: "48.86", lon: "2.34" });
    const res = await GET(req);
    expect(res.status).toBe(503);
  });

  it("returns 503 when Nominatim throws", async () => {
    mockSearchPlaces.mockRejectedValueOnce(new Error("network error"));
    const req = makeRequest({ q: "London" });
    const res = await GET(req);
    expect(res.status).toBe(503);
    const body = await res.json();
    expect(body.error).toContain("unavailable");
  });

  it("returns places format when asPlaces=true", async () => {
    mockSearchPlaces.mockResolvedValueOnce(mockSearchResults);
    const req = makeRequest({ q: "Paris", asPlaces: "true" });
    const res = await GET(req);
    const body = await res.json();
    expect(body[0]).toHaveProperty("category");
    expect(body[0]).toHaveProperty("coordinates");
    expect(body[0].source).toBe("nominatim");
  });
});

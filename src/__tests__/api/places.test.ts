/**
 * @jest-environment node
 */
import { GET } from "@/app/api/places/route";
import { NextRequest } from "next/server";

// Mock the overpass module
jest.mock("@/lib/api/overpass", () => ({
  fetchNearbyPlaces: jest.fn(),
}));

import { fetchNearbyPlaces } from "@/lib/api/overpass";
const mockFetchNearbyPlaces = fetchNearbyPlaces as jest.MockedFunction<typeof fetchNearbyPlaces>;

const mockPlaces = [
  {
    id: "osm-node-1",
    name: "Cafe Central",
    category: "food" as const,
    coordinates: { lat: 48.86, lon: 2.34 },
    source: "overpass" as const,
  },
];

function makeRequest(params: Record<string, string>): NextRequest {
  const url = new URL("http://localhost:3000/api/places");
  Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));
  return new NextRequest(url.toString());
}

beforeEach(() => {
  jest.clearAllMocks();
});

describe("GET /api/places", () => {
  it("returns 400 when lat/lon are missing", async () => {
    const req = makeRequest({});
    const res = await GET(req);
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toContain("lat and lon");
  });

  it("returns 400 when lat is not a number", async () => {
    const req = makeRequest({ lat: "abc", lon: "2.34" });
    const res = await GET(req);
    expect(res.status).toBe(400);
  });

  it("returns 400 when lon is not a number", async () => {
    const req = makeRequest({ lat: "48.86", lon: "xyz" });
    const res = await GET(req);
    expect(res.status).toBe(400);
  });

  it("returns 200 with places on success", async () => {
    mockFetchNearbyPlaces.mockResolvedValueOnce(mockPlaces);
    const req = makeRequest({ lat: "48.86", lon: "2.34" });
    const res = await GET(req);
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body).toHaveLength(1);
    expect(body[0].name).toBe("Cafe Central");
  });

  it("passes category parameter to fetchNearbyPlaces", async () => {
    mockFetchNearbyPlaces.mockResolvedValueOnce([]);
    const req = makeRequest({ lat: "48.86", lon: "2.34", category: "museum" });
    await GET(req);
    expect(mockFetchNearbyPlaces).toHaveBeenCalledWith(
      expect.objectContaining({ category: "museum" })
    );
  });

  it("passes radius parameter and caps it at 10000", async () => {
    mockFetchNearbyPlaces.mockResolvedValueOnce([]);
    const req = makeRequest({ lat: "48.86", lon: "2.34", radius: "50000" });
    await GET(req);
    expect(mockFetchNearbyPlaces).toHaveBeenCalledWith(
      expect.objectContaining({ radius: 10000 })
    );
  });

  it("caps limit at 100", async () => {
    mockFetchNearbyPlaces.mockResolvedValueOnce([]);
    const req = makeRequest({ lat: "48.86", lon: "2.34", limit: "200" });
    await GET(req);
    expect(mockFetchNearbyPlaces).toHaveBeenCalledWith(
      expect.objectContaining({ limit: 100 })
    );
  });

  it("returns 503 when fetchNearbyPlaces throws", async () => {
    mockFetchNearbyPlaces.mockRejectedValueOnce(new Error("Overpass timeout"));
    const req = makeRequest({ lat: "48.86", lon: "2.34" });
    const res = await GET(req);
    expect(res.status).toBe(503);
    const body = await res.json();
    expect(body.error).toContain("unavailable");
  });

  it("includes Retry-After header on 503", async () => {
    mockFetchNearbyPlaces.mockRejectedValueOnce(new Error("fail"));
    const req = makeRequest({ lat: "48.86", lon: "2.34" });
    const res = await GET(req);
    expect(res.headers.get("Retry-After")).toBe("5");
  });

  it("returns empty array when no places found", async () => {
    mockFetchNearbyPlaces.mockResolvedValueOnce([]);
    const req = makeRequest({ lat: "48.86", lon: "2.34" });
    const res = await GET(req);
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body).toEqual([]);
  });
});

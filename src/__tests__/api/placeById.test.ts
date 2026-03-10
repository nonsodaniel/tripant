/**
 * @jest-environment node
 */
import { GET } from "@/app/api/places/[id]/route";
import { NextRequest } from "next/server";

jest.mock("@/lib/api/overpass", () => ({
  fetchPlaceById: jest.fn(),
  fetchNearbyPlaces: jest.fn(),
  fetchEvents: jest.fn(),
}));

jest.mock("@/lib/api/nominatim", () => ({
  searchPlaces: jest.fn(),
  fetchPlaceByNominatimId: jest.fn(),
}));

import { fetchPlaceById } from "@/lib/api/overpass";
import { fetchPlaceByNominatimId } from "@/lib/api/nominatim";

const mockFetchPlaceById = fetchPlaceById as jest.MockedFunction<typeof fetchPlaceById>;
const mockFetchPlaceByNominatimId = fetchPlaceByNominatimId as jest.MockedFunction<typeof fetchPlaceByNominatimId>;

const mockPlace = {
  id: "osm-node-123",
  name: "Big Ben",
  category: "landmark" as const,
  coordinates: { lat: 51.5007, lon: -0.1246 },
  source: "overpass" as const,
};

function makeRequest(id: string): NextRequest {
  const url = new URL(`http://localhost:3000/api/places/${id}`);
  return new NextRequest(url.toString());
}

function makeParams(id: string) {
  return { params: Promise.resolve({ id }) };
}

beforeEach(() => {
  jest.clearAllMocks();
});

describe("GET /api/places/[id]", () => {
  it("returns 404 when place not found", async () => {
    mockFetchPlaceById.mockResolvedValueOnce(null);
    const res = await GET(makeRequest("osm-node-999"), makeParams("osm-node-999"));
    expect(res.status).toBe(404);
    const body = await res.json();
    expect(body.error).toContain("not found");
  });

  it("returns place data for OSM id", async () => {
    mockFetchPlaceById.mockResolvedValueOnce(mockPlace);
    const res = await GET(
      makeRequest("osm-node-123"),
      makeParams("osm-node-123")
    );
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.name).toBe("Big Ben");
  });

  it("calls fetchPlaceByNominatimId for nom- prefix", async () => {
    mockFetchPlaceByNominatimId.mockResolvedValueOnce({
      ...mockPlace,
      id: "nom-42",
      source: "nominatim",
    });
    const res = await GET(makeRequest("nom-42"), makeParams("nom-42"));
    expect(res.status).toBe(200);
    expect(mockFetchPlaceByNominatimId).toHaveBeenCalledWith("nom-42");
    expect(mockFetchPlaceById).not.toHaveBeenCalled();
  });

  it("returns 503 when fetchPlaceById throws", async () => {
    mockFetchPlaceById.mockRejectedValueOnce(new Error("Timeout"));
    const res = await GET(makeRequest("osm-node-123"), makeParams("osm-node-123"));
    expect(res.status).toBe(503);
    const body = await res.json();
    expect(body.error).toContain("unavailable");
  });

  it("decodes URL-encoded place id", async () => {
    mockFetchPlaceById.mockResolvedValueOnce(mockPlace);
    // Encoded "osm-node-123"
    const res = await GET(
      makeRequest("osm-node-123"),
      makeParams("osm-node-123")
    );
    expect(res.status).toBe(200);
  });
});

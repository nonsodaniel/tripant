/**
 * @jest-environment node
 */
import { GET } from "@/app/api/events/route";
import { NextRequest } from "next/server";

jest.mock("@/lib/api/overpass", () => ({
  fetchEvents: jest.fn(),
  fetchNearbyPlaces: jest.fn(),
}));

import { fetchEvents } from "@/lib/api/overpass";
const mockFetchEvents = fetchEvents as jest.MockedFunction<typeof fetchEvents>;

const mockEvents = [
  {
    id: "osm-node-10",
    name: "City Theatre",
    category: "event" as const,
    coordinates: { lat: 48.86, lon: 2.34 },
    source: "overpass" as const,
  },
];

function makeRequest(params: Record<string, string>): NextRequest {
  const url = new URL("http://localhost:3000/api/events");
  Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));
  return new NextRequest(url.toString());
}

beforeEach(() => {
  jest.clearAllMocks();
});

describe("GET /api/events", () => {
  it("returns 400 when lat/lon missing", async () => {
    const req = makeRequest({});
    const res = await GET(req);
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toContain("lat and lon");
  });

  it("returns events on success", async () => {
    mockFetchEvents.mockResolvedValueOnce(mockEvents);
    const req = makeRequest({ lat: "48.86", lon: "2.34" });
    const res = await GET(req);
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body).toHaveLength(1);
    expect(body[0].name).toBe("City Theatre");
  });

  it("uses default radius of 5000", async () => {
    mockFetchEvents.mockResolvedValueOnce([]);
    const req = makeRequest({ lat: "48.86", lon: "2.34" });
    await GET(req);
    expect(mockFetchEvents).toHaveBeenCalledWith(48.86, 2.34, 5000);
  });

  it("caps radius at 10000", async () => {
    mockFetchEvents.mockResolvedValueOnce([]);
    const req = makeRequest({ lat: "48.86", lon: "2.34", radius: "50000" });
    await GET(req);
    expect(mockFetchEvents).toHaveBeenCalledWith(48.86, 2.34, 10000);
  });

  it("returns 503 when fetchEvents throws", async () => {
    mockFetchEvents.mockRejectedValueOnce(new Error("Overpass down"));
    const req = makeRequest({ lat: "48.86", lon: "2.34" });
    const res = await GET(req);
    expect(res.status).toBe(503);
    const body = await res.json();
    expect(body.error).toContain("unavailable");
  });

  it("includes Retry-After header on error", async () => {
    mockFetchEvents.mockRejectedValueOnce(new Error("fail"));
    const req = makeRequest({ lat: "48.86", lon: "2.34" });
    const res = await GET(req);
    expect(res.headers.get("Retry-After")).toBe("5");
  });
});

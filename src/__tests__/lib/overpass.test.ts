/**
 * Tests for the Overpass API library functions.
 * We mock global fetch to avoid real HTTP requests.
 * Each test uses unique coordinates to avoid hitting the in-memory cache.
 */

const mockFetch = jest.fn();
global.fetch = mockFetch;

// Reset modules between tests to clear the in-memory cache
beforeEach(() => {
  jest.resetModules();
  mockFetch.mockReset();
});

const overpassResponse = (elements: object[]) =>
  Promise.resolve({
    ok: true,
    status: 200,
    json: async () => ({ elements }),
  } as Response);

const namedNode = (id: number, lat: number, lon: number, tags: Record<string, string> = {}) => ({
  type: "node",
  id,
  lat,
  lon,
  tags: { name: `Place ${id}`, ...tags },
});

// Helper: get a fresh module import (bypasses cache since jest.resetModules was called)
async function getOverpass() {
  return await import("@/lib/api/overpass");
}

describe("fetchNearbyPlaces", () => {
  it("returns places from Overpass", async () => {
    const { fetchNearbyPlaces } = await getOverpass();
    mockFetch.mockReturnValueOnce(
      overpassResponse([
        namedNode(1, 51.01, -0.02, { amenity: "restaurant" }),
        namedNode(2, 51.02, -0.03, { tourism: "museum" }),
      ])
    );

    const places = await fetchNearbyPlaces({ lat: 51.0, lon: -0.0 });
    expect(places).toHaveLength(2);
    expect(places[0].source).toBe("overpass");
  });

  it("filters out elements without a name", async () => {
    const { fetchNearbyPlaces } = await getOverpass();
    mockFetch.mockReturnValueOnce(
      overpassResponse([
        { type: "node", id: 1, lat: 52.0, lon: 1.0, tags: {} }, // no name
        namedNode(2, 52.01, 1.01, { amenity: "cafe" }),
      ])
    );

    const places = await fetchNearbyPlaces({ lat: 52.0, lon: 1.0 });
    expect(places).toHaveLength(1);
    expect(places[0].name).toBe("Place 2");
  });

  it("assigns correct category based on tags", async () => {
    const { fetchNearbyPlaces } = await getOverpass();
    mockFetch.mockReturnValueOnce(
      overpassResponse([
        namedNode(1, 53.0, 2.0, { amenity: "restaurant" }),
        namedNode(2, 53.01, 2.01, { tourism: "museum" }),
        namedNode(3, 53.02, 2.02, { leisure: "park" }),
        namedNode(4, 53.03, 2.03, { historic: "castle" }),
      ])
    );

    const places = await fetchNearbyPlaces({ lat: 53.0, lon: 2.0 });
    expect(places.find((p) => p.name === "Place 1")!.category).toBe("food");
    expect(places.find((p) => p.name === "Place 2")!.category).toBe("museum");
    expect(places.find((p) => p.name === "Place 3")!.category).toBe("park");
    expect(places.find((p) => p.name === "Place 4")!.category).toBe("landmark");
  });

  it("calculates distance from user coordinates", async () => {
    const { fetchNearbyPlaces } = await getOverpass();
    mockFetch.mockReturnValueOnce(
      overpassResponse([namedNode(1, 54.01, 3.01)])
    );

    const places = await fetchNearbyPlaces({ lat: 54.0, lon: 3.0 });
    expect(places[0].distance).toBeDefined();
    expect(places[0].distance!).toBeGreaterThan(0);
  });

  it("sorts results by distance ascending", async () => {
    const { fetchNearbyPlaces } = await getOverpass();
    mockFetch.mockReturnValueOnce(
      overpassResponse([
        namedNode(1, 55.5, 4.0), // farther
        namedNode(2, 55.001, 4.0), // closer
      ])
    );

    const places = await fetchNearbyPlaces({ lat: 55.0, lon: 4.0 });
    expect(places[0].distance!).toBeLessThan(places[1].distance!);
  });

  it("respects the limit parameter", async () => {
    const { fetchNearbyPlaces } = await getOverpass();
    const elements = Array.from({ length: 20 }, (_, i) =>
      namedNode(i + 1, 56.0 + i * 0.001, 5.0)
    );
    mockFetch.mockReturnValueOnce(overpassResponse(elements));

    const places = await fetchNearbyPlaces({ lat: 56.0, lon: 5.0, limit: 5 });
    expect(places).toHaveLength(5);
  });

  it("uses category-specific query when category provided", async () => {
    const { fetchNearbyPlaces } = await getOverpass();
    mockFetch.mockReturnValueOnce(overpassResponse([]));
    await fetchNearbyPlaces({ lat: 57.0, lon: 6.0, category: "museum" });

    const body = mockFetch.mock.calls[0][1]?.body as string;
    expect(body).toContain("museum");
  });

  it("throws on network error", async () => {
    const { fetchNearbyPlaces } = await getOverpass();
    mockFetch.mockRejectedValueOnce(new Error("Network unreachable"));
    await expect(fetchNearbyPlaces({ lat: 58.0, lon: 7.0 })).rejects.toThrow(
      "Overpass fetch failed"
    );
  });

  it("throws on 429 rate limit response", async () => {
    const { fetchNearbyPlaces } = await getOverpass();
    mockFetch.mockReturnValueOnce(
      Promise.resolve({ ok: false, status: 429, json: async () => ({}) } as Response)
    );
    await expect(fetchNearbyPlaces({ lat: 59.0, lon: 8.0 })).rejects.toThrow("rate limited");
  });

  it("throws on 503 unavailable response", async () => {
    const { fetchNearbyPlaces } = await getOverpass();
    mockFetch.mockReturnValueOnce(
      Promise.resolve({ ok: false, status: 503, json: async () => ({}) } as Response)
    );
    await expect(fetchNearbyPlaces({ lat: 60.0, lon: 9.0 })).rejects.toThrow("unavailable");
  });

  it("uses cached result on second call with same parameters", async () => {
    const { fetchNearbyPlaces } = await getOverpass();
    mockFetch.mockReturnValue(
      overpassResponse([namedNode(1, 61.001, 10.001, { amenity: "cafe" })])
    );

    // Same rounded coords (61.000, 10.000)
    await fetchNearbyPlaces({ lat: 61.0, lon: 10.0 });
    await fetchNearbyPlaces({ lat: 61.0, lon: 10.0 });

    // Only 1 actual fetch call (second is cached)
    expect(mockFetch).toHaveBeenCalledTimes(1);
  });
});

describe("fetchPlaceById", () => {
  it("returns null for invalid id format", async () => {
    const { fetchPlaceById } = await getOverpass();
    const result = await fetchPlaceById("invalid-format");
    expect(result).toBeNull();
    expect(mockFetch).not.toHaveBeenCalled();
  });

  it("fetches place for valid OSM node id", async () => {
    const { fetchPlaceById } = await getOverpass();
    mockFetch.mockReturnValueOnce(
      overpassResponse([namedNode(123, 62.0, 11.0, { tourism: "attraction" })])
    );

    const place = await fetchPlaceById("osm-node-123");
    expect(place).not.toBeNull();
    expect(place!.id).toBe("osm-node-123");
    expect(place!.category).toBe("attraction");
  });

  it("returns null when element array is empty", async () => {
    const { fetchPlaceById } = await getOverpass();
    mockFetch.mockReturnValueOnce(overpassResponse([]));
    const place = await fetchPlaceById("osm-node-999");
    expect(place).toBeNull();
  });

  it("returns null when API returns non-ok status", async () => {
    const { fetchPlaceById } = await getOverpass();
    mockFetch.mockReturnValueOnce(
      Promise.resolve({ ok: false, status: 404 } as Response)
    );
    const place = await fetchPlaceById("osm-node-123");
    expect(place).toBeNull();
  });
});

describe("fetchEvents", () => {
  it("returns events from Overpass", async () => {
    const { fetchEvents } = await getOverpass();
    mockFetch.mockReturnValueOnce(
      overpassResponse([
        namedNode(1, 63.0, 12.0, { amenity: "theatre" }),
        namedNode(2, 63.01, 12.01, { amenity: "cinema" }),
      ])
    );

    const events = await fetchEvents(63.0, 12.0);
    expect(events).toHaveLength(2);
    expect(events[0].category).toBe("event");
  });

  it("throws when API returns error", async () => {
    const { fetchEvents } = await getOverpass();
    mockFetch.mockReturnValueOnce(
      Promise.resolve({ ok: false, status: 500 } as Response)
    );
    await expect(fetchEvents(64.0, 13.0)).rejects.toThrow("Overpass API error");
  });

  it("limits result to 30 events", async () => {
    const { fetchEvents } = await getOverpass();
    const elements = Array.from({ length: 50 }, (_, i) =>
      namedNode(i + 1, 65.0 + i * 0.001, 14.0, { amenity: "theatre" })
    );
    mockFetch.mockReturnValueOnce(overpassResponse(elements));
    const events = await fetchEvents(65.0, 14.0);
    expect(events.length).toBeLessThanOrEqual(30);
  });
});

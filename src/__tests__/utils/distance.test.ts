import { haversineDistance, formatDistance } from "@/lib/utils/distance";

describe("haversineDistance", () => {
  it("returns 0 for identical coordinates", () => {
    const coord = { lat: 51.5074, lon: -0.1278 };
    expect(haversineDistance(coord, coord)).toBeCloseTo(0, 1);
  });

  it("calculates distance between London and Paris (~340km)", () => {
    const london = { lat: 51.5074, lon: -0.1278 };
    const paris = { lat: 48.8566, lon: 2.3522 };
    const dist = haversineDistance(london, paris);
    // ~340 km
    expect(dist).toBeGreaterThan(330000);
    expect(dist).toBeLessThan(350000);
  });

  it("calculates distance between nearby points", () => {
    const a = { lat: 51.5074, lon: -0.1278 };
    const b = { lat: 51.5174, lon: -0.1278 }; // ~1.11 km north
    const dist = haversineDistance(a, b);
    expect(dist).toBeGreaterThan(1000);
    expect(dist).toBeLessThan(1200);
  });

  it("is symmetric (A→B == B→A)", () => {
    const nyc = { lat: 40.7128, lon: -74.006 };
    const la = { lat: 34.0522, lon: -118.2437 };
    expect(haversineDistance(nyc, la)).toBeCloseTo(haversineDistance(la, nyc), 0);
  });

  it("handles negative coordinates correctly", () => {
    const sydney = { lat: -33.8688, lon: 151.2093 };
    const auckland = { lat: -36.8485, lon: 174.7633 };
    const dist = haversineDistance(sydney, auckland);
    expect(dist).toBeGreaterThan(2000000);
    expect(dist).toBeLessThan(2200000);
  });
});

describe("formatDistance", () => {
  it("formats meters for distances under 1km", () => {
    expect(formatDistance(0)).toBe("0m");
    expect(formatDistance(100)).toBe("100m");
    expect(formatDistance(999)).toBe("999m");
  });

  it("rounds meters to nearest whole number", () => {
    expect(formatDistance(250.7)).toBe("251m");
  });

  it("formats kilometers for distances >= 1km", () => {
    expect(formatDistance(1000)).toBe("1.0km");
    expect(formatDistance(1500)).toBe("1.5km");
    expect(formatDistance(10000)).toBe("10.0km");
  });

  it("formats km to one decimal place", () => {
    expect(formatDistance(1234)).toBe("1.2km");
    expect(formatDistance(9876)).toBe("9.9km");
  });
});

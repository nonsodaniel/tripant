/**
 * @jest-environment node
 */
import { GET } from "@/app/api/weather/route";
import { NextRequest } from "next/server";

jest.mock("@/lib/api/weather", () => ({
  fetchWeather: jest.fn(),
}));

import { fetchWeather } from "@/lib/api/weather";
const mockFetchWeather = fetchWeather as jest.MockedFunction<typeof fetchWeather>;

const mockWeatherData = {
  current: {
    temperature: 18,
    weathercode: 1,
    windspeed: 12,
    time: "2025-06-01T12:00",
  },
  forecast: {
    daily: {
      time: ["2025-06-01", "2025-06-02"],
      temperature_2m_max: [22, 24],
      temperature_2m_min: [14, 16],
      weathercode: [1, 2],
    },
  },
  city: "London",
};

function makeRequest(params: Record<string, string>): NextRequest {
  const url = new URL("http://localhost:3000/api/weather");
  Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));
  return new NextRequest(url.toString());
}

beforeEach(() => {
  jest.clearAllMocks();
});

describe("GET /api/weather", () => {
  it("returns 400 when lat/lon missing", async () => {
    const req = makeRequest({});
    const res = await GET(req);
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toContain("lat and lon");
  });

  it("returns 400 for invalid lat", async () => {
    const req = makeRequest({ lat: "abc", lon: "2.34" });
    const res = await GET(req);
    expect(res.status).toBe(400);
  });

  it("returns weather data on success", async () => {
    mockFetchWeather.mockResolvedValueOnce(mockWeatherData);
    const req = makeRequest({ lat: "51.51", lon: "-0.13" });
    const res = await GET(req);
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.current.temperature).toBe(18);
    expect(body.city).toBe("London");
  });

  it("returns 503 when fetchWeather returns null", async () => {
    mockFetchWeather.mockResolvedValueOnce(null);
    const req = makeRequest({ lat: "51.51", lon: "-0.13" });
    const res = await GET(req);
    expect(res.status).toBe(503);
  });

  it("returns 500 when fetchWeather throws", async () => {
    mockFetchWeather.mockRejectedValueOnce(new Error("network error"));
    const req = makeRequest({ lat: "51.51", lon: "-0.13" });
    const res = await GET(req);
    expect(res.status).toBe(500);
  });

  it("passes lat/lon to fetchWeather", async () => {
    mockFetchWeather.mockResolvedValueOnce(mockWeatherData);
    const req = makeRequest({ lat: "48.86", lon: "2.35" });
    await GET(req);
    expect(mockFetchWeather).toHaveBeenCalledWith(48.86, 2.35);
  });
});

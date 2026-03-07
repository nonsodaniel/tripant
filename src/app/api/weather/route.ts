import { NextRequest, NextResponse } from "next/server";
import { fetchWeather } from "@/lib/api/weather";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const lat = parseFloat(searchParams.get("lat") || "");
  const lon = parseFloat(searchParams.get("lon") || "");

  if (isNaN(lat) || isNaN(lon)) {
    return NextResponse.json({ error: "lat and lon are required" }, { status: 400 });
  }

  try {
    const weather = await fetchWeather(lat, lon);
    if (!weather) {
      return NextResponse.json({ error: "Weather data unavailable" }, { status: 503 });
    }

    return NextResponse.json(weather, {
      headers: {
        "Cache-Control": "public, s-maxage=900, stale-while-revalidate=1800",
      },
    });
  } catch (error) {
    console.error("Weather API error:", error);
    return NextResponse.json({ error: "Failed to fetch weather" }, { status: 500 });
  }
}

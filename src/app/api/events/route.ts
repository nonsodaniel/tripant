import { NextRequest, NextResponse } from "next/server";
import { fetchEvents } from "@/lib/api/overpass";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const lat = parseFloat(searchParams.get("lat") || "");
  const lon = parseFloat(searchParams.get("lon") || "");
  const radius = parseInt(searchParams.get("radius") || "5000");

  if (isNaN(lat) || isNaN(lon)) {
    return NextResponse.json({ error: "lat and lon are required" }, { status: 400 });
  }

  try {
    const events = await fetchEvents(lat, lon, Math.min(radius, 10000));

    return NextResponse.json(events, {
      headers: {
        "Cache-Control": "public, s-maxage=600, stale-while-revalidate=1200",
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("Events API error:", message);
    return NextResponse.json(
      { error: "Events temporarily unavailable. Please retry." },
      { status: 503, headers: { "Retry-After": "5" } }
    );
  }
}

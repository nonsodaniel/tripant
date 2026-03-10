import { NextRequest, NextResponse } from "next/server";
import { fetchNearbyPlaces } from "@/lib/api/overpass";
import type { Category } from "@/types";

export async function GET(request: NextRequest) {
  let lat: number, lon: number, radius: number, limit: number;
  let category: Category | undefined;

  try {
    const { searchParams } = new URL(request.url);
    lat = parseFloat(searchParams.get("lat") ?? "");
    lon = parseFloat(searchParams.get("lon") ?? "");
    radius = Math.min(parseInt(searchParams.get("radius") ?? "2000", 10) || 2000, 10000);
    limit = Math.min(parseInt(searchParams.get("limit") ?? "50", 10) || 50, 100);
    const cat = searchParams.get("category");
    category = cat ? (cat as Category) : undefined;
  } catch {
    return NextResponse.json({ error: "Invalid request parameters" }, { status: 400 });
  }

  if (isNaN(lat) || isNaN(lon)) {
    return NextResponse.json({ error: "lat and lon are required" }, { status: 400 });
  }

  try {
    const places = await fetchNearbyPlaces({ lat, lon, radius, category, limit });

    return NextResponse.json(places, {
      headers: {
        "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600",
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error("[/api/places] Overpass error:", message);

    // Always return 503 (not 500) so the client knows to retry
    return NextResponse.json(
      { error: "Places temporarily unavailable. Please retry in a moment.", details: message },
      {
        status: 503,
        headers: {
          "Retry-After": "10",
          "Cache-Control": "no-store",
        },
      }
    );
  }
}

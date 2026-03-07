import { NextRequest, NextResponse } from "next/server";
import { fetchNearbyPlaces } from "@/lib/api/overpass";
import type { Category } from "@/types";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const lat = parseFloat(searchParams.get("lat") || "");
  const lon = parseFloat(searchParams.get("lon") || "");
  const radius = parseInt(searchParams.get("radius") || "2000");
  const category = searchParams.get("category") as Category | null;
  const limit = parseInt(searchParams.get("limit") || "50");

  if (isNaN(lat) || isNaN(lon)) {
    return NextResponse.json({ error: "lat and lon are required" }, { status: 400 });
  }

  try {
    const places = await fetchNearbyPlaces({
      lat,
      lon,
      radius: Math.min(radius, 10000),
      category: category || undefined,
      limit: Math.min(limit, 100),
    });

    return NextResponse.json(places, {
      headers: {
        "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600",
      },
    });
  } catch (error) {
    console.error("Places API error:", error);
    return NextResponse.json({ error: "Failed to fetch places" }, { status: 500 });
  }
}

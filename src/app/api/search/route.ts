import { NextRequest, NextResponse } from "next/server";
import { searchPlaces } from "@/lib/api/nominatim";
import { fetchNearbyPlaces } from "@/lib/api/overpass";
import type { Category } from "@/types";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q") || "";
  const asPlaces = searchParams.get("asPlaces") === "true";
  const lat = parseFloat(searchParams.get("lat") || "");
  const lon = parseFloat(searchParams.get("lon") || "");
  const category = searchParams.get("category") as Category | null;

  // If category filter + location, fetch from Overpass
  if (category && !isNaN(lat) && !isNaN(lon)) {
    try {
      const places = await fetchNearbyPlaces({ lat, lon, radius: 5000, category, limit: 50 });
      return NextResponse.json(places);
    } catch (error) {
      return NextResponse.json({ error: "Search failed" }, { status: 500 });
    }
  }

  if (!q || q.length < 2) {
    return NextResponse.json([]);
  }

  try {
    const results = await searchPlaces(q, 10);

    // If asPlaces, convert to Place format and optionally fetch nearby
    if (asPlaces && results.length > 0) {
      const places = results.map((r) => ({
        id: r.id,
        name: r.name,
        category: r.category || "other",
        address: r.address,
        coordinates: r.coordinates,
        source: "nominatim" as const,
      }));
      return NextResponse.json(places);
    }

    return NextResponse.json(results, {
      headers: {
        "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300",
      },
    });
  } catch (error) {
    console.error("Search API error:", error);
    return NextResponse.json({ error: "Search failed" }, { status: 500 });
  }
}

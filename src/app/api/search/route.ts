import { NextRequest, NextResponse } from "next/server";
import { searchPlaces } from "@/lib/api/nominatim";
import { fetchNearbyPlaces } from "@/lib/api/overpass";
import type { Category } from "@/types";

export async function GET(request: NextRequest) {
  let q: string, asPlaces: boolean, lat: number, lon: number, category: Category | null;

  try {
    const { searchParams } = new URL(request.url);
    q = searchParams.get("q") || "";
    asPlaces = searchParams.get("asPlaces") === "true";
    lat = parseFloat(searchParams.get("lat") ?? "");
    lon = parseFloat(searchParams.get("lon") ?? "");
    category = searchParams.get("category") as Category | null;
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  // Category + location → Overpass
  if (category && !isNaN(lat) && !isNaN(lon)) {
    try {
      const places = await fetchNearbyPlaces({ lat, lon, radius: 5000, category, limit: 50 });
      return NextResponse.json(places, {
        headers: { "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600" },
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      console.error("[/api/search] category+location error:", message);
      return NextResponse.json(
        { error: "Search temporarily unavailable. Please retry." },
        { status: 503, headers: { "Retry-After": "10", "Cache-Control": "no-store" } }
      );
    }
  }

  if (!q || q.length < 2) {
    return NextResponse.json([]);
  }

  try {
    const results = await searchPlaces(q, 10);

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
      headers: { "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300" },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error("[/api/search] Nominatim error:", message);
    // Return empty array instead of error for search — better UX than a failure message
    return NextResponse.json([], {
      headers: { "Cache-Control": "no-store" },
    });
  }
}

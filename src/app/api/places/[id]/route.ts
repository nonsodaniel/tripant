import { NextRequest, NextResponse } from "next/server";
import { fetchPlaceById } from "@/lib/api/overpass";
import { fetchPlaceByNominatimId } from "@/lib/api/nominatim";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  const { id } = await params;
  const placeId = decodeURIComponent(id);

  try {
    let place = null;

    if (placeId.startsWith("osm-")) {
      place = await fetchPlaceById(placeId);
    } else if (placeId.startsWith("nom-")) {
      place = await fetchPlaceByNominatimId(placeId);
    } else {
      // Try OSM format as fallback
      place = await fetchPlaceById(placeId);
    }

    if (!place) {
      return NextResponse.json({ error: "Place not found" }, { status: 404 });
    }

    return NextResponse.json(place, {
      headers: {
        "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=7200",
      },
    });
  } catch (error) {
    console.error("Place detail API error:", error);
    return NextResponse.json({ error: "Failed to fetch place" }, { status: 500 });
  }
}

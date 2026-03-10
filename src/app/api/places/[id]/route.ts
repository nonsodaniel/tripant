import { NextRequest, NextResponse } from "next/server";
import { fetchPlaceById } from "@/lib/api/overpass";
import { fetchPlaceByNominatimId } from "@/lib/api/nominatim";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  let placeId: string;
  try {
    const { id } = await params;
    placeId = decodeURIComponent(id);
  } catch {
    return NextResponse.json({ error: "Invalid place ID" }, { status: 400 });
  }

  try {
    let place = null;

    if (placeId.startsWith("osm-")) {
      place = await fetchPlaceById(placeId);
    } else if (placeId.startsWith("nom-")) {
      place = await fetchPlaceByNominatimId(placeId);
    } else {
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
    const message = error instanceof Error ? error.message : String(error);
    console.error("[/api/places/[id]] error:", message);
    return NextResponse.json(
      { error: "Place details temporarily unavailable. Please retry." },
      {
        status: 503,
        headers: {
          "Retry-After": "5",
          "Cache-Control": "no-store",
        },
      }
    );
  }
}

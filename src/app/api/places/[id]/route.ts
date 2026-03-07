import { NextRequest, NextResponse } from "next/server";
import { fetchPlaceById } from "@/lib/api/overpass";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  const { id } = await params;
  const placeId = decodeURIComponent(id);

  try {
    const place = await fetchPlaceById(placeId);
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

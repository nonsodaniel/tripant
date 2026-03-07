import { NextRequest, NextResponse } from "next/server";

// Trips are stored client-side via Zustand/localStorage.
// This route serves as a future REST endpoint stub.

export async function GET() {
  return NextResponse.json({ message: "Trips are managed client-side" });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    // Future: persist to database
    return NextResponse.json({ ...body, id: crypto.randomUUID() }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}

import { NextRequest, NextResponse } from "next/server";

const WIKI_API = "https://en.wikipedia.org/w/api.php";
const HEADERS = { "User-Agent": "Tripant/1.0 (travel assistant app)" };

async function fetchWikiThumb(title: string, size = 600): Promise<string | null> {
  const params = new URLSearchParams({
    action: "query",
    titles: title,
    prop: "pageimages",
    format: "json",
    pithumbsize: size.toString(),
    origin: "*",
  });

  const res = await fetch(`${WIKI_API}?${params}`, {
    headers: HEADERS,
    signal: AbortSignal.timeout(6000),
  });
  if (!res.ok) return null;

  const data = await res.json();
  const pages = data?.query?.pages;
  if (!pages) return null;

  const page = Object.values(pages)[0] as Record<string, unknown>;
  if (!page || (page.missing !== undefined)) return null;

  const thumb = page.thumbnail as { source?: string } | undefined;
  return thumb?.source ?? null;
}

async function searchWikiThumb(query: string, size = 600): Promise<string | null> {
  const params = new URLSearchParams({
    action: "query",
    generator: "search",
    gsrsearch: query,
    gsrlimit: "1",
    prop: "pageimages",
    format: "json",
    pithumbsize: size.toString(),
    origin: "*",
  });

  const res = await fetch(`${WIKI_API}?${params}`, {
    headers: HEADERS,
    signal: AbortSignal.timeout(8000),
  });
  if (!res.ok) return null;

  const data = await res.json();
  const pages = data?.query?.pages;
  if (!pages) return null;

  const page = Object.values(pages)[0] as Record<string, unknown>;
  const thumb = page?.thumbnail as { source?: string } | undefined;
  return thumb?.source ?? null;
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const name = (searchParams.get("name") || "").trim();

  if (!name || name.length < 2) {
    return NextResponse.json({ url: null });
  }

  try {
    // 1. Try exact Wikipedia title match first (fast)
    let url = await fetchWikiThumb(name);

    // 2. Fall back to search if exact match returned nothing
    if (!url) {
      url = await searchWikiThumb(name);
    }

    return NextResponse.json(
      { url },
      {
        headers: {
          "Cache-Control": "public, s-maxage=86400, stale-while-revalidate=604800",
        },
      }
    );
  } catch {
    return NextResponse.json({ url: null });
  }
}

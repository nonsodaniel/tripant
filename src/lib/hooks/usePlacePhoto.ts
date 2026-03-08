"use client";

import useSWR from "swr";

async function fetcher(url: string): Promise<{ url: string | null }> {
  const res = await fetch(url);
  if (!res.ok) return { url: null };
  return res.json();
}

export function usePlacePhoto(name: string, enabled = true) {
  const key =
    enabled && name && name.length > 1
      ? `/api/photos?name=${encodeURIComponent(name)}`
      : null;

  const { data } = useSWR(key, fetcher, {
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
    dedupingInterval: 3_600_000, // 1 hour — photos never change mid-session
    errorRetryCount: 1,
  });

  return { photoUrl: data?.url ?? null };
}

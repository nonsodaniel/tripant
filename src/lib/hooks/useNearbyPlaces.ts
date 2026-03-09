"use client";

import useSWR from "swr";
import type { Category, Place } from "@/types";

interface UseNearbyPlacesOptions {
  lat?: number;
  lon?: number;
  radius?: number;
  category?: Category;
  enabled?: boolean;
}

async function fetchNearby(url: string): Promise<Place[]> {
  const res = await fetch(url);
  if (res.status === 503) {
    // Service temporarily unavailable — throw so SWR retries
    throw new Error("Places service temporarily unavailable");
  }
  if (!res.ok) {
    throw new Error(`Failed to fetch places (${res.status})`);
  }
  const data = await res.json();
  // Guard: API might return an error object instead of array
  return Array.isArray(data) ? data : [];
}

export function useNearbyPlaces(options: UseNearbyPlacesOptions) {
  const { lat, lon, radius = 2000, category, enabled = true } = options;

  const shouldFetch = enabled && lat !== undefined && lon !== undefined;

  const params = new URLSearchParams({
    lat: lat?.toString() ?? "",
    lon: lon?.toString() ?? "",
    radius: radius.toString(),
    ...(category ? { category } : {}),
  });

  const key = shouldFetch ? `/api/places?${params}` : null;

  const { data, error, isLoading, mutate } = useSWR<Place[]>(
    key,
    fetchNearby,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
      dedupingInterval: 30000,      // 30s dedup (reduced from 60s)
      errorRetryCount: 3,
      errorRetryInterval: 3000,     // retry after 3s on error
      shouldRetryOnError: (err) => {
        // Retry on 503 (rate limit / timeout) but not on 4xx
        return err.message.includes("503") || err.message.includes("unavailable");
      },
    }
  );

  return {
    places: data ?? [],
    isLoading,
    error,
    refetch: mutate,
  };
}

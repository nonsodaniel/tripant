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

// Error type with status code so we can distinguish user network errors from API failures
export class PlacesError extends Error {
  constructor(message: string, public readonly status: number) {
    super(message);
    this.name = "PlacesError";
  }
}

async function fetchNearby(url: string): Promise<Place[]> {
  let res: Response;
  try {
    res = await fetch(url);
  } catch {
    // True network failure (offline, DNS, etc.)
    throw new PlacesError("Network error — check your connection", 0);
  }

  if (res.status === 503 || res.status === 504) {
    throw new PlacesError("Places service is temporarily busy", res.status);
  }

  if (res.status === 500) {
    throw new PlacesError("Places service error", 500);
  }

  if (!res.ok) {
    throw new PlacesError(`Failed to fetch places (${res.status})`, res.status);
  }

  const data = await res.json();
  return Array.isArray(data) ? data : [];
}

export function useNearbyPlaces(options: UseNearbyPlacesOptions) {
  const { lat, lon, radius = 2000, category, enabled = true } = options;

  const shouldFetch = enabled && lat !== undefined && lon !== undefined;

  const params = new URLSearchParams({
    lat:    lat?.toString() ?? "",
    lon:    lon?.toString() ?? "",
    radius: radius.toString(),
    ...(category ? { category } : {}),
  });

  const key = shouldFetch ? `/api/places?${params}` : null;

  const { data, error, isLoading, mutate } = useSWR<Place[], PlacesError>(
    key,
    fetchNearby,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
      dedupingInterval: 30_000,
      errorRetryCount: 3,
      errorRetryInterval: 4000,
      shouldRetryOnError: (err: PlacesError) => {
        // Retry on server-side errors (500, 503, 504) — NOT on true network failure (0) or 4xx
        return err.status >= 500;
      },
    }
  );

  // Determine whether the error is a connectivity issue vs a service issue
  const isNetworkError = error instanceof PlacesError && error.status === 0;

  return {
    places: data ?? [],
    isLoading,
    error,
    isNetworkError,
    refetch: mutate,
  };
}

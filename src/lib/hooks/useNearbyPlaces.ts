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
  if (!res.ok) throw new Error("Failed to fetch places");
  return res.json();
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
      dedupingInterval: 60000,
      errorRetryCount: 2,
    }
  );

  return {
    places: data ?? [],
    isLoading,
    error,
    refetch: mutate,
  };
}

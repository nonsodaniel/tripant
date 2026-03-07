"use client";

export function getItem<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const item = localStorage.getItem(key);
    if (item === null) return fallback;
    return JSON.parse(item) as T;
  } catch {
    return fallback;
  }
}

export function setItem<T>(key: string, value: T): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.warn("localStorage write failed:", e);
  }
}

export function removeItem(key: string): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(key);
  } catch {
    // ignore
  }
}

export const STORAGE_KEYS = {
  TRIPS: "tripant:trips",
  SAVED_PLACES: "tripant:saved_places",
  SAVED_LISTS: "tripant:saved_lists",
  HISTORY: "tripant:history",
  RECENT_SEARCHES: "tripant:recent_searches",
  VIEWED_PLACES: "tripant:viewed_places",
  LOCATION: "tripant:location",
} as const;

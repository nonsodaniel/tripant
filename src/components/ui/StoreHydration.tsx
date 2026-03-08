"use client";

/**
 * Triggers manual rehydration of all Zustand persisted stores after
 * the client mounts. All stores use skipHydration:true so the initial
 * server-render and client-render are identical (empty/default state),
 * preventing React hydration mismatches and the resulting CSS/animation
 * flash that happened when the client re-rendered with localStorage data.
 */
import { useEffect } from "react";
import { useSavedStore } from "@/lib/store/useSavedStore";
import { useTripsStore } from "@/lib/store/useTripsStore";
import { useLocationStore } from "@/lib/store/useLocationStore";

export function StoreHydration() {
  useEffect(() => {
    useSavedStore.persist.rehydrate();
    useTripsStore.persist.rehydrate();
    useLocationStore.persist.rehydrate();
  }, []);

  return null;
}

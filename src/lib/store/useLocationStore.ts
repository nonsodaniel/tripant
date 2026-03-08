import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Coordinates } from "@/types";

interface LocationState {
  coordinates: Coordinates | null;
  city: string | null;
  country: string | null;
  address: string | null;
  permissionStatus: "prompt" | "granted" | "denied" | "unknown";
  isLocating: boolean;
  setCoordinates: (coords: Coordinates) => void;
  setCityInfo: (info: { city?: string; country?: string; address?: string }) => void;
  setPermissionStatus: (status: LocationState["permissionStatus"]) => void;
  setIsLocating: (loading: boolean) => void;
  reset: () => void;
}

export const useLocationStore = create<LocationState>()(
  persist(
    (set) => ({
      coordinates: null,
      city: null,
      country: null,
      address: null,
      permissionStatus: "unknown",
      isLocating: false,

      setCoordinates: (coords) => set({ coordinates: coords }),
      setCityInfo: (info) =>
        set({
          city: info.city || null,
          country: info.country || null,
          address: info.address || null,
        }),
      setPermissionStatus: (status) => set({ permissionStatus: status }),
      setIsLocating: (loading) => set({ isLocating: loading }),
      reset: () =>
        set({
          coordinates: null,
          city: null,
          country: null,
          address: null,
          permissionStatus: "unknown",
          isLocating: false,
        }),
    }),
    {
      name: "tripant:location",
      partialize: (state) => ({
        coordinates: state.coordinates,
        city: state.city,
        country: state.country,
      }),
      skipHydration: true,
    }
  )
);

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Trip, TripDay, TripPlace, Place } from "@/types";
import { generateId } from "@/lib/utils/format";

interface TripsState {
  trips: Trip[];
  activeTrip: Trip | null;
  createTrip: (data: { name: string; destination: string }) => Trip;
  updateTrip: (id: string, data: Partial<Trip>) => void;
  deleteTrip: (id: string) => void;
  setActiveTrip: (trip: Trip | null) => void;
  addDay: (tripId: string, date: string) => void;
  removeDay: (tripId: string, dayId: string) => void;
  addPlaceToDay: (tripId: string, dayId: string, place: Place) => void;
  removePlaceFromDay: (tripId: string, dayId: string, tripPlaceId: string) => void;
  reorderPlaces: (tripId: string, dayId: string, fromIndex: number, toIndex: number) => void;
  getTrip: (id: string) => Trip | undefined;
}

export const useTripsStore = create<TripsState>()(
  persist(
    (set, get) => ({
      trips: [],
      activeTrip: null,

      createTrip: (data) => {
        const trip: Trip = {
          id: generateId(),
          name: data.name,
          destination: data.destination,
          days: [],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        set((state) => ({ trips: [trip, ...state.trips] }));
        return trip;
      },

      updateTrip: (id, data) => {
        set((state) => ({
          trips: state.trips.map((t) =>
            t.id === id ? { ...t, ...data, updatedAt: new Date().toISOString() } : t
          ),
          activeTrip: state.activeTrip?.id === id
            ? { ...state.activeTrip, ...data, updatedAt: new Date().toISOString() }
            : state.activeTrip,
        }));
      },

      deleteTrip: (id) => {
        set((state) => ({
          trips: state.trips.filter((t) => t.id !== id),
          activeTrip: state.activeTrip?.id === id ? null : state.activeTrip,
        }));
      },

      setActiveTrip: (trip) => set({ activeTrip: trip }),

      addDay: (tripId, date) => {
        const trip = get().trips.find((t) => t.id === tripId);
        if (!trip) return;
        const newDay: TripDay = {
          id: generateId(),
          date,
          dayNumber: trip.days.length + 1,
          places: [],
        };
        set((state) => ({
          trips: state.trips.map((t) =>
            t.id === tripId
              ? { ...t, days: [...t.days, newDay], updatedAt: new Date().toISOString() }
              : t
          ),
        }));
      },

      removeDay: (tripId, dayId) => {
        set((state) => ({
          trips: state.trips.map((t) =>
            t.id === tripId
              ? {
                  ...t,
                  days: t.days
                    .filter((d) => d.id !== dayId)
                    .map((d, i) => ({ ...d, dayNumber: i + 1 })),
                  updatedAt: new Date().toISOString(),
                }
              : t
          ),
        }));
      },

      addPlaceToDay: (tripId, dayId, place) => {
        const newTripPlace: TripPlace = {
          id: generateId(),
          placeId: place.id,
          place,
          order: 0,
        };
        set((state) => ({
          trips: state.trips.map((t) =>
            t.id === tripId
              ? {
                  ...t,
                  days: t.days.map((d) =>
                    d.id === dayId
                      ? {
                          ...d,
                          places: [...d.places, { ...newTripPlace, order: d.places.length }],
                        }
                      : d
                  ),
                  updatedAt: new Date().toISOString(),
                }
              : t
          ),
        }));
      },

      removePlaceFromDay: (tripId, dayId, tripPlaceId) => {
        set((state) => ({
          trips: state.trips.map((t) =>
            t.id === tripId
              ? {
                  ...t,
                  days: t.days.map((d) =>
                    d.id === dayId
                      ? {
                          ...d,
                          places: d.places
                            .filter((p) => p.id !== tripPlaceId)
                            .map((p, i) => ({ ...p, order: i })),
                        }
                      : d
                  ),
                  updatedAt: new Date().toISOString(),
                }
              : t
          ),
        }));
      },

      reorderPlaces: (tripId, dayId, fromIndex, toIndex) => {
        set((state) => ({
          trips: state.trips.map((t) => {
            if (t.id !== tripId) return t;
            return {
              ...t,
              days: t.days.map((d) => {
                if (d.id !== dayId) return d;
                const places = [...d.places];
                const [moved] = places.splice(fromIndex, 1);
                places.splice(toIndex, 0, moved);
                return { ...d, places: places.map((p, i) => ({ ...p, order: i })) };
              }),
              updatedAt: new Date().toISOString(),
            };
          }),
        }));
      },

      getTrip: (id) => get().trips.find((t) => t.id === id),
    }),
    { name: "tripant:trips", skipHydration: true }
  )
);

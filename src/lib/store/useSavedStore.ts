import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { SavedPlace, SavedList, ActivityHistory, Place } from "@/types";
import { generateId } from "@/lib/utils/format";

interface SavedState {
  savedPlaces: SavedPlace[];
  savedLists: SavedList[];
  history: ActivityHistory[];
  recentSearches: string[];

  savePlace: (place: Place, listId?: string) => void;
  unsavePlace: (placeId: string) => void;
  isPlaceSaved: (placeId: string) => boolean;

  createList: (name: string, emoji?: string) => SavedList;
  updateList: (id: string, data: Partial<SavedList>) => void;
  deleteList: (id: string) => void;
  addToList: (listId: string, placeId: string) => void;
  removeFromList: (listId: string, placeId: string) => void;

  addToHistory: (entry: Omit<ActivityHistory, "id" | "timestamp">) => void;
  addRecentSearch: (query: string) => void;
  clearHistory: () => void;
}

export const useSavedStore = create<SavedState>()(
  persist(
    (set, get) => ({
      savedPlaces: [],
      savedLists: [],
      history: [],
      recentSearches: [],

      savePlace: (place, listId) => {
        const exists = get().savedPlaces.some((sp) => sp.placeId === place.id);
        if (exists) return;
        const saved: SavedPlace = {
          placeId: place.id,
          place,
          listId,
          savedAt: new Date().toISOString(),
        };
        set((state) => ({ savedPlaces: [...state.savedPlaces, saved] }));
        get().addToHistory({ type: "save", placeId: place.id, placeName: place.name });
      },

      unsavePlace: (placeId) => {
        set((state) => ({
          savedPlaces: state.savedPlaces.filter((sp) => sp.placeId !== placeId),
        }));
      },

      isPlaceSaved: (placeId) => {
        return get().savedPlaces.some((sp) => sp.placeId === placeId);
      },

      createList: (name, emoji) => {
        const list: SavedList = {
          id: generateId(),
          name,
          emoji,
          placeIds: [],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        set((state) => ({ savedLists: [...state.savedLists, list] }));
        return list;
      },

      updateList: (id, data) => {
        set((state) => ({
          savedLists: state.savedLists.map((l) =>
            l.id === id ? { ...l, ...data, updatedAt: new Date().toISOString() } : l
          ),
        }));
      },

      deleteList: (id) => {
        set((state) => ({
          savedLists: state.savedLists.filter((l) => l.id !== id),
          savedPlaces: state.savedPlaces.filter((sp) => sp.listId !== id),
        }));
      },

      addToList: (listId, placeId) => {
        set((state) => ({
          savedLists: state.savedLists.map((l) =>
            l.id === listId && !l.placeIds.includes(placeId)
              ? { ...l, placeIds: [...l.placeIds, placeId], updatedAt: new Date().toISOString() }
              : l
          ),
        }));
      },

      removeFromList: (listId, placeId) => {
        set((state) => ({
          savedLists: state.savedLists.map((l) =>
            l.id === listId
              ? { ...l, placeIds: l.placeIds.filter((id) => id !== placeId), updatedAt: new Date().toISOString() }
              : l
          ),
        }));
      },

      addToHistory: (entry) => {
        const historyEntry: ActivityHistory = {
          ...entry,
          id: generateId(),
          timestamp: new Date().toISOString(),
        };
        set((state) => ({
          history: [historyEntry, ...state.history].slice(0, 200),
        }));
      },

      addRecentSearch: (query) => {
        if (!query.trim()) return;
        set((state) => ({
          recentSearches: [
            query,
            ...state.recentSearches.filter((q) => q !== query),
          ].slice(0, 10),
        }));
      },

      clearHistory: () => set({ history: [], recentSearches: [] }),
    }),
    { name: "tripant:saved" }
  )
);

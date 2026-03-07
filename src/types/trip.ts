import type { Place, Coordinates } from "./place";

export interface TripPlace {
  id: string;
  placeId: string;
  place: Place;
  notes?: string;
  visitTime?: string;
  duration?: number; // in minutes
  order: number;
}

export interface TripDay {
  id: string;
  date: string; // ISO date string
  dayNumber: number;
  places: TripPlace[];
  notes?: string;
}

export interface Trip {
  id: string;
  name: string;
  destination: string;
  destinationCoordinates?: Coordinates;
  coverImage?: string;
  startDate?: string; // ISO date string
  endDate?: string; // ISO date string
  days: TripDay[];
  notes?: string;
  isPublic?: boolean;
  shareToken?: string;
  createdAt: string;
  updatedAt: string;
  tags?: string[];
}

export interface SavedList {
  id: string;
  name: string;
  description?: string;
  placeIds: string[];
  createdAt: string;
  updatedAt: string;
  emoji?: string;
}

export interface SavedPlace {
  placeId: string;
  place: Place;
  listId?: string;
  savedAt: string;
  notes?: string;
}

export interface ActivityHistory {
  id: string;
  type: "view" | "search" | "save" | "trip_create";
  placeId?: string;
  placeName?: string;
  query?: string;
  timestamp: string;
}

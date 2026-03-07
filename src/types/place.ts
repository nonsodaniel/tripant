export type Category =
  | "food"
  | "attraction"
  | "museum"
  | "park"
  | "landmark"
  | "nightlife"
  | "shopping"
  | "transport"
  | "hotel"
  | "event"
  | "hidden_gem"
  | "nature"
  | "sport"
  | "healthcare"
  | "other";

export interface Coordinates {
  lat: number;
  lon: number;
}

export interface OpeningHours {
  open: boolean;
  text?: string;
}

export interface Place {
  id: string;
  name: string;
  category: Category;
  description?: string;
  address?: string;
  coordinates: Coordinates;
  distance?: number; // in meters
  rating?: number;
  reviewCount?: number;
  phone?: string;
  website?: string;
  openingHours?: OpeningHours;
  photos?: string[];
  tags?: Record<string, string>;
  sponsored?: boolean;
  featured?: boolean;
  source?: "overpass" | "nominatim" | "manual";
}

export interface PlaceDetail extends Place {
  nearbyPlaces?: Place[];
  similarPlaces?: Place[];
  reviews?: Review[];
}

export interface Review {
  id: string;
  author: string;
  rating: number;
  text: string;
  date: string;
}

export interface SearchResult {
  id: string;
  name: string;
  type: "place" | "city" | "landmark" | "restaurant" | "attraction";
  coordinates: Coordinates;
  address?: string;
  category?: Category;
}

export interface NearbyQuery {
  lat: number;
  lon: number;
  radius?: number; // in meters, default 2000
  category?: Category;
  limit?: number;
}

export const CATEGORY_LABELS: Record<Category, string> = {
  food: "Food & Drink",
  attraction: "Attractions",
  museum: "Museums",
  park: "Parks",
  landmark: "Landmarks",
  nightlife: "Nightlife",
  shopping: "Shopping",
  transport: "Transport",
  hotel: "Hotels",
  event: "Events",
  hidden_gem: "Hidden Gems",
  nature: "Nature",
  sport: "Sports",
  healthcare: "Healthcare",
  other: "Other",
};

export const CATEGORY_ICONS: Record<Category, string> = {
  food: "UtensilsCrossed",
  attraction: "Star",
  museum: "Building",
  park: "Trees",
  landmark: "MapPin",
  nightlife: "Moon",
  shopping: "ShoppingBag",
  transport: "Bus",
  hotel: "Hotel",
  event: "Calendar",
  hidden_gem: "Gem",
  nature: "Leaf",
  sport: "Dumbbell",
  healthcare: "Heart",
  other: "MapPin",
};

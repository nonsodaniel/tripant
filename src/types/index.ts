export type {
  Category,
  Coordinates,
  OpeningHours,
  Place,
  PlaceDetail,
  Review,
  SearchResult,
  NearbyQuery,
} from "./place";

export { CATEGORY_LABELS, CATEGORY_ICONS } from "./place";

export type {
  TripPlace,
  TripDay,
  Trip,
  SavedList,
  SavedPlace,
  ActivityHistory,
} from "./trip";

export interface WeatherCurrent {
  temperature: number;
  weathercode: number;
  windspeed: number;
  time: string;
}

export interface WeatherForecast {
  daily: {
    time: string[];
    temperature_2m_max: number[];
    temperature_2m_min: number[];
    weathercode: number[];
  };
}

export interface WeatherData {
  current: WeatherCurrent;
  forecast?: WeatherForecast;
  city?: string;
}

export interface Event {
  id: string;
  name: string;
  description?: string;
  location?: string;
  startDate?: string;
  endDate?: string;
  category?: string;
  coordinates?: { lat: number; lon: number };
  tags?: Record<string, string>;
}

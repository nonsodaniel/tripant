"use client";

import { MapPin } from "lucide-react";
import { SearchBar } from "@/components/ui/SearchBar";
import { useLocationStore } from "@/lib/store/useLocationStore";
import { getWeatherIcon, getWeatherLabel } from "@/lib/api/weather";
import type { WeatherData } from "@/types";

function getGreeting(): string {
  const h = new Date().getHours();
  if (h < 5)  return "Good night";
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
}

interface HeroSearchProps {
  weather?: WeatherData | null;
}

export function HeroSearch({ weather }: HeroSearchProps) {
  const { city, country, isLocating } = useLocationStore();

  return (
    <div className="bg-surface border-b border-border px-4 pt-6 pb-5 animate-fade-in">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-start justify-between mb-4 gap-4">
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-text-tertiary mb-0.5">
              {getGreeting()}
            </p>
            <h1 className="text-3xl font-bold text-text-primary tracking-tight truncate">
              {isLocating ? "Locating…" : city ?? "Explore"}
            </h1>
            <div className="flex items-center gap-1.5 mt-1.5">
              <MapPin className="w-3.5 h-3.5 text-text-tertiary flex-shrink-0" />
              <p className="text-sm text-text-secondary truncate">
                {isLocating
                  ? "Detecting your location…"
                  : city
                  ? `${city}${country ? `, ${country}` : ""}`
                  : "Set your location to discover places nearby"}
              </p>
            </div>
          </div>

          {weather && (
            <div className="flex-shrink-0 text-right animate-scale-in">
              <span className="text-3xl leading-none block">
                {getWeatherIcon(weather.current.weathercode)}
              </span>
              <span className="text-base font-semibold text-text-primary block mt-1">
                {weather.current.temperature}°C
              </span>
              <span className="text-xs text-text-tertiary block">
                {getWeatherLabel(weather.current.weathercode)}
              </span>
            </div>
          )}
        </div>

        <SearchBar placeholder="Search cities, places, restaurants…" />
      </div>
    </div>
  );
}

"use client";

import { MapPin, Navigation } from "lucide-react";
import { SearchBar } from "@/components/ui/SearchBar";
import { useLocationStore } from "@/lib/store/useLocationStore";
import { getWeatherIcon, getWeatherLabel } from "@/lib/api/weather";
import type { WeatherData } from "@/types";

interface HeroSearchProps {
  weather?: WeatherData | null;
}

export function HeroSearch({ weather }: HeroSearchProps) {
  const { city, country, isLocating } = useLocationStore();

  return (
    <div className="bg-surface border-b border-border px-4 pt-5 pb-5 animate-fade-in">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold text-text-primary tracking-tight">
              {isLocating ? "Finding you…" : city ? city : "Explore"}
            </h1>
            <div className="flex items-center gap-1.5 mt-1">
              <MapPin className="w-3.5 h-3.5 text-text-tertiary" />
              <p className="text-sm text-text-secondary">
                {isLocating
                  ? "Detecting your location…"
                  : city
                  ? `${city}${country ? `, ${country}` : ""}`
                  : "Set your location to discover places"}
              </p>
            </div>
          </div>
          {weather && (
            <div className="flex flex-col items-end animate-scale-in">
              <span className="text-2xl leading-none">{getWeatherIcon(weather.current.weathercode)}</span>
              <span className="text-sm font-semibold text-text-primary mt-1">
                {weather.current.temperature}°C
              </span>
              <span className="text-xs text-text-tertiary">
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

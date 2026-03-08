"use client";

import { useEffect, useState } from "react";
import { HeroSearch } from "@/components/explore/HeroSearch";
import { CategoryGrid } from "@/components/explore/CategoryGrid";
import { NearbySection } from "@/components/places/NearbySection";
import { useGeolocation } from "@/lib/hooks/useGeolocation";
import { fetchWeather } from "@/lib/api/weather";
import type { WeatherData } from "@/types";
import { Navigation, AlertCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/Button";

export default function ExplorePage() {
  const { coordinates, permissionStatus, isLocating, locate } = useGeolocation();
  const [weather, setWeather] = useState<WeatherData | null>(null);

  useEffect(() => {
    if (coordinates) {
      fetchWeather(coordinates.lat, coordinates.lon).then((w) => {
        if (w) setWeather(w);
      });
    }
  }, [coordinates]);

  return (
    <div className="max-w-5xl mx-auto">
      <HeroSearch weather={weather} />

      <div className="px-4 py-6 space-y-8">

        {/* Location denied */}
        {permissionStatus === "denied" && (
          <div className="flex items-start gap-3 p-4 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-xl">
            <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-medium text-amber-900 dark:text-amber-200">
                Location access denied
              </p>
              <p className="text-xs text-amber-700 dark:text-amber-400 mt-0.5">
                Enable location in your browser settings, then tap Retry.
              </p>
            </div>
            <Button
              variant="secondary"
              size="sm"
              onClick={locate}
              icon={<Navigation className="w-3.5 h-3.5" />}
            >
              Retry
            </Button>
          </div>
        )}

        {/* Category grid — always visible */}
        <CategoryGrid lat={coordinates?.lat} lon={coordinates?.lon} />

        {/* Locating spinner */}
        {isLocating && !coordinates && (
          <div className="flex flex-col items-center gap-3 py-10">
            <Loader2 className="w-6 h-6 text-accent animate-spin" />
            <p className="text-sm text-text-secondary">Finding your location…</p>
          </div>
        )}

        {/* Prompt when location unknown */}
        {!coordinates && !isLocating && permissionStatus !== "denied" && (
          <div className="text-center py-10">
            <div className="w-12 h-12 rounded-2xl bg-accent-light flex items-center justify-center mx-auto mb-3">
              <Navigation className="w-6 h-6 text-accent" />
            </div>
            <p className="font-semibold text-text-primary">Location not detected</p>
            <p className="text-sm text-text-secondary mt-1">
              Tap below to find places near you
            </p>
            <Button
              variant="primary"
              size="md"
              className="mt-4"
              onClick={locate}
              icon={<Navigation className="w-4 h-4" />}
            >
              Use my location
            </Button>
          </div>
        )}

        {/* Nearby places */}
        {coordinates && <NearbySection coordinates={coordinates} />}
      </div>
    </div>
  );
}

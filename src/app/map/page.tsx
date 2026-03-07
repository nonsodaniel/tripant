"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { useGeolocation } from "@/lib/hooks/useGeolocation";
import { useNearbyPlaces } from "@/lib/hooks/useNearbyPlaces";
import { CategoryFilter } from "@/components/places/CategoryFilter";
import { PlaceCard } from "@/components/places/PlaceCard";
import { Spinner } from "@/components/ui/Spinner";
import { EmptyState } from "@/components/ui/EmptyState";
import type { Category, Place } from "@/types";
import { MapPin, Navigation } from "lucide-react";
import { useLocationStore } from "@/lib/store/useLocationStore";
import { Button } from "@/components/ui/Button";

const MapViewInner = dynamic(
  () => import("@/components/map/MapViewInner").then((m) => m.MapViewInner),
  { ssr: false, loading: () => <div className="w-full h-full bg-surface-secondary animate-pulse" /> }
);

export default function MapPage() {
  const { coordinates, locate } = useGeolocation();
  const { city } = useLocationStore();
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [selectedPlace, setSelectedPlace] = useState<Place | null>(null);

  const { places, isLoading } = useNearbyPlaces({
    lat: coordinates?.lat,
    lon: coordinates?.lon,
    radius: 3000,
    category: selectedCategory || undefined,
    enabled: !!coordinates,
  });

  const DEFAULT_CENTER = { lat: 48.8566, lon: 2.3522 }; // Paris fallback
  const center = coordinates ?? DEFAULT_CENTER;

  return (
    <div className="flex h-[calc(100vh-3.5rem)] lg:h-[calc(100vh-3.5rem)]">
      {/* Map panel */}
      <div className="flex-1 relative">
        <MapViewInner
          center={center}
          places={places}
          userCoords={coordinates || undefined}
          showRadius
          radius={3000}
          onPlaceClick={setSelectedPlace}
          className="w-full h-full"
        />

        {/* Category filter overlay */}
        <div className="absolute top-3 left-3 right-3 z-10">
          <div className="bg-surface/95 backdrop-blur-sm rounded-xl p-2 border border-border shadow-card">
            <CategoryFilter
              selected={selectedCategory}
              onChange={setSelectedCategory}
            />
          </div>
        </div>

        {/* Locate button */}
        <button
          onClick={locate}
          className="absolute bottom-4 right-4 z-10 w-10 h-10 bg-surface border border-border rounded-xl shadow-card flex items-center justify-center hover:bg-surface-secondary transition-colors duration-150"
          aria-label="Find my location"
        >
          <Navigation className="w-5 h-5 text-accent" />
        </button>

        {/* Selected place bottom sheet (mobile) */}
        {selectedPlace && (
          <div className="lg:hidden absolute bottom-16 left-3 right-3 z-10">
            <div className="bg-surface border border-border rounded-2xl shadow-elevated p-4">
              <div className="flex items-start gap-3">
                <div className="flex-1">
                  <p className="font-semibold text-text-primary">{selectedPlace.name}</p>
                  {selectedPlace.address && (
                    <p className="text-xs text-text-secondary mt-0.5 line-clamp-1">{selectedPlace.address}</p>
                  )}
                </div>
                <button
                  onClick={() => setSelectedPlace(null)}
                  className="text-text-tertiary hover:text-text-secondary"
                >
                  ✕
                </button>
              </div>
              <a
                href={`/place/${encodeURIComponent(selectedPlace.id)}`}
                className="mt-3 block text-center text-sm font-medium text-white bg-accent rounded-xl py-2 hover:bg-accent-dark transition-colors duration-150"
              >
                View Details
              </a>
            </div>
          </div>
        )}
      </div>

      {/* Results sidebar (desktop) */}
      <div className="hidden lg:flex flex-col w-80 xl:w-96 border-l border-border bg-surface overflow-hidden">
        <div className="p-4 border-b border-border">
          <h2 className="font-semibold text-text-primary">{city ? `Nearby in ${city}` : "Nearby Places"}</h2>
          <p className="text-xs text-text-secondary mt-0.5">{places.length} places found</p>
        </div>
        <div className="flex-1 overflow-y-auto">
          {isLoading && !coordinates && (
            <div className="flex justify-center py-12">
              <Spinner />
            </div>
          )}
          {!coordinates && !isLoading && (
            <EmptyState
              icon={<Navigation className="w-6 h-6" />}
              title="Location needed"
              description="Allow location access to find nearby places."
              action={{ label: "Enable Location", onClick: locate }}
            />
          )}
          {coordinates && isLoading && (
            <div className="flex justify-center py-12">
              <Spinner />
            </div>
          )}
          {coordinates && !isLoading && places.length === 0 && (
            <EmptyState
              icon={<MapPin className="w-6 h-6" />}
              title="No places found"
              description="Try a different category or wider radius."
            />
          )}
          <div className="p-3 space-y-2">
            {places.map((place) => (
              <div
                key={place.id}
                onClick={() => setSelectedPlace(place)}
                className={`cursor-pointer rounded-xl transition-all duration-150 ${
                  selectedPlace?.id === place.id ? "ring-2 ring-accent" : ""
                }`}
              >
                <PlaceCard place={place} horizontal />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

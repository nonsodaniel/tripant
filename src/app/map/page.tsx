"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { MapView } from "@/components/map/MapView";
import { useGeolocation } from "@/lib/hooks/useGeolocation";
import { useNearbyPlaces } from "@/lib/hooks/useNearbyPlaces";
import { CategoryFilter } from "@/components/places/CategoryFilter";
import { PlaceCard } from "@/components/places/PlaceCard";
import { Spinner } from "@/components/ui/Spinner";
import { EmptyState } from "@/components/ui/EmptyState";
import type { Category, Place } from "@/types";
import { CATEGORY_LABELS } from "@/types";
import { MapPin, Navigation, Clock, Globe } from "lucide-react";
import { useLocationStore } from "@/lib/store/useLocationStore";
import { formatDistance } from "@/lib/utils/distance";

function safeHostname(url: string): string {
  try {
    return new URL(url).hostname;
  } catch {
    return url;
  }
}

export default function MapPage() {
  const router = useRouter();
  const { coordinates, locate } = useGeolocation();
  const { city } = useLocationStore();
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [selectedPlace, setSelectedPlace] = useState<Place | null>(null);

  function handlePlaceClick(place: Place) {
    setSelectedPlace(place);
    // On mobile (no sidebar), navigate directly to place detail
    if (typeof window !== "undefined" && window.innerWidth < 1024) {
      router.push(`/place/${encodeURIComponent(place.id)}`);
    }
  }

  const { places, isLoading } = useNearbyPlaces({
    lat: coordinates?.lat,
    lon: coordinates?.lon,
    radius: 3000,
    category: selectedCategory || undefined,
    enabled: !!coordinates,
  });

  const DEFAULT_CENTER = { lat: 51.505, lon: -0.09 };
  const center = coordinates ?? DEFAULT_CENTER;

  return (
    <div className="flex h-[calc(100dvh-4rem)] lg:h-[calc(100dvh-3.5rem)]">
      {/* Map panel */}
      <div className="flex-1 relative overflow-hidden">
        <MapView
          center={center}
          places={places}
          userCoords={coordinates || undefined}
          showRadius
          radius={3000}
          onPlaceClick={handlePlaceClick}
          className="w-full h-full"
        />

        {/* Category filter overlay */}
        <div className="absolute top-3 left-3 right-3 z-[400]">
          <div className="bg-surface/90 rounded-xl p-2 border border-border shadow-card">
            <CategoryFilter selected={selectedCategory} onChange={setSelectedCategory} />
          </div>
        </div>

        {/* Re-center button */}
        <button
          onClick={locate}
          className="absolute bottom-4 right-4 z-[400] w-10 h-10 bg-surface border border-border rounded-xl shadow-card flex items-center justify-center hover:bg-surface-secondary transition-colors duration-150"
          aria-label="Find my location"
        >
          <Navigation className="w-5 h-5 text-accent" />
        </button>

        {/* Selected place card — mobile only */}
        {selectedPlace && (
          <div className="lg:hidden absolute bottom-4 left-3 right-16 z-[400]">
            <div className="bg-surface border border-border rounded-2xl shadow-elevated p-4">
              <div className="flex items-start gap-3">
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-text-primary truncate">{selectedPlace.name}</p>
                  <p className="text-xs text-text-tertiary">{CATEGORY_LABELS[selectedPlace.category]}</p>
                  {selectedPlace.address && (
                    <p className="text-xs text-text-secondary mt-0.5 truncate">{selectedPlace.address}</p>
                  )}
                </div>
                <button
                  onClick={() => setSelectedPlace(null)}
                  className="text-text-tertiary hover:text-text-secondary text-lg leading-none flex-shrink-0"
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

      {/* Results sidebar — desktop only */}
      <div className="hidden lg:flex flex-col w-80 xl:w-96 border-l border-border bg-surface overflow-hidden">
        {/* Sidebar header */}
        <div className="p-4 border-b border-border flex-shrink-0">
          <h2 className="font-semibold text-text-primary">
            {city ? `Nearby in ${city}` : "Nearby Places"}
          </h2>
          <p className="text-xs text-text-secondary mt-0.5">{places.length} places found</p>
        </div>

        {/* Expanded selected place panel */}
        {selectedPlace && (
          <div className="flex-shrink-0 border-b border-border bg-surface-secondary/50 p-4">
            <div className="flex items-start justify-between mb-3">
              <div className="min-w-0">
                <p className="font-semibold text-text-primary truncate">{selectedPlace.name}</p>
                <p className="text-xs text-text-tertiary mt-0.5">
                  {CATEGORY_LABELS[selectedPlace.category]}
                </p>
              </div>
              <button
                onClick={() => setSelectedPlace(null)}
                className="text-text-tertiary hover:text-text-secondary ml-2 flex-shrink-0 text-lg leading-none"
              >
                ✕
              </button>
            </div>

            <div className="space-y-1.5 mb-3">
              {selectedPlace.address && (
                <p className="text-xs text-text-secondary flex items-start gap-1.5">
                  <MapPin className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
                  <span className="line-clamp-2">{selectedPlace.address}</span>
                </p>
              )}
              {selectedPlace.openingHours?.text && (
                <p className="text-xs text-text-secondary flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 flex-shrink-0" />
                  {selectedPlace.openingHours.text}
                </p>
              )}
              {selectedPlace.website && (
                <a
                  href={selectedPlace.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-accent flex items-center gap-1.5 hover:underline"
                >
                  <Globe className="w-3.5 h-3.5 flex-shrink-0" />
                  {safeHostname(selectedPlace.website)}
                </a>
              )}
              {selectedPlace.distance !== undefined && (
                <p className="text-xs text-text-secondary flex items-center gap-1.5">
                  <Navigation className="w-3.5 h-3.5 flex-shrink-0" />
                  {formatDistance(selectedPlace.distance)} away
                </p>
              )}
            </div>

            <div className="flex gap-2">
              <a
                href={`/place/${encodeURIComponent(selectedPlace.id)}`}
                className="flex-1 text-center text-xs font-medium text-white bg-accent rounded-xl py-2.5 hover:bg-accent-dark transition-colors duration-150"
              >
                View Details
              </a>
              <a
                href={`https://www.openstreetmap.org/directions?to=${selectedPlace.coordinates.lat},${selectedPlace.coordinates.lon}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 text-center text-xs font-medium text-text-primary bg-surface border border-border rounded-xl py-2.5 hover:bg-surface-secondary transition-colors duration-150"
              >
                Directions
              </a>
            </div>
          </div>
        )}

        {/* Place list */}
        <div className="flex-1 overflow-y-auto">
          {!coordinates && isLoading && <div className="flex justify-center py-12"><Spinner /></div>}
          {!coordinates && !isLoading && (
            <EmptyState
              icon={<Navigation className="w-6 h-6" />}
              title="Location needed"
              description="Allow location access to find nearby places."
              action={{ label: "Enable Location", onClick: locate }}
            />
          )}
          {coordinates && isLoading && <div className="flex justify-center py-12"><Spinner /></div>}
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

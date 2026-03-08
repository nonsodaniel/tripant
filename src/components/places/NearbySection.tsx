"use client";

import { useState } from "react";
import { useNearbyPlaces } from "@/lib/hooks/useNearbyPlaces";
import { PlaceGrid } from "./PlaceGrid";
import { CategoryFilter } from "./CategoryFilter";
import { PlaceCardSkeleton } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import type { Category, Coordinates } from "@/types";
import { MapPin } from "lucide-react";

interface NearbySectionProps {
  coordinates: Coordinates;
}

export function NearbySection({ coordinates }: NearbySectionProps) {
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [layout, setLayout] = useState<"grid" | "list">("grid");

  const { places, isLoading, error, refetch } = useNearbyPlaces({
    lat: coordinates.lat,
    lon: coordinates.lon,
    radius: 2000,
    category: selectedCategory || undefined,
  });

  return (
    <section>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-lg font-semibold text-text-primary">Nearby</h2>
          {!isLoading && places.length > 0 && (
            <p className="text-xs text-text-tertiary mt-0.5">{places.length} places within 2 km</p>
          )}
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setLayout("grid")}
            className={`p-1.5 rounded-lg transition-colors duration-150 ${layout === "grid" ? "bg-accent-light text-accent" : "text-text-tertiary hover:text-text-secondary"}`}
            aria-label="Grid view"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 16 16">
              <rect x="1" y="1" width="6" height="6" rx="1" />
              <rect x="9" y="1" width="6" height="6" rx="1" />
              <rect x="1" y="9" width="6" height="6" rx="1" />
              <rect x="9" y="9" width="6" height="6" rx="1" />
            </svg>
          </button>
          <button
            onClick={() => setLayout("list")}
            className={`p-1.5 rounded-lg transition-colors duration-150 ${layout === "list" ? "bg-accent-light text-accent" : "text-text-tertiary hover:text-text-secondary"}`}
            aria-label="List view"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 16 16">
              <line x1="2" y1="4" x2="14" y2="4" />
              <line x1="2" y1="8" x2="14" y2="8" />
              <line x1="2" y1="12" x2="14" y2="12" />
            </svg>
          </button>
        </div>
      </div>

      <CategoryFilter
        selected={selectedCategory}
        onChange={setSelectedCategory}
        className="mb-4"
      />

      {isLoading && (
        <div className={layout === "grid" ? "grid grid-cols-2 sm:grid-cols-3 gap-3" : "space-y-2"}>
          {Array.from({ length: 6 }).map((_, i) => (
            <PlaceCardSkeleton key={i} horizontal={layout === "list"} />
          ))}
        </div>
      )}

      {error && !isLoading && (
        <EmptyState
          icon={<MapPin className="w-6 h-6" />}
          title="Couldn't load places"
          description="Check your connection and try again."
          action={{ label: "Retry", onClick: () => refetch?.() }}
        />
      )}

      {!isLoading && !error && places.length === 0 && (
        <EmptyState
          icon={<MapPin className="w-6 h-6" />}
          title="No places found"
          description="Try adjusting the category filter or exploring a wider area."
        />
      )}

      {!isLoading && places.length > 0 && (
        <PlaceGrid places={places} layout={layout} />
      )}
    </section>
  );
}

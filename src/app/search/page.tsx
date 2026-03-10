"use client";

import { useEffect, useState, Suspense, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { ArrowLeft, Search, RefreshCw, Navigation } from "lucide-react";
import { PlaceCard } from "@/components/places/PlaceCard";
import { CategoryFilter } from "@/components/places/CategoryFilter";
import { PageSpinner } from "@/components/ui/Spinner";
import { PlaceCardSkeleton } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import { SearchBar } from "@/components/ui/SearchBar";
import { useLocationStore } from "@/lib/store/useLocationStore";
import { useGeolocation } from "@/lib/hooks/useGeolocation";
import type { Category, Place } from "@/types";

function SearchContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const q = searchParams.get("q") || "";
  const initialCategory = searchParams.get("category") as Category | null;

  const { coordinates } = useLocationStore();
  const { locate } = useGeolocation();
  const [places, setPlaces] = useState<Place[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(initialCategory);

  const doSearch = useCallback(async () => {
    if (!q && !selectedCategory) return;
    setLoading(true);
    setError(null);
    try {
      let url = "";
      if (selectedCategory && coordinates) {
        url = `/api/places?lat=${coordinates.lat}&lon=${coordinates.lon}&radius=5000&category=${selectedCategory}`;
      } else if (selectedCategory && !coordinates) {
        // No location — show a prompt, don't make a broken API call
        setPlaces([]);
        setLoading(false);
        return;
      } else if (q) {
        url = `/api/search?q=${encodeURIComponent(q)}&asPlaces=true`;
        if (coordinates) url += `&lat=${coordinates.lat}&lon=${coordinates.lon}`;
      }
      if (!url) { setLoading(false); return; }

      const res = await fetch(url);
      if (res.status === 503) {
        setError("Service temporarily unavailable. Tap to retry.");
        setLoading(false);
        return;
      }
      if (!res.ok) {
        setError("Search failed. Please try again.");
        setLoading(false);
        return;
      }
      const data = await res.json();
      setPlaces(Array.isArray(data) ? data : []);
    } catch {
      setError("Network error. Check your connection and retry.");
    } finally {
      setLoading(false);
    }
  }, [q, selectedCategory, coordinates]);

  useEffect(() => {
    doSearch();
  }, [doSearch]);

  const needsLocation = selectedCategory && !coordinates && !q;

  return (
    <div className="max-w-3xl mx-auto px-4 py-4">
      {/* Header */}
      <div className="flex items-center gap-3 mb-4">
        <button
          onClick={() => router.back()}
          className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-surface-secondary transition-colors duration-150"
        >
          <ArrowLeft className="w-5 h-5 text-text-primary" />
        </button>
        <div className="flex-1">
          <SearchBar placeholder="Search places, cities…" />
        </div>
      </div>

      {q && !loading && (
        <p className="text-sm text-text-secondary mb-4">
          {`${places.length} result${places.length !== 1 ? "s" : ""} for "${q}"`}
        </p>
      )}

      <CategoryFilter
        selected={selectedCategory}
        onChange={setSelectedCategory}
        className="mb-4"
      />

      {loading && (
        <div className="space-y-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <PlaceCardSkeleton key={i} horizontal />
          ))}
        </div>
      )}

      {!loading && error && (
        <EmptyState
          icon={<RefreshCw className="w-6 h-6" />}
          title="Something went wrong"
          description={error}
          action={{ label: "Retry", onClick: doSearch }}
        />
      )}

      {!loading && !error && needsLocation && (
        <div className="flex flex-col items-center text-center py-12 px-4">
          <div className="w-12 h-12 rounded-2xl bg-accent-light flex items-center justify-center mx-auto mb-3">
            <Navigation className="w-6 h-6 text-accent" />
          </div>
          <p className="font-semibold text-text-primary">Location needed</p>
          <p className="text-sm text-text-secondary mt-1 max-w-xs">
            Enable location access to find nearby places in this category.
          </p>
          <button
            onClick={locate}
            className="mt-4 flex items-center gap-2 bg-accent text-white text-sm font-medium px-5 py-2.5 rounded-xl hover:bg-accent-dark active:scale-95 transition-all duration-150"
          >
            <Navigation className="w-4 h-4" />
            Enable Location
          </button>
        </div>
      )}

      {!loading && !error && !needsLocation && places.length === 0 && (q || selectedCategory) && (
        <EmptyState
          icon={<Search className="w-6 h-6" />}
          title="No results found"
          description="Try a different search term or adjust the category filter."
        />
      )}

      {!loading && !error && places.length > 0 && (
        <div className="space-y-2 stagger">
          {places.map((place) => (
            <PlaceCard key={place.id} place={place} horizontal />
          ))}
        </div>
      )}
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={<PageSpinner />}>
      <SearchContent />
    </Suspense>
  );
}

"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { ArrowLeft, Search } from "lucide-react";
import { PlaceCard } from "@/components/places/PlaceCard";
import { CategoryFilter } from "@/components/places/CategoryFilter";
import { PageSpinner } from "@/components/ui/Spinner";
import { PlaceCardSkeleton } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import { SearchBar } from "@/components/ui/SearchBar";
import { useLocationStore } from "@/lib/store/useLocationStore";
import type { Category, Place } from "@/types";

function SearchContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const q = searchParams.get("q") || "";
  const initialCategory = searchParams.get("category") as Category | null;

  const { coordinates } = useLocationStore();
  const [places, setPlaces] = useState<Place[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(initialCategory);

  useEffect(() => {
    async function doSearch() {
      if (!q && !selectedCategory) return;
      setLoading(true);
      try {
        let url = "";
        if (selectedCategory && coordinates) {
          url = `/api/places?lat=${coordinates.lat}&lon=${coordinates.lon}&radius=5000&category=${selectedCategory}`;
        } else if (q) {
          url = `/api/search?q=${encodeURIComponent(q)}&asPlaces=true`;
          if (coordinates) url += `&lat=${coordinates.lat}&lon=${coordinates.lon}`;
        }
        if (!url) return;
        const res = await fetch(url);
        if (res.ok) {
          const data: Place[] = await res.json();
          setPlaces(data);
        }
      } finally {
        setLoading(false);
      }
    }
    doSearch();
  }, [q, selectedCategory, coordinates]);

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

      {q && (
        <p className="text-sm text-text-secondary mb-4">
          {loading ? "Searching…" : `${places.length} results for "${q}"`}
        </p>
      )}

      <CategoryFilter
        selected={selectedCategory}
        onChange={setSelectedCategory}
        className="mb-4"
      />

      {loading && (
        <div className="grid sm:grid-cols-2 gap-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <PlaceCardSkeleton key={i} />
          ))}
        </div>
      )}

      {!loading && places.length === 0 && (q || selectedCategory) && (
        <EmptyState
          icon={<Search className="w-6 h-6" />}
          title="No results found"
          description={`Try a different search term or category.`}
        />
      )}

      {!loading && places.length > 0 && (
        <div className="grid sm:grid-cols-2 gap-3">
          {places.map((place) => (
            <PlaceCard key={place.id} place={place} />
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

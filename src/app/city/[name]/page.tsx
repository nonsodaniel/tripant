"use client";

import { use, useEffect, useState } from "react";
import { ArrowLeft, MapPin } from "lucide-react";
import { useRouter } from "next/navigation";
import { PlaceCard } from "@/components/places/PlaceCard";
import { PageSpinner } from "@/components/ui/Spinner";
import { geocodeCity } from "@/lib/api/nominatim";
import { fetchNearbyPlaces } from "@/lib/api/overpass";
import type { Place, Category, Coordinates } from "@/types";
import { CATEGORY_LABELS } from "@/types";

interface PageProps {
  params: Promise<{ name: string }>;
}

const CITY_SECTIONS: { category: Category; label: string; emoji: string }[] = [
  { category: "attraction", label: "Top Attractions", emoji: "🎭" },
  { category: "food", label: "Best Food", emoji: "🍽️" },
  { category: "museum", label: "Museums", emoji: "🏛️" },
  { category: "park", label: "Parks & Gardens", emoji: "🌳" },
  { category: "landmark", label: "Landmarks", emoji: "🗿" },
  { category: "hidden_gem", label: "Hidden Gems", emoji: "💎" },
];

export default function CityGuidePage({ params }: PageProps) {
  const { name } = use(params);
  const router = useRouter();
  const cityName = decodeURIComponent(name);

  const [coords, setCoords] = useState<Coordinates | null>(null);
  const [sections, setSections] = useState<Record<string, Place[]>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setLoading(true);
      const c = await geocodeCity(cityName);
      if (!c) { setLoading(false); return; }
      setCoords(c);

      const results = await Promise.allSettled(
        CITY_SECTIONS.map(({ category }) =>
          fetchNearbyPlaces({ lat: c.lat, lon: c.lon, radius: 5000, category, limit: 6 })
        )
      );

      const sectionMap: Record<string, Place[]> = {};
      CITY_SECTIONS.forEach(({ category }, i) => {
        const result = results[i];
        if (result.status === "fulfilled") {
          sectionMap[category] = result.value;
        }
      });
      setSections(sectionMap);
      setLoading(false);
    }
    load();
  }, [cityName]);

  return (
    <div className="max-w-3xl mx-auto px-4 py-4">
      <div className="flex items-center gap-3 mb-5">
        <button
          onClick={() => router.back()}
          className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-surface-secondary transition-colors duration-150"
        >
          <ArrowLeft className="w-5 h-5 text-text-primary" />
        </button>
        <div>
          <h1 className="text-xl font-bold text-text-primary">{cityName}</h1>
          <div className="flex items-center gap-1 text-sm text-text-secondary">
            <MapPin className="w-3.5 h-3.5" />
            City Guide
          </div>
        </div>
      </div>

      {loading && <PageSpinner />}

      {!loading && !coords && (
        <div className="text-center py-12">
          <p className="text-text-secondary">City not found. Try searching for a different city.</p>
        </div>
      )}

      {!loading && coords && (
        <div className="space-y-8">
          {CITY_SECTIONS.map(({ category, label, emoji }) => {
            const places = sections[category] || [];
            if (!places.length) return null;
            return (
              <section key={category}>
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-xl">{emoji}</span>
                  <h2 className="text-base font-semibold text-text-primary">{label}</h2>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {places.map((place) => (
                    <PlaceCard key={place.id} place={place} />
                  ))}
                </div>
              </section>
            );
          })}
        </div>
      )}
    </div>
  );
}

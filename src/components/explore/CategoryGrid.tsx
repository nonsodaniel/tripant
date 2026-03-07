"use client";

import Link from "next/link";
import type { Category } from "@/types";

const CATEGORIES: { category: Category; label: string; emoji: string; description: string }[] = [
  { category: "food", label: "Food & Drink", emoji: "🍽️", description: "Restaurants, cafes & bars" },
  { category: "attraction", label: "Attractions", emoji: "🎭", description: "Must-see spots" },
  { category: "museum", label: "Museums", emoji: "🏛️", description: "Art & culture" },
  { category: "park", label: "Parks", emoji: "🌳", description: "Green spaces" },
  { category: "landmark", label: "Landmarks", emoji: "🗿", description: "Historic sites" },
  { category: "nightlife", label: "Nightlife", emoji: "🌙", description: "Bars & clubs" },
  { category: "shopping", label: "Shopping", emoji: "🛍️", description: "Markets & malls" },
  { category: "hidden_gem", label: "Hidden Gems", emoji: "💎", description: "Local secrets" },
  { category: "nature", label: "Nature", emoji: "🌿", description: "Natural beauty" },
  { category: "event", label: "Events", emoji: "🎪", description: "Festivals & shows" },
  { category: "sport", label: "Sports", emoji: "⚽", description: "Sports & fitness" },
  { category: "transport", label: "Transport", emoji: "🚆", description: "Getting around" },
];

interface CategoryGridProps {
  lat?: number;
  lon?: number;
}

export function CategoryGrid({ lat, lon }: CategoryGridProps) {
  return (
    <section>
      <h2 className="text-lg font-semibold text-text-primary mb-4">Explore by Category</h2>
      <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 gap-2.5">
        {CATEGORIES.map(({ category, label, emoji, description }) => {
          const params = new URLSearchParams({ category });
          if (lat !== undefined) params.set("lat", lat.toString());
          if (lon !== undefined) params.set("lon", lon.toString());

          return (
            <Link
              key={category}
              href={`/search?${params}`}
              className="group flex flex-col items-center gap-2 p-3 bg-surface border border-border rounded-2xl hover:border-accent hover:bg-accent-light transition-all duration-150"
            >
              <span className="text-2xl">{emoji}</span>
              <div className="text-center">
                <p className="text-xs font-semibold text-text-primary group-hover:text-accent transition-colors duration-150 leading-tight">
                  {label}
                </p>
                <p className="text-[10px] text-text-tertiary mt-0.5 hidden sm:block leading-tight">
                  {description}
                </p>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}

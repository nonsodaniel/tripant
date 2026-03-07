"use client";

import { clsx } from "clsx";
import type { Category } from "@/types";
import { CATEGORY_LABELS } from "@/types";

const POPULAR_CATEGORIES: Category[] = [
  "food",
  "attraction",
  "museum",
  "park",
  "landmark",
  "nightlife",
  "shopping",
  "hidden_gem",
  "nature",
  "event",
];

const CATEGORY_EMOJIS: Record<Category, string> = {
  food: "🍽️",
  attraction: "🎭",
  museum: "🏛️",
  park: "🌳",
  landmark: "🗿",
  nightlife: "🌙",
  shopping: "🛍️",
  transport: "🚆",
  hotel: "🏨",
  event: "🎪",
  hidden_gem: "💎",
  nature: "🌿",
  sport: "⚽",
  healthcare: "🏥",
  other: "📍",
};

interface CategoryFilterProps {
  selected?: Category | null;
  onChange: (category: Category | null) => void;
  className?: string;
}

export function CategoryFilter({ selected, onChange, className }: CategoryFilterProps) {
  return (
    <div className={clsx("flex gap-2 overflow-x-auto pb-1 scrollbar-none", className)}>
      <button
        onClick={() => onChange(null)}
        className={clsx(
          "flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium border transition-all duration-150 whitespace-nowrap",
          !selected
            ? "bg-accent text-white border-accent"
            : "bg-surface text-text-secondary border-border hover:border-border-strong hover:text-text-primary"
        )}
      >
        All
      </button>
      {POPULAR_CATEGORIES.map((cat) => (
        <button
          key={cat}
          onClick={() => onChange(selected === cat ? null : cat)}
          className={clsx(
            "flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium border transition-all duration-150 whitespace-nowrap",
            selected === cat
              ? "bg-accent text-white border-accent"
              : "bg-surface text-text-secondary border-border hover:border-border-strong hover:text-text-primary"
          )}
        >
          <span>{CATEGORY_EMOJIS[cat]}</span>
          {CATEGORY_LABELS[cat]}
        </button>
      ))}
    </div>
  );
}

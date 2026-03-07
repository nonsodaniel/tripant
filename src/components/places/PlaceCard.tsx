"use client";

import Link from "next/link";
import { MapPin, Star, Bookmark, BookmarkCheck } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { useSavedStore } from "@/lib/store/useSavedStore";
import type { Place } from "@/types";
import { CATEGORY_LABELS } from "@/types";
import { formatDistance } from "@/lib/utils/distance";
import { clsx } from "clsx";

interface PlaceCardProps {
  place: Place;
  horizontal?: boolean;
  className?: string;
}

export function PlaceCard({ place, horizontal = false, className }: PlaceCardProps) {
  const { isPlaceSaved, savePlace, unsavePlace } = useSavedStore();
  const saved = isPlaceSaved(place.id);

  function toggleSave(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (saved) unsavePlace(place.id);
    else savePlace(place);
  }

  if (horizontal) {
    return (
      <Link href={`/place/${encodeURIComponent(place.id)}`} className={clsx("block group", className)}>
        <div className="flex items-start gap-3 p-3 bg-surface border border-border rounded-xl hover:shadow-card-hover hover:border-border-strong transition-all duration-150">
          <div className="w-14 h-14 rounded-lg bg-surface-tertiary flex items-center justify-center flex-shrink-0 text-xl">
            {getCategoryEmoji(place.category)}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <p className="font-medium text-sm text-text-primary truncate">{place.name}</p>
                <p className="text-xs text-text-secondary mt-0.5">{CATEGORY_LABELS[place.category]}</p>
              </div>
              <button
                onClick={toggleSave}
                className="flex-shrink-0 text-text-tertiary hover:text-accent transition-colors duration-150 mt-0.5"
                aria-label={saved ? "Unsave" : "Save"}
              >
                {saved ? (
                  <BookmarkCheck className="w-4 h-4 text-accent" />
                ) : (
                  <Bookmark className="w-4 h-4" />
                )}
              </button>
            </div>
            <div className="flex items-center gap-2 mt-1.5">
              {place.distance !== undefined && (
                <span className="flex items-center gap-0.5 text-xs text-text-tertiary">
                  <MapPin className="w-3 h-3" />
                  {formatDistance(place.distance)}
                </span>
              )}
              {place.rating && (
                <span className="flex items-center gap-0.5 text-xs text-text-tertiary">
                  <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                  {place.rating.toFixed(1)}
                </span>
              )}
            </div>
          </div>
        </div>
      </Link>
    );
  }

  return (
    <Link href={`/place/${encodeURIComponent(place.id)}`} className={clsx("block group", className)}>
      <div className="bg-surface border border-border rounded-2xl overflow-hidden hover:shadow-card-hover hover:-translate-y-0.5 transition-all duration-150">
        <div className="h-36 bg-surface-tertiary flex items-center justify-center text-4xl relative">
          {getCategoryEmoji(place.category)}
          <button
            onClick={toggleSave}
            className="absolute top-2 right-2 w-7 h-7 rounded-full bg-surface/90 flex items-center justify-center text-text-secondary hover:text-accent transition-colors duration-150"
            aria-label={saved ? "Unsave" : "Save"}
          >
            {saved ? (
              <BookmarkCheck className="w-3.5 h-3.5 text-accent" />
            ) : (
              <Bookmark className="w-3.5 h-3.5" />
            )}
          </button>
          {place.featured && (
            <span className="absolute top-2 left-2 text-xs font-medium bg-accent text-white px-2 py-0.5 rounded-full">
              Featured
            </span>
          )}
        </div>
        <div className="p-3">
          <Badge variant="neutral" size="sm" className="mb-1.5">
            {CATEGORY_LABELS[place.category]}
          </Badge>
          <p className="font-semibold text-sm text-text-primary line-clamp-1">{place.name}</p>
          <div className="flex items-center gap-2 mt-1.5">
            {place.distance !== undefined && (
              <span className="flex items-center gap-0.5 text-xs text-text-tertiary">
                <MapPin className="w-3 h-3" />
                {formatDistance(place.distance)}
              </span>
            )}
            {place.rating && (
              <span className="flex items-center gap-0.5 text-xs text-text-tertiary">
                <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                {place.rating.toFixed(1)}
              </span>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}

function getCategoryEmoji(category: string): string {
  const map: Record<string, string> = {
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
  return map[category] || "📍";
}

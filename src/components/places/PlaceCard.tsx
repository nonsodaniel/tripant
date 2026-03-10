"use client";

import { useState } from "react";
import Link from "next/link";
import { MapPin, Star, Bookmark, BookmarkCheck, Check } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { PlaceImage } from "@/components/ui/PlaceImage";
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
  const { isPlaceSaved, savePlace, unsavePlace, setPreviewPlace } = useSavedStore();
  const saved = isPlaceSaved(place.id);
  const [justSaved, setJustSaved] = useState(false);

  function toggleSave(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (saved) {
      unsavePlace(place.id);
    } else {
      savePlace(place);
      setJustSaved(true);
      setTimeout(() => setJustSaved(false), 1500);
    }
  }

  if (horizontal) {
    return (
      <Link
        href={`/place/${encodeURIComponent(place.id)}`}
        onClick={() => setPreviewPlace(place)}
        className={clsx("block group active:scale-[0.98] transition-transform duration-150", className)}
      >
        <div className="flex items-start gap-3 p-3 bg-surface border border-border rounded-xl hover:shadow-card-hover hover:border-border-strong transition-all duration-150">
          <PlaceImage
            name={place.name}
            category={place.category}
            className="w-14 h-14 rounded-lg flex-shrink-0"
            emojiClassName="text-xl"
          />
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <p className="font-medium text-sm text-text-primary truncate">{place.name}</p>
                <p className="text-xs text-text-secondary mt-0.5">{CATEGORY_LABELS[place.category]}</p>
                {place.address && (
                  <p className="text-xs text-text-tertiary mt-0.5 truncate">{place.address}</p>
                )}
              </div>
              <button
                onClick={toggleSave}
                className={clsx(
                  "flex-shrink-0 transition-all duration-200 mt-0.5",
                  justSaved ? "text-accent scale-110" : "text-text-tertiary hover:text-accent"
                )}
                aria-label={saved ? "Unsave" : "Save"}
              >
                {justSaved ? (
                  <Check className="w-4 h-4" />
                ) : saved ? (
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
    <Link
      href={`/place/${encodeURIComponent(place.id)}`}
      onClick={() => setPreviewPlace(place)}
      className={clsx(
        "block group active:scale-[0.97] transition-transform duration-150",
        className
      )}
    >
      <div className="bg-surface border border-border rounded-2xl overflow-hidden hover:shadow-card-hover hover:-translate-y-0.5 transition-all duration-150">
        <PlaceImage
          name={place.name}
          category={place.category}
          className="h-36 w-full relative"
          emojiClassName="text-4xl"
        >
          <div className="absolute top-2 right-2 z-10">
            <button
              onClick={toggleSave}
              className={clsx(
                "w-7 h-7 rounded-full bg-surface/90 flex items-center justify-center transition-all duration-200",
                justSaved ? "text-accent scale-110" : "text-text-secondary hover:text-accent"
              )}
              aria-label={saved ? "Unsave" : "Save"}
            >
              {justSaved ? (
                <Check className="w-3.5 h-3.5" />
              ) : saved ? (
                <BookmarkCheck className="w-3.5 h-3.5 text-accent" />
              ) : (
                <Bookmark className="w-3.5 h-3.5" />
              )}
            </button>
          </div>
          {place.featured && (
            <div className="absolute top-2 left-2 z-10">
              <span className="text-xs font-medium bg-accent text-white px-2 py-0.5 rounded-full">
                Featured
              </span>
            </div>
          )}
        </PlaceImage>

        <div className="p-3">
          <Badge variant="neutral" size="sm" className="mb-1.5">
            {CATEGORY_LABELS[place.category]}
          </Badge>
          <p className="font-semibold text-sm text-text-primary line-clamp-1">{place.name}</p>
          {place.address && (
            <p className="text-xs text-text-tertiary mt-0.5 line-clamp-1">{place.address}</p>
          )}
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

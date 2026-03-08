"use client";

import { useState } from "react";
import { usePlacePhoto } from "@/lib/hooks/usePlacePhoto";
import { clsx } from "clsx";

// Solid muted tones per category — no gradients, no neon
const CATEGORY_BG: Record<string, string> = {
  food:       "bg-amber-50   dark:bg-amber-950/40",
  attraction: "bg-blue-50    dark:bg-blue-950/40",
  museum:     "bg-violet-50  dark:bg-violet-950/40",
  park:       "bg-green-50   dark:bg-green-950/40",
  landmark:   "bg-red-50     dark:bg-red-950/40",
  nightlife:  "bg-pink-50    dark:bg-pink-950/40",
  shopping:   "bg-orange-50  dark:bg-orange-950/40",
  transport:  "bg-sky-50     dark:bg-sky-950/40",
  hotel:      "bg-teal-50    dark:bg-teal-950/40",
  event:      "bg-purple-50  dark:bg-purple-950/40",
  hidden_gem: "bg-yellow-50  dark:bg-yellow-950/40",
  nature:     "bg-lime-50    dark:bg-lime-950/40",
  sport:      "bg-indigo-50  dark:bg-indigo-950/40",
  healthcare: "bg-rose-50    dark:bg-rose-950/40",
  other:      "bg-surface-tertiary",
};

const CATEGORY_EMOJI: Record<string, string> = {
  food: "🍽️", attraction: "🎭", museum: "🏛️", park: "🌳",
  landmark: "🗿", nightlife: "🌙", shopping: "🛍️", transport: "🚆",
  hotel: "🏨", event: "🎪", hidden_gem: "💎", nature: "🌿",
  sport: "⚽", healthcare: "🏥", other: "📍",
};

interface PlaceImageProps {
  name: string;
  category: string;
  className?: string;
  /** Size of the fallback emoji */
  emojiClassName?: string;
  /** Skip the Wikipedia fetch (e.g. for list items that aren't in viewport) */
  fetchPhoto?: boolean;
  /** Overlay elements rendered on top of the image */
  children?: React.ReactNode;
}

export function PlaceImage({
  name,
  category,
  className,
  emojiClassName = "text-4xl",
  fetchPhoto = true,
  children,
}: PlaceImageProps) {
  const { photoUrl } = usePlacePhoto(name, fetchPhoto);
  const [imgLoaded, setImgLoaded] = useState(false);
  const [imgError, setImgError] = useState(false);

  const bg = CATEGORY_BG[category] ?? CATEGORY_BG.other;
  const emoji = CATEGORY_EMOJI[category] ?? "📍";
  const showPhoto = !!photoUrl && !imgError;

  return (
    <div className={clsx("relative overflow-hidden", className)}>
      {/* Fallback: category-tinted background + emoji */}
      <div
        className={clsx(
          "absolute inset-0 flex items-center justify-center",
          bg
        )}
      >
        <span className={clsx("select-none", emojiClassName)}>{emoji}</span>
      </div>

      {/* Real photo — fades in once loaded */}
      {showPhoto && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={photoUrl}
          alt={name}
          className={clsx(
            "absolute inset-0 w-full h-full object-cover",
            "transition-opacity duration-500 ease-out",
            imgLoaded ? "opacity-100" : "opacity-0"
          )}
          onLoad={() => setImgLoaded(true)}
          onError={() => setImgError(true)}
        />
      )}

      {/* Subtle bottom scrim so place name stays legible on photos */}
      {showPhoto && imgLoaded && (
        <div className="absolute inset-x-0 bottom-0 h-16 bg-[linear-gradient(to_top,rgba(0,0,0,0.35),transparent)]" />
      )}

      {/* Slot for overlay buttons / badges */}
      {children}
    </div>
  );
}

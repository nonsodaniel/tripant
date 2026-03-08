"use client";

import { useState } from "react";
import { usePlacePhoto } from "@/lib/hooks/usePlacePhoto";
import { clsx } from "clsx";

// Cat-bg-* classes are defined in globals.css — never as Tailwind utilities —
// so they're guaranteed to be in the CSS bundle on every page and every route.
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
  emojiClassName?: string;
  /** Set false to skip the Wikipedia fetch for off-screen / compact items */
  fetchPhoto?: boolean;
  /** Overlay elements (save button, featured badge, etc.) */
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

  const catClass = `cat-bg-${category}`;
  const emoji = CATEGORY_EMOJI[category] ?? "📍";
  const showPhoto = !!photoUrl && !imgError;

  return (
    <div className={clsx("relative overflow-hidden", className)}>
      {/* Category-tinted fallback — always visible until a photo loads */}
      <div className={clsx("absolute inset-0 flex items-center justify-center", catClass)}>
        <span className={clsx("select-none", emojiClassName)}>{emoji}</span>
      </div>

      {/* Wikipedia photo — fades in smoothly once the browser loads it */}
      {showPhoto && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={photoUrl}
          alt={name}
          className={clsx(
            "absolute inset-0 w-full h-full object-cover transition-opacity duration-500 ease-out",
            imgLoaded ? "opacity-100" : "opacity-0"
          )}
          onLoad={() => setImgLoaded(true)}
          onError={() => setImgError(true)}
        />
      )}

      {/* Bottom scrim — makes overlaid text legible on real photos */}
      {showPhoto && imgLoaded && (
        <div className="absolute inset-x-0 bottom-0 h-20 bg-[linear-gradient(to_top,rgba(0,0,0,0.4),transparent)]" />
      )}

      {children}
    </div>
  );
}

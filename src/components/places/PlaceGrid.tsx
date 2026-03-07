import { PlaceCard } from "./PlaceCard";
import type { Place } from "@/types";
import { clsx } from "clsx";

interface PlaceGridProps {
  places: Place[];
  layout?: "grid" | "list";
  className?: string;
}

export function PlaceGrid({ places, layout = "grid", className }: PlaceGridProps) {
  if (layout === "list") {
    return (
      <div className={clsx("flex flex-col gap-2", className)}>
        {places.map((place) => (
          <PlaceCard key={place.id} place={place} horizontal />
        ))}
      </div>
    );
  }

  return (
    <div className={clsx("grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3", className)}>
      {places.map((place) => (
        <PlaceCard key={place.id} place={place} />
      ))}
    </div>
  );
}

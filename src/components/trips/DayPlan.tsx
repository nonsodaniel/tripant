"use client";

import { MapPin, Clock, Trash2, GripVertical } from "lucide-react";
import type { TripDay, TripPlace } from "@/types";
import { formatDate } from "@/lib/utils/format";

interface DayPlanProps {
  day: TripDay;
  tripId: string;
  onRemovePlace: (dayId: string, tripPlaceId: string) => void;
}

export function DayPlan({ day, tripId, onRemovePlace }: DayPlanProps) {
  return (
    <div className="border border-border rounded-2xl overflow-hidden">
      <div className="px-4 py-3 bg-surface-secondary border-b border-border">
        <div className="flex items-center justify-between">
          <div>
            <p className="font-semibold text-text-primary">Day {day.dayNumber}</p>
            <p className="text-xs text-text-secondary">{formatDate(day.date)}</p>
          </div>
          <span className="text-xs text-text-tertiary">
            {day.places.length} {day.places.length === 1 ? "stop" : "stops"}
          </span>
        </div>
      </div>

      <div className="divide-y divide-border">
        {day.places.length === 0 ? (
          <p className="text-sm text-text-tertiary text-center py-6">
            No places added yet. Add places to build your itinerary.
          </p>
        ) : (
          day.places.map((tripPlace, index) => (
            <DayPlaceItem
              key={tripPlace.id}
              tripPlace={tripPlace}
              index={index}
              dayId={day.id}
              onRemove={onRemovePlace}
            />
          ))
        )}
      </div>
    </div>
  );
}

function DayPlaceItem({
  tripPlace,
  index,
  dayId,
  onRemove,
}: {
  tripPlace: TripPlace;
  index: number;
  dayId: string;
  onRemove: (dayId: string, tripPlaceId: string) => void;
}) {
  const { place } = tripPlace;

  return (
    <div className="flex items-start gap-3 p-3 bg-surface group">
      <div className="flex items-center gap-2 flex-shrink-0 mt-0.5">
        <GripVertical className="w-4 h-4 text-text-tertiary opacity-0 group-hover:opacity-100 transition-opacity cursor-grab" />
        <div className="w-6 h-6 rounded-full bg-accent-light flex items-center justify-center">
          <span className="text-xs font-semibold text-accent">{index + 1}</span>
        </div>
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-medium text-sm text-text-primary truncate">{place.name}</p>
        {place.address && (
          <div className="flex items-center gap-1 mt-0.5">
            <MapPin className="w-3 h-3 text-text-tertiary flex-shrink-0" />
            <p className="text-xs text-text-secondary truncate">{place.address}</p>
          </div>
        )}
        {tripPlace.visitTime && (
          <div className="flex items-center gap-1 mt-0.5">
            <Clock className="w-3 h-3 text-text-tertiary flex-shrink-0" />
            <p className="text-xs text-text-secondary">{tripPlace.visitTime}</p>
          </div>
        )}
      </div>
      <button
        onClick={() => onRemove(dayId, tripPlace.id)}
        className="text-text-tertiary hover:text-red-500 transition-colors duration-150 opacity-0 group-hover:opacity-100 flex-shrink-0 mt-0.5"
        aria-label="Remove place"
      >
        <Trash2 className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}

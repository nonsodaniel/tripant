"use client";

import { useRef, useState } from "react";
import { MapPin, Clock, Trash2, GripVertical } from "lucide-react";
import type { TripDay, TripPlace } from "@/types";
import { formatDate } from "@/lib/utils/format";

interface DayPlanProps {
  day: TripDay;
  tripId: string;
  onRemovePlace: (dayId: string, tripPlaceId: string) => void;
  onReorderPlaces: (dayId: string, fromIndex: number, toIndex: number) => void;
  onRemoveDay?: (dayId: string) => void;
}

export function DayPlan({ day, tripId, onRemovePlace, onReorderPlaces, onRemoveDay }: DayPlanProps) {
  return (
    <div className="border border-border rounded-2xl overflow-hidden">
      <div className="px-4 py-3 bg-surface-secondary border-b border-border">
        <div className="flex items-center justify-between">
          <div>
            <p className="font-semibold text-text-primary">Day {day.dayNumber}</p>
            <p className="text-xs text-text-secondary">{formatDate(day.date)}</p>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs text-text-tertiary">
              {day.places.length} {day.places.length === 1 ? "stop" : "stops"}
            </span>
            {onRemoveDay && (
              <button
                onClick={() => onRemoveDay(day.id)}
                className="text-xs text-text-tertiary hover:text-red-500 transition-colors duration-150"
                aria-label="Remove day"
              >
                Remove
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="divide-y divide-border">
        {day.places.length === 0 ? (
          <p className="text-sm text-text-tertiary text-center py-6">
            No places added yet. Add places to build your itinerary.
          </p>
        ) : (
          <SortablePlaceList
            places={day.places}
            dayId={day.id}
            onRemove={onRemovePlace}
            onReorder={onReorderPlaces}
          />
        )}
      </div>
    </div>
  );
}

function SortablePlaceList({
  places,
  dayId,
  onRemove,
  onReorder,
}: {
  places: TripPlace[];
  dayId: string;
  onRemove: (dayId: string, tripPlaceId: string) => void;
  onReorder: (dayId: string, fromIndex: number, toIndex: number) => void;
}) {
  const dragIndex = useRef<number | null>(null);
  const [overIndex, setOverIndex] = useState<number | null>(null);

  function handleDragStart(index: number) {
    dragIndex.current = index;
  }

  function handleDragOver(e: React.DragEvent, index: number) {
    e.preventDefault();
    setOverIndex(index);
  }

  function handleDrop(toIndex: number) {
    if (dragIndex.current !== null && dragIndex.current !== toIndex) {
      onReorder(dayId, dragIndex.current, toIndex);
    }
    dragIndex.current = null;
    setOverIndex(null);
  }

  function handleDragEnd() {
    dragIndex.current = null;
    setOverIndex(null);
  }

  return (
    <>
      {places.map((tripPlace, index) => (
        <DayPlaceItem
          key={tripPlace.id}
          tripPlace={tripPlace}
          index={index}
          dayId={dayId}
          isDragOver={overIndex === index}
          onRemove={onRemove}
          onDragStart={() => handleDragStart(index)}
          onDragOver={(e) => handleDragOver(e, index)}
          onDrop={() => handleDrop(index)}
          onDragEnd={handleDragEnd}
        />
      ))}
    </>
  );
}

function DayPlaceItem({
  tripPlace,
  index,
  dayId,
  isDragOver,
  onRemove,
  onDragStart,
  onDragOver,
  onDrop,
  onDragEnd,
}: {
  tripPlace: TripPlace;
  index: number;
  dayId: string;
  isDragOver: boolean;
  onRemove: (dayId: string, tripPlaceId: string) => void;
  onDragStart: () => void;
  onDragOver: (e: React.DragEvent) => void;
  onDrop: () => void;
  onDragEnd: () => void;
}) {
  const { place } = tripPlace;

  return (
    <div
      draggable
      onDragStart={onDragStart}
      onDragOver={onDragOver}
      onDrop={onDrop}
      onDragEnd={onDragEnd}
      className={`flex items-start gap-3 p-3 bg-surface group transition-colors duration-100 ${
        isDragOver ? "bg-accent-light border-l-2 border-accent" : ""
      }`}
    >
      <div className="flex items-center gap-2 flex-shrink-0 mt-0.5">
        <GripVertical className="w-4 h-4 text-text-tertiary opacity-0 group-hover:opacity-100 transition-opacity cursor-grab active:cursor-grabbing" />
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

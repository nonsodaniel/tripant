"use client";

import Link from "next/link";
import { Calendar, MapPin, Trash2, ChevronRight } from "lucide-react";
import type { Trip } from "@/types";
import { formatDate } from "@/lib/utils/format";
import { useTripsStore } from "@/lib/store/useTripsStore";

const DESTINATION_EMOJIS: Record<string, string> = {
  paris: "🗼", london: "🎡", tokyo: "⛩️", rome: "🏛️",
  "new york": "🗽", dubai: "🏙️", barcelona: "🎨", amsterdam: "🌷",
  sydney: "🦘", bangkok: "🛺", singapore: "🌴", istanbul: "🕌",
};

function getDestinationEmoji(destination: string): string {
  const key = destination.toLowerCase();
  for (const [city, emoji] of Object.entries(DESTINATION_EMOJIS)) {
    if (key.includes(city)) return emoji;
  }
  return "✈️";
}

interface TripCardProps {
  trip: Trip;
}

export function TripCard({ trip }: TripCardProps) {
  const { deleteTrip } = useTripsStore();
  const placeCount = trip.days.reduce((sum, day) => sum + day.places.length, 0);
  const dayCount = trip.days.length;

  function handleDelete(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (confirm(`Delete "${trip.name}"?`)) {
      deleteTrip(trip.id);
    }
  }

  return (
    <Link
      href={`/trips/${trip.id}`}
      className="block group active:scale-[0.98] transition-transform duration-150"
    >
      <div className="bg-surface border border-border rounded-2xl overflow-hidden hover:shadow-card-hover hover:-translate-y-0.5 transition-all duration-150">
        {/* Colour header band */}
        <div className="h-24 bg-accent-light flex items-center justify-center relative">
          <span className="text-5xl select-none">{getDestinationEmoji(trip.destination)}</span>
          <button
            onClick={handleDelete}
            className="absolute top-3 right-3 w-7 h-7 rounded-full bg-surface/80 flex items-center justify-center text-text-tertiary hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all duration-150"
            aria-label="Delete trip"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="p-4">
          <p className="font-semibold text-text-primary leading-tight">{trip.name}</p>
          <div className="flex items-center gap-1 mt-1">
            <MapPin className="w-3 h-3 text-text-tertiary flex-shrink-0" />
            <p className="text-sm text-text-secondary truncate">{trip.destination}</p>
          </div>

          <div className="flex items-center justify-between mt-3 pt-3 border-t border-border">
            <div className="flex items-center gap-3">
              {(trip.startDate || trip.endDate) && (
                <div className="flex items-center gap-1">
                  <Calendar className="w-3 h-3 text-text-tertiary" />
                  <span className="text-xs text-text-secondary">
                    {trip.startDate ? formatDate(trip.startDate) : ""}
                    {trip.endDate ? ` – ${formatDate(trip.endDate)}` : ""}
                  </span>
                </div>
              )}
              <div className="flex items-center gap-1.5">
                <span className="inline-flex items-center text-xs font-medium text-text-tertiary">
                  {dayCount} {dayCount === 1 ? "day" : "days"}
                </span>
                {placeCount > 0 && (
                  <>
                    <span className="w-1 h-1 rounded-full bg-border-strong" />
                    <span className="text-xs text-text-tertiary">
                      {placeCount} {placeCount === 1 ? "place" : "places"}
                    </span>
                  </>
                )}
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-text-tertiary group-hover:text-accent transition-colors duration-150" />
          </div>
        </div>
      </div>
    </Link>
  );
}

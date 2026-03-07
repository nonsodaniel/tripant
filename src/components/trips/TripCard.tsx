"use client";

import Link from "next/link";
import { Briefcase, Calendar, MapPin, Trash2 } from "lucide-react";
import type { Trip } from "@/types";
import { formatDate } from "@/lib/utils/format";
import { useTripsStore } from "@/lib/store/useTripsStore";

interface TripCardProps {
  trip: Trip;
}

export function TripCard({ trip }: TripCardProps) {
  const { deleteTrip } = useTripsStore();
  const placeCount = trip.days.reduce((sum, day) => sum + day.places.length, 0);

  function handleDelete(e: React.MouseEvent) {
    e.preventDefault();
    if (confirm(`Delete "${trip.name}"?`)) {
      deleteTrip(trip.id);
    }
  }

  return (
    <Link href={`/trips/${trip.id}`} className="block group">
      <div className="bg-surface border border-border rounded-2xl p-4 hover:shadow-card-hover hover:-translate-y-0.5 transition-all duration-150">
        <div className="flex items-start justify-between gap-3">
          <div className="w-10 h-10 rounded-xl bg-accent-light flex items-center justify-center flex-shrink-0">
            <Briefcase className="w-5 h-5 text-accent" />
          </div>
          <button
            onClick={handleDelete}
            className="text-text-tertiary hover:text-red-500 transition-colors duration-150 opacity-0 group-hover:opacity-100 mt-1"
            aria-label="Delete trip"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
        <div className="mt-3">
          <p className="font-semibold text-text-primary">{trip.name}</p>
          <div className="flex items-center gap-1 mt-1">
            <MapPin className="w-3.5 h-3.5 text-text-tertiary" />
            <p className="text-sm text-text-secondary">{trip.destination}</p>
          </div>
        </div>
        <div className="flex items-center gap-3 mt-3 pt-3 border-t border-border">
          {(trip.startDate || trip.endDate) && (
            <div className="flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-text-tertiary" />
              <span className="text-xs text-text-secondary">
                {trip.startDate ? formatDate(trip.startDate) : ""}
                {trip.endDate ? ` – ${formatDate(trip.endDate)}` : ""}
              </span>
            </div>
          )}
          <span className="text-xs text-text-tertiary ml-auto">
            {trip.days.length} {trip.days.length === 1 ? "day" : "days"} · {placeCount} places
          </span>
        </div>
      </div>
    </Link>
  );
}

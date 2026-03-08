"use client";

import Link from "next/link";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { TripCard } from "@/components/trips/TripCard";
import { useTripsStore } from "@/lib/store/useTripsStore";

export default function TripsPage() {
  const { trips } = useTripsStore();

  const totalPlaces = trips.reduce(
    (sum, t) => sum + t.days.reduce((ds, d) => ds + d.places.length, 0),
    0
  );

  return (
    <div className="max-w-3xl mx-auto">
      {/* Header */}
      <div className="bg-surface border-b border-border px-4 py-5">
        <div className="flex items-end justify-between">
          <div>
            <h1 className="text-2xl font-bold text-text-primary tracking-tight">My Trips</h1>
            {trips.length > 0 ? (
              <p className="text-sm text-text-secondary mt-1">
                {trips.length} {trips.length === 1 ? "trip" : "trips"} · {totalPlaces} places planned
              </p>
            ) : (
              <p className="text-sm text-text-secondary mt-1">Plan your next adventure</p>
            )}
          </div>
          <Link href="/trips/new">
            <Button variant="primary" size="sm" icon={<Plus className="w-4 h-4" />}>
              New Trip
            </Button>
          </Link>
        </div>
      </div>

      <div className="px-4 py-6">
        {trips.length === 0 ? (
          <div className="flex flex-col items-center text-center py-16">
            <div className="w-20 h-20 rounded-3xl bg-accent-light flex items-center justify-center mb-5">
              <span className="text-4xl select-none">✈️</span>
            </div>
            <h2 className="text-lg font-semibold text-text-primary">No trips yet</h2>
            <p className="text-sm text-text-secondary mt-2 max-w-xs">
              Start planning your next adventure. Create a trip and build a perfect day-by-day itinerary.
            </p>
            <Link href="/trips/new" className="mt-5">
              <Button variant="primary" icon={<Plus className="w-4 h-4" />}>
                Plan a trip
              </Button>
            </Link>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 gap-4 stagger">
            {trips.map((trip) => (
              <TripCard key={trip.id} trip={trip} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

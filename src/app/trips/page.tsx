"use client";

import Link from "next/link";
import { Plus, Briefcase } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { TripCard } from "@/components/trips/TripCard";
import { EmptyState } from "@/components/ui/EmptyState";
import { useTripsStore } from "@/lib/store/useTripsStore";

export default function TripsPage() {
  const { trips } = useTripsStore();

  return (
    <div className="max-w-3xl mx-auto px-4 py-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-text-primary">My Trips</h1>
          <p className="text-sm text-text-secondary mt-0.5">
            {trips.length} {trips.length === 1 ? "trip" : "trips"} planned
          </p>
        </div>
        <Link href="/trips/new">
          <Button variant="primary" size="sm" icon={<Plus className="w-4 h-4" />}>
            New Trip
          </Button>
        </Link>
      </div>

      {trips.length === 0 ? (
        <EmptyState
          icon={<Briefcase className="w-6 h-6" />}
          title="No trips yet"
          description="Start planning your next adventure. Create a trip and build your perfect itinerary."
          action={{
            label: "Plan a trip",
            onClick: () => window.location.href = "/trips/new",
          }}
        />
      ) : (
        <div className="grid sm:grid-cols-2 gap-4">
          {trips.map((trip) => (
            <TripCard key={trip.id} trip={trip} />
          ))}
        </div>
      )}
    </div>
  );
}

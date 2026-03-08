"use client";

import { useEffect, useState } from "react";
import { CalendarDays, Navigation } from "lucide-react";
import { PlaceCard } from "@/components/places/PlaceCard";
import { PlaceCardSkeleton } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import { useGeolocation } from "@/lib/hooks/useGeolocation";
import type { Place } from "@/types";

export default function EventsPage() {
  const { coordinates, locate } = useGeolocation();
  const [events, setEvents] = useState<Place[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!coordinates) return;
    setLoading(true);
    fetch(`/api/events?lat=${coordinates.lat}&lon=${coordinates.lon}`)
      .then((r) => (r.ok ? r.json() : []))
      .then((data: Place[]) => setEvents(data))
      .finally(() => setLoading(false));
  }, [coordinates]);

  return (
    <div className="max-w-3xl mx-auto">
      {/* Header */}
      <div className="bg-surface border-b border-border px-4 py-5">
        <h1 className="text-2xl font-bold text-text-primary tracking-tight">Local Events</h1>
        <p className="text-sm text-text-secondary mt-1">
          {coordinates
            ? loading
              ? "Searching nearby…"
              : `${events.length} venues & events found`
            : "Discover what's happening near you"}
        </p>
      </div>

      <div className="px-4 py-6">
        {!coordinates && (
          <EmptyState
            icon={<Navigation className="w-6 h-6" />}
            title="Location needed"
            description="Allow location access to discover events and venues near you."
            action={{ label: "Enable Location", onClick: locate }}
          />
        )}

        {coordinates && loading && (
          <div className="grid sm:grid-cols-2 gap-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <PlaceCardSkeleton key={i} />
            ))}
          </div>
        )}

        {coordinates && !loading && events.length === 0 && (
          <EmptyState
            icon={<CalendarDays className="w-6 h-6" />}
            title="No events found"
            description="No events or venues found nearby. Try expanding your search area."
          />
        )}

        {!loading && events.length > 0 && (
          <div className="grid sm:grid-cols-2 gap-3 stagger">
            {events.map((event) => (
              <PlaceCard key={event.id} place={event} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";
import { CalendarDays, Navigation } from "lucide-react";
import { PlaceCard } from "@/components/places/PlaceCard";
import { PageSpinner } from "@/components/ui/Spinner";
import { EmptyState } from "@/components/ui/EmptyState";
import { Button } from "@/components/ui/Button";
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
    <div className="max-w-3xl mx-auto px-4 py-6">
      <div className="mb-6">
        <h1 className="text-xl font-bold text-text-primary">Local Events</h1>
        <p className="text-sm text-text-secondary mt-0.5">
          Discover what&apos;s happening near you
        </p>
      </div>

      {!coordinates && (
        <EmptyState
          icon={<Navigation className="w-6 h-6" />}
          title="Location needed"
          description="Allow location access to discover events near you."
          action={{ label: "Enable Location", onClick: locate }}
        />
      )}

      {coordinates && loading && <PageSpinner />}

      {coordinates && !loading && events.length === 0 && (
        <EmptyState
          icon={<CalendarDays className="w-6 h-6" />}
          title="No events found"
          description="No events or venues found in your area. Try expanding your search."
        />
      )}

      {!loading && events.length > 0 && (
        <>
          <p className="text-sm text-text-secondary mb-4">
            {events.length} venues &amp; events found
          </p>
          <div className="grid sm:grid-cols-2 gap-3">
            {events.map((event) => (
              <PlaceCard key={event.id} place={event} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}

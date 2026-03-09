"use client";

import { use, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Plus,
  Calendar,
  MapPin,
  Share2,
  CalendarDays,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { DayPlan } from "@/components/trips/DayPlan";
import { EmptyState } from "@/components/ui/EmptyState";
import { useTripsStore } from "@/lib/store/useTripsStore";
import { formatDate } from "@/lib/utils/format";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function TripDetailPage({ params }: PageProps) {
  const { id } = use(params);
  const router = useRouter();
  const { getTrip, addDay, removeDay, removePlaceFromDay, reorderPlaces } = useTripsStore();
  const trip = getTrip(id);
  const [addingDay, setAddingDay] = useState(false);
  const [newDayDate, setNewDayDate] = useState("");

  if (!trip) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] px-4">
        <p className="text-text-secondary mb-4">Trip not found</p>
        <Link href="/trips">
          <Button variant="secondary">Back to Trips</Button>
        </Link>
      </div>
    );
  }

  function handleAddDay() {
    if (!newDayDate) return;
    addDay(trip!.id, newDayDate);
    setNewDayDate("");
    setAddingDay(false);
  }

  function handleShare() {
    const url = window.location.href;
    if (navigator.share) {
      navigator.share({ title: trip!.name, url });
    } else {
      navigator.clipboard.writeText(url).then(() => alert("Link copied!"));
    }
  }

  const totalPlaces = trip.days.reduce((sum, d) => sum + d.places.length, 0);

  return (
    <div className="max-w-3xl mx-auto px-4 py-4">
      {/* Header */}
      <div className="flex items-center gap-3 mb-5">
        <button
          onClick={() => router.back()}
          className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-surface-secondary transition-colors duration-150"
        >
          <ArrowLeft className="w-5 h-5 text-text-primary" />
        </button>
        <div className="flex-1 min-w-0">
          <h1 className="font-bold text-text-primary truncate">{trip.name}</h1>
          <div className="flex items-center gap-1.5 text-sm text-text-secondary">
            <MapPin className="w-3.5 h-3.5" />
            {trip.destination}
            {(trip.startDate || trip.endDate) && (
              <>
                <span>·</span>
                <Calendar className="w-3.5 h-3.5" />
                {trip.startDate && formatDate(trip.startDate)}
                {trip.endDate && ` – ${formatDate(trip.endDate)}`}
              </>
            )}
          </div>
        </div>
        <button
          onClick={handleShare}
          className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-surface-secondary text-text-secondary"
        >
          <Share2 className="w-4 h-4" />
        </button>
      </div>

      {/* Stats */}
      <div className="flex gap-3 mb-5">
        <div className="flex-1 p-3 bg-surface border border-border rounded-xl text-center">
          <p className="text-xl font-bold text-text-primary">{trip.days.length}</p>
          <p className="text-xs text-text-secondary mt-0.5">Days</p>
        </div>
        <div className="flex-1 p-3 bg-surface border border-border rounded-xl text-center">
          <p className="text-xl font-bold text-text-primary">{totalPlaces}</p>
          <p className="text-xs text-text-secondary mt-0.5">Places</p>
        </div>
        <div className="flex-1 p-3 bg-surface border border-border rounded-xl text-center">
          <p className="text-xl font-bold text-text-primary">
            {trip.days.reduce((sum, d) => sum + d.places.length, 0) > 0
              ? Math.ceil(trip.days.reduce((sum, d) => sum + d.places.length, 0) * 1.5)
              : 0}
          </p>
          <p className="text-xs text-text-secondary mt-0.5">Est. hrs</p>
        </div>
      </div>

      {/* Days */}
      <div className="space-y-4 mb-4">
        {trip.days.length === 0 ? (
          <EmptyState
            icon={<CalendarDays className="w-6 h-6" />}
            title="No days added yet"
            description="Add days to your itinerary to start planning your trip."
          />
        ) : (
          trip.days.map((day) => (
            <DayPlan
              key={day.id}
              day={day}
              tripId={trip.id}
              onRemovePlace={(dayId, tripPlaceId) => removePlaceFromDay(trip.id, dayId, tripPlaceId)}
              onReorderPlaces={(dayId, from, to) => reorderPlaces(trip.id, dayId, from, to)}
              onRemoveDay={(dayId) => removeDay(trip.id, dayId)}
            />
          ))
        )}
      </div>

      {/* Add day */}
      {addingDay ? (
        <div className="flex items-center gap-2 p-3 bg-surface border border-border rounded-xl">
          <input
            type="date"
            value={newDayDate}
            onChange={(e) => setNewDayDate(e.target.value)}
            className="flex-1 text-sm text-text-primary bg-transparent focus:outline-none"
          />
          <Button variant="primary" size="sm" onClick={handleAddDay} disabled={!newDayDate}>
            Add
          </Button>
          <Button variant="ghost" size="sm" onClick={() => setAddingDay(false)}>
            Cancel
          </Button>
        </div>
      ) : (
        <Button
          variant="secondary"
          size="md"
          icon={<Plus className="w-4 h-4" />}
          className="w-full"
          onClick={() => setAddingDay(true)}
        >
          Add Day
        </Button>
      )}
    </div>
  );
}

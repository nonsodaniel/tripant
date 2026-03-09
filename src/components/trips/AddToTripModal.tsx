"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { X, MapPin, Check, Plus, ChevronDown, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useTripsStore } from "@/lib/store/useTripsStore";
import type { Place } from "@/types";

interface AddToTripModalProps {
  place: Place;
  onClose: () => void;
}

export function AddToTripModal({ place, onClose }: AddToTripModalProps) {
  const router = useRouter();
  const { trips, addPlaceToDay } = useTripsStore();
  const [selectedTripId, setSelectedTripId] = useState<string | null>(
    trips.length === 1 ? trips[0].id : null
  );
  const [selectedDayId, setSelectedDayId] = useState<string | null>(null);
  const [added, setAdded] = useState(false);

  const selectedTrip = trips.find((t) => t.id === selectedTripId);

  function handleAdd() {
    if (!selectedTripId || !selectedDayId) return;
    addPlaceToDay(selectedTripId, selectedDayId, place);
    setAdded(true);
    setTimeout(onClose, 1200);
  }

  if (trips.length === 0) {
    return (
      <ModalShell onClose={onClose}>
        <div className="text-center py-6">
          <MapPin className="w-8 h-8 text-text-tertiary mx-auto mb-3" />
          <p className="font-medium text-text-primary mb-1">No trips yet</p>
          <p className="text-sm text-text-secondary mb-4">Create a trip first to add places.</p>
          <Button
            variant="primary"
            size="sm"
            icon={<Plus className="w-4 h-4" />}
            onClick={() => { onClose(); router.push("/trips/new"); }}
          >
            Create a Trip
          </Button>
        </div>
      </ModalShell>
    );
  }

  return (
    <ModalShell onClose={onClose}>
      {added ? (
        <div className="text-center py-6">
          <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-3">
            <Check className="w-5 h-5 text-green-600" />
          </div>
          <p className="font-medium text-text-primary">Added to trip!</p>
        </div>
      ) : (
        <>
          <div className="flex items-start justify-between gap-3 mb-4">
            <div className="flex-1 min-w-0">
              <p className="text-xs text-text-tertiary uppercase tracking-wide mb-1">Adding</p>
              <p className="font-semibold text-text-primary truncate">{place.name}</p>
            </div>
          </div>

          {/* Trip selector */}
          <div className="mb-4">
            <p className="text-xs font-medium text-text-tertiary uppercase tracking-wide mb-2">
              Select trip
            </p>
            <div className="space-y-1.5">
              {trips.map((trip) => (
                <button
                  key={trip.id}
                  onClick={() => {
                    setSelectedTripId(trip.id);
                    setSelectedDayId(null);
                  }}
                  className={`w-full flex items-center gap-3 p-3 rounded-xl border transition-all duration-150 text-left ${
                    selectedTripId === trip.id
                      ? "border-accent bg-accent-light"
                      : "border-border bg-surface hover:bg-surface-secondary"
                  }`}
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-text-primary truncate">{trip.name}</p>
                    <p className="text-xs text-text-secondary">{trip.destination}</p>
                  </div>
                  {selectedTripId === trip.id ? (
                    <ChevronDown className="w-4 h-4 text-accent flex-shrink-0" />
                  ) : (
                    <ChevronRight className="w-4 h-4 text-text-tertiary flex-shrink-0" />
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Day selector */}
          {selectedTrip && (
            <div className="mb-5">
              <p className="text-xs font-medium text-text-tertiary uppercase tracking-wide mb-2">
                Select day
              </p>
              {selectedTrip.days.length === 0 ? (
                <p className="text-sm text-text-secondary text-center py-3 bg-surface-secondary rounded-xl">
                  No days in this trip yet.{" "}
                  <button
                    onClick={() => { onClose(); router.push(`/trips/${selectedTripId}`); }}
                    className="text-accent underline"
                  >
                    Add days first
                  </button>
                </p>
              ) : (
                <div className="space-y-1.5">
                  {selectedTrip.days.map((day) => (
                    <button
                      key={day.id}
                      onClick={() => setSelectedDayId(day.id)}
                      className={`w-full flex items-center justify-between gap-3 p-3 rounded-xl border transition-all duration-150 ${
                        selectedDayId === day.id
                          ? "border-accent bg-accent-light"
                          : "border-border bg-surface hover:bg-surface-secondary"
                      }`}
                    >
                      <div className="text-left">
                        <p className="text-sm font-medium text-text-primary">Day {day.dayNumber}</p>
                        <p className="text-xs text-text-secondary">
                          {day.places.length} stop{day.places.length !== 1 ? "s" : ""}
                        </p>
                      </div>
                      {selectedDayId === day.id && (
                        <Check className="w-4 h-4 text-accent flex-shrink-0" />
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          <Button
            variant="primary"
            className="w-full"
            disabled={!selectedTripId || !selectedDayId}
            onClick={handleAdd}
          >
            Add to Itinerary
          </Button>
        </>
      )}
    </ModalShell>
  );
}

function ModalShell({ children, onClose }: { children: React.ReactNode; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-[2px]"
        onClick={onClose}
      />
      {/* Sheet */}
      <div className="relative z-10 w-full sm:max-w-md bg-surface rounded-t-3xl sm:rounded-2xl border border-border shadow-xl p-5 animate-slide-up">
        <div className="flex items-center justify-between mb-4">
          <p className="font-semibold text-text-primary">Add to Trip</p>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-surface-secondary text-text-tertiary transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

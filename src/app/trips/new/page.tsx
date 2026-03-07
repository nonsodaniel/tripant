"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, MapPin, Calendar } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useTripsStore } from "@/lib/store/useTripsStore";

export default function NewTripPage() {
  const router = useRouter();
  const { createTrip } = useTripsStore();

  const [name, setName] = useState("");
  const [destination, setDestination] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || !destination.trim()) return;
    setSubmitting(true);
    const trip = createTrip({ name: name.trim(), destination: destination.trim() });
    if (startDate || endDate) {
      const { useTripsStore: store } = await import("@/lib/store/useTripsStore");
      store.getState().updateTrip(trip.id, {
        startDate: startDate || undefined,
        endDate: endDate || undefined,
      });
    }
    router.push(`/trips/${trip.id}`);
  }

  return (
    <div className="max-w-lg mx-auto px-4 py-6">
      <div className="flex items-center gap-3 mb-6">
        <button
          onClick={() => router.back()}
          className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-surface-secondary transition-colors duration-150"
        >
          <ArrowLeft className="w-5 h-5 text-text-primary" />
        </button>
        <h1 className="text-xl font-bold text-text-primary">New Trip</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="bg-surface border border-border rounded-2xl p-5 space-y-4">
          <Input
            label="Trip Name"
            placeholder="Summer in Paris, Weekend Getaway…"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
          <Input
            label="Destination"
            placeholder="City or country"
            icon={<MapPin className="w-4 h-4" />}
            value={destination}
            onChange={(e) => setDestination(e.target.value)}
            required
          />
        </div>

        <div className="bg-surface border border-border rounded-2xl p-5 space-y-4">
          <h2 className="text-sm font-semibold text-text-primary flex items-center gap-2">
            <Calendar className="w-4 h-4 text-text-tertiary" />
            Travel Dates
            <span className="text-xs font-normal text-text-tertiary">(optional)</span>
          </h2>
          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Start Date"
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
            <Input
              label="End Date"
              type="date"
              value={endDate}
              min={startDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </div>
        </div>

        <Button
          type="submit"
          variant="primary"
          size="lg"
          loading={submitting}
          className="w-full"
          disabled={!name.trim() || !destination.trim()}
        >
          Create Trip
        </Button>
      </form>
    </div>
  );
}

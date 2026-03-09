"use client";

import { use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  MapPin,
  Clock,
  Phone,
  Globe,
  Star,
  Bookmark,
  BookmarkCheck,
  Navigation,
  Share2,
  Plus,
} from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { PlaceDetailSkeleton } from "@/components/ui/Skeleton";
import { PlaceImage } from "@/components/ui/PlaceImage";
import { AddToTripModal } from "@/components/trips/AddToTripModal";
import { useSavedStore } from "@/lib/store/useSavedStore";
import { useLocationStore } from "@/lib/store/useLocationStore";
import type { Place } from "@/types";
import { CATEGORY_LABELS } from "@/types";
import { formatDistance } from "@/lib/utils/distance";
import { MapView } from "@/components/map/MapView";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function PlaceDetailPage({ params }: PageProps) {
  const { id } = use(params);
  const router = useRouter();
  const placeId = decodeURIComponent(id);

  const [place, setPlace] = useState<Place | null>(null);
  const [nearbyPlaces, setNearbyPlaces] = useState<Place[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAddToTrip, setShowAddToTrip] = useState(false);

  const { coordinates } = useLocationStore();
  const { isPlaceSaved, savePlace, unsavePlace, addToHistory } = useSavedStore();
  const saved = place ? isPlaceSaved(place.id) : false;

  useEffect(() => {
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`/api/places/${encodeURIComponent(placeId)}`);
        if (res.status === 503) throw new Error("Service temporarily unavailable. Please retry.");
        if (res.status === 404) throw new Error("Place not found");
        if (!res.ok) throw new Error("Failed to load place details");
        const data: Place = await res.json();
        setPlace(data);
        addToHistory({ type: "view", placeId: data.id, placeName: data.name });

        if (data.coordinates) {
          const nearby = await fetch(
            `/api/places?lat=${data.coordinates.lat}&lon=${data.coordinates.lon}&radius=1000`
          );
          if (nearby.ok) {
            const nearbyData = await nearby.json();
            if (Array.isArray(nearbyData)) {
              setNearbyPlaces(nearbyData.filter((p: Place) => p.id !== data.id).slice(0, 6));
            }
          }
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load place");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [placeId]);

  if (loading) return <PlaceDetailSkeleton />;

  if (error || !place) {
    const isRetryable = error?.includes("temporarily") || error?.includes("retry");
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] px-4 gap-3">
        <p className="text-text-secondary text-center">{error || "Place not found"}</p>
        <div className="flex gap-2">
          {isRetryable && (
            <Button variant="primary" onClick={() => window.location.reload()}>Retry</Button>
          )}
          <Button variant="secondary" onClick={() => router.back()}>Go back</Button>
        </div>
      </div>
    );
  }

  function handleShare() {
    if (navigator.share) {
      navigator.share({ title: place!.name, url: window.location.href });
    } else {
      navigator.clipboard.writeText(window.location.href);
    }
  }

  return (
    <>
    {showAddToTrip && (
      <AddToTripModal place={place} onClose={() => setShowAddToTrip(false)} />
    )}
    <div className="max-w-3xl mx-auto animate-fade-in">
      {/* Header */}
      <div className="sticky top-0 lg:top-14 z-30 bg-surface border-b border-border px-4 h-14 flex items-center gap-3">
        <button
          onClick={() => router.back()}
          className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-surface-secondary active:scale-90 transition-all duration-150"
        >
          <ArrowLeft className="w-5 h-5 text-text-primary" />
        </button>
        <p className="font-semibold text-text-primary flex-1 truncate">{place.name}</p>
        <button
          onClick={handleShare}
          className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-surface-secondary active:scale-90 transition-all duration-150 text-text-secondary"
        >
          <Share2 className="w-4 h-4" />
        </button>
        <button
          onClick={() => saved ? unsavePlace(place.id) : savePlace(place)}
          className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-surface-secondary active:scale-90 transition-all duration-150"
          aria-label={saved ? "Unsave" : "Save"}
        >
          {saved ? (
            <BookmarkCheck className="w-4 h-4 text-accent" />
          ) : (
            <Bookmark className="w-4 h-4 text-text-secondary" />
          )}
        </button>
      </div>

      {/* Hero image */}
      <PlaceImage
        name={place.name}
        category={place.category}
        className="h-52 sm:h-64 w-full"
        emojiClassName="text-5xl"
      />

      <div className="px-4 py-5 space-y-6 animate-slide-up">
        {/* Title section */}
        <div>
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1">
              <h1 className="text-xl font-bold text-text-primary">{place.name}</h1>
              <div className="flex flex-wrap items-center gap-2 mt-2">
                <Badge variant="accent">{CATEGORY_LABELS[place.category]}</Badge>
                {place.distance !== undefined && (
                  <span className="flex items-center gap-1 text-sm text-text-secondary">
                    <MapPin className="w-3.5 h-3.5" />
                    {formatDistance(place.distance)} away
                  </span>
                )}
                {place.rating && (
                  <span className="flex items-center gap-1 text-sm text-text-secondary">
                    <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                    {place.rating.toFixed(1)}
                    {place.reviewCount && (
                      <span className="text-text-tertiary">({place.reviewCount})</span>
                    )}
                  </span>
                )}
              </div>
            </div>
          </div>

          {place.description && (
            <p className="text-sm text-text-secondary mt-3 leading-relaxed">{place.description}</p>
          )}
        </div>

        {/* Info cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {place.address && (
            <InfoRow icon={<MapPin className="w-4 h-4" />} label="Address" value={place.address} />
          )}
          {place.openingHours?.text && (
            <InfoRow icon={<Clock className="w-4 h-4" />} label="Hours" value={place.openingHours.text} />
          )}
          {place.phone && (
            <InfoRow icon={<Phone className="w-4 h-4" />} label="Phone" value={place.phone} link={`tel:${place.phone}`} />
          )}
          {place.website && (
            <InfoRow icon={<Globe className="w-4 h-4" />} label="Website" value={new URL(place.website).hostname} link={place.website} />
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <Button
            variant="primary"
            className="flex-1"
            icon={<Navigation className="w-4 h-4" />}
            onClick={() => {
              const url = `https://www.openstreetmap.org/directions?to=${place.coordinates.lat},${place.coordinates.lon}`;
              window.open(url, "_blank");
            }}
          >
            Directions
          </Button>
          <Button
            variant="secondary"
            icon={<Plus className="w-4 h-4" />}
            onClick={() => setShowAddToTrip(true)}
          >
            Add to Trip
          </Button>
        </div>

        {/* Map */}
        {place.coordinates && (
          <section>
            <h2 className="text-base font-semibold text-text-primary mb-3">Location</h2>
            <div className="h-48 rounded-2xl overflow-hidden border border-border">
              <MapView
                center={place.coordinates}
                zoom={16}
                places={[place]}
                userCoords={coordinates || undefined}
                className="w-full h-full"
              />
            </div>
          </section>
        )}

        {/* Nearby */}
        {nearbyPlaces.length > 0 && (
          <section>
            <h2 className="text-base font-semibold text-text-primary mb-3">Nearby</h2>
            <div className="space-y-2 stagger">
              {nearbyPlaces.map((nearby) => (
                <a
                  key={nearby.id}
                  href={`/place/${encodeURIComponent(nearby.id)}`}
                  className="flex items-center gap-3 p-3 bg-surface border border-border rounded-xl hover:shadow-card-hover hover:border-border-strong active:scale-[0.98] transition-all duration-150"
                >
                  <PlaceImage
                    name={nearby.name}
                    category={nearby.category}
                    className="w-10 h-10 rounded-lg flex-shrink-0"
                    emojiClassName="text-sm"
                    fetchPhoto={false}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-text-primary truncate">{nearby.name}</p>
                    <p className="text-xs text-text-secondary">{CATEGORY_LABELS[nearby.category]}</p>
                  </div>
                  {nearby.distance !== undefined && (
                    <span className="text-xs text-text-tertiary flex-shrink-0">{formatDistance(nearby.distance)}</span>
                  )}
                </a>
              ))}
            </div>
          </section>
        )}

        {/* OSM tags for transparency */}
        {place.tags && Object.keys(place.tags).filter(k => k !== "name").length > 0 && (
          <section>
            <h2 className="text-base font-semibold text-text-primary mb-3">Details</h2>
            <div className="flex flex-wrap gap-2">
              {Object.entries(place.tags)
                .filter(([k]) => !["name", "source"].includes(k))
                .slice(0, 12)
                .map(([k, v]) => (
                  <span key={k} className="text-xs bg-surface-secondary border border-border rounded-lg px-2 py-1">
                    <span className="text-text-tertiary">{k}: </span>
                    <span className="text-text-primary">{v}</span>
                  </span>
                ))}
            </div>
          </section>
        )}
      </div>
    </div>
    </>
  );
}

function InfoRow({
  icon,
  label,
  value,
  link,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  link?: string;
}) {
  const content = (
    <div className="flex items-start gap-2.5 p-3 bg-surface-secondary rounded-xl">
      <span className="text-text-tertiary flex-shrink-0 mt-0.5">{icon}</span>
      <div className="min-w-0">
        <p className="text-xs text-text-tertiary">{label}</p>
        <p className="text-sm text-text-primary mt-0.5 truncate">{value}</p>
      </div>
    </div>
  );

  if (link) {
    return (
      <a href={link} target="_blank" rel="noopener noreferrer" className="block hover:opacity-80 transition-opacity">
        {content}
      </a>
    );
  }
  return content;
}

function getCategoryEmoji(category: string): string {
  const map: Record<string, string> = {
    food: "🍽️", attraction: "🎭", museum: "🏛️", park: "🌳",
    landmark: "🗿", nightlife: "🌙", shopping: "🛍️", transport: "🚆",
    hotel: "🏨", event: "🎪", hidden_gem: "💎", nature: "🌿",
    sport: "⚽", healthcare: "🏥", other: "📍",
  };
  return map[category] || "📍";
}

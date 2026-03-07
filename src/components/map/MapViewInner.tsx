"use client";

import { useEffect, useRef } from "react";
import { MapContainer, TileLayer, Marker, Popup, Circle, useMap, ZoomControl } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import type { Place, Coordinates } from "@/types";
import { formatDistance } from "@/lib/utils/distance";
import Link from "next/link";

// Fix Leaflet default icon
if (typeof window !== "undefined") {
  delete (L.Icon.Default.prototype as unknown as Record<string, unknown>)._getIconUrl;
  L.Icon.Default.mergeOptions({
    iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
    iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
    shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  });
}

function createPlaceIcon(category: string) {
  const colors: Record<string, string> = {
    food: "#F59E0B",
    attraction: "#2563EB",
    museum: "#7C3AED",
    park: "#16A34A",
    landmark: "#DC2626",
    nightlife: "#DB2777",
    shopping: "#EA580C",
    transport: "#0891B2",
    hotel: "#059669",
    event: "#9333EA",
    hidden_gem: "#CA8A04",
    nature: "#15803D",
    sport: "#1D4ED8",
    healthcare: "#DC2626",
    other: "#6B7280",
  };
  const color = colors[category] || "#6B7280";
  return L.divIcon({
    html: `<div style="width:12px;height:12px;background:${color};border:2px solid white;border-radius:50%;box-shadow:0 1px 3px rgba(0,0,0,0.3)"></div>`,
    className: "",
    iconSize: [12, 12],
    iconAnchor: [6, 6],
  });
}

function createUserIcon() {
  return L.divIcon({
    html: `<div style="width:14px;height:14px;background:#2563EB;border:3px solid white;border-radius:50%;box-shadow:0 0 0 4px rgba(37,99,235,0.2)"></div>`,
    className: "",
    iconSize: [14, 14],
    iconAnchor: [7, 7],
  });
}

function FlyToLocation({ center }: { center: Coordinates }) {
  const map = useMap();
  useEffect(() => {
    map.flyTo([center.lat, center.lon], map.getZoom(), { duration: 1 });
  }, [center.lat, center.lon, map]);
  return null;
}

export interface MapViewProps {
  center: Coordinates;
  zoom?: number;
  places?: Place[];
  userCoords?: Coordinates;
  showRadius?: boolean;
  radius?: number;
  onPlaceClick?: (place: Place) => void;
  className?: string;
}

export function MapViewInner({
  center,
  zoom = 14,
  places = [],
  userCoords,
  showRadius = false,
  radius = 2000,
  onPlaceClick,
  className = "w-full h-full",
}: MapViewProps) {
  const mapRef = useRef<L.Map | null>(null);

  return (
    <MapContainer
      center={[center.lat, center.lon]}
      zoom={zoom}
      className={className}
      ref={mapRef}
      zoomControl={false}
      style={{ background: "#f8f9fa" }}
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        maxZoom={19}
      />
      <ZoomControl position="bottomright" />
      <FlyToLocation center={center} />

      {userCoords && (
        <>
          <Marker position={[userCoords.lat, userCoords.lon]} icon={createUserIcon()}>
            <Popup closeButton={false}>
              <p className="text-xs font-medium text-text-primary">You are here</p>
            </Popup>
          </Marker>
          {showRadius && (
            <Circle
              center={[userCoords.lat, userCoords.lon]}
              radius={radius}
              pathOptions={{ color: "#2563EB", fillColor: "#2563EB", fillOpacity: 0.04, weight: 1, dashArray: "4,4" }}
            />
          )}
        </>
      )}

      {places.map((place) => (
        <Marker
          key={place.id}
          position={[place.coordinates.lat, place.coordinates.lon]}
          icon={createPlaceIcon(place.category)}
          eventHandlers={{
            click: () => onPlaceClick?.(place),
          }}
        >
          <Popup closeButton={false} className="tripant-popup">
            <div className="min-w-[160px]">
              <p className="font-medium text-sm text-text-primary mb-0.5">{place.name}</p>
              {place.address && (
                <p className="text-xs text-text-secondary mb-1 line-clamp-1">{place.address}</p>
              )}
              {place.distance !== undefined && (
                <p className="text-xs text-accent font-medium">{formatDistance(place.distance)} away</p>
              )}
              <Link
                href={`/place/${encodeURIComponent(place.id)}`}
                className="mt-1.5 block text-xs font-medium text-accent hover:underline"
              >
                View details →
              </Link>
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}

export default MapViewInner;

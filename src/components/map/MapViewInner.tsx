"use client";

import { useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup, Circle, useMap, ZoomControl } from "react-leaflet";
import L from "leaflet";
// CSS is imported globally in globals.css — do NOT import it here
import type { Place, Coordinates } from "@/types";
import { formatDistance } from "@/lib/utils/distance";
import Link from "next/link";

// Fix Leaflet default marker icons broken by webpack
if (typeof window !== "undefined") {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  delete (L.Icon.Default.prototype as any)._getIconUrl;
  L.Icon.Default.mergeOptions({
    iconRetinaUrl: "/leaflet/marker-icon-2x.png",
    iconUrl: "/leaflet/marker-icon.png",
    shadowUrl: "/leaflet/marker-shadow.png",
  });
}

const CATEGORY_COLORS: Record<string, string> = {
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

function createPlaceIcon(category: string) {
  const color = CATEGORY_COLORS[category] ?? "#6B7280";
  return L.divIcon({
    html: `<div style="width:14px;height:14px;background:${color};border:2.5px solid white;border-radius:50%;box-shadow:0 1px 4px rgba(0,0,0,0.35)"></div>`,
    className: "",
    iconSize: [14, 14],
    iconAnchor: [7, 7],
  });
}

function createUserIcon() {
  return L.divIcon({
    html: `<div style="width:16px;height:16px;background:#2563EB;border:3px solid white;border-radius:50%;box-shadow:0 0 0 5px rgba(37,99,235,0.18)"></div>`,
    className: "",
    iconSize: [16, 16],
    iconAnchor: [8, 8],
  });
}

// Fly to a new center whenever it changes
function FlyToCenter({ center }: { center: Coordinates }) {
  const map = useMap();
  useEffect(() => {
    map.flyTo([center.lat, center.lon], map.getZoom(), { duration: 0.8, easeLinearity: 0.5 });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [center.lat, center.lon]);
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
  return (
    <MapContainer
      center={[center.lat, center.lon]}
      zoom={zoom}
      className={className}
      zoomControl={false}
      style={{ background: "#f0f0f0" }}
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        maxZoom={19}
      />
      <ZoomControl position="bottomright" />
      <FlyToCenter center={center} />

      {userCoords && (
        <>
          <Marker position={[userCoords.lat, userCoords.lon]} icon={createUserIcon()}>
            <Popup closeButton={false}>
              <p style={{ margin: 0, fontSize: 12, fontWeight: 600 }}>You are here</p>
            </Popup>
          </Marker>
          {showRadius && (
            <Circle
              center={[userCoords.lat, userCoords.lon]}
              radius={radius}
              pathOptions={{
                color: "#2563EB",
                fillColor: "#2563EB",
                fillOpacity: 0.05,
                weight: 1.5,
                dashArray: "5,5",
              }}
            />
          )}
        </>
      )}

      {places.map((place) => (
        <Marker
          key={place.id}
          position={[place.coordinates.lat, place.coordinates.lon]}
          icon={createPlaceIcon(place.category)}
          eventHandlers={{ click: () => onPlaceClick?.(place) }}
        >
          <Popup closeButton={false}>
            <div style={{ minWidth: 160 }}>
              <p style={{ margin: "0 0 2px", fontSize: 13, fontWeight: 600 }}>{place.name}</p>
              {place.address && (
                <p style={{ margin: "0 0 4px", fontSize: 11, color: "#6B7280", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {place.address}
                </p>
              )}
              {place.distance !== undefined && (
                <p style={{ margin: "0 0 4px", fontSize: 11, color: "#2563EB", fontWeight: 500 }}>
                  {formatDistance(place.distance)} away
                </p>
              )}
              <a
                href={`/place/${encodeURIComponent(place.id)}`}
                style={{ fontSize: 11, fontWeight: 600, color: "#2563EB", textDecoration: "none" }}
              >
                View details →
              </a>
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}

export default MapViewInner;

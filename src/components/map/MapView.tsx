"use client";

/**
 * Re-exports MapViewInner as a dynamic (ssr:false) import.
 * Always use this file when importing from pages/components —
 * never import MapViewInner directly (leaflet crashes on the server).
 */
import dynamic from "next/dynamic";
import type { MapViewProps } from "./MapViewInner";
import { Spinner } from "@/components/ui/Spinner";

const MapViewInner = dynamic(
  () => import("./MapViewInner").then((m) => m.MapViewInner),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-full bg-surface-secondary flex items-center justify-center">
        <Spinner size="md" />
      </div>
    ),
  }
);

export function MapView(props: MapViewProps) {
  return <MapViewInner {...props} />;
}

"use client";

import dynamic from "next/dynamic";

const MapViewInner = dynamic(() => import("./MapViewInner"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full bg-surface-secondary animate-pulse flex items-center justify-center">
      <span className="text-sm text-text-tertiary">Loading map…</span>
    </div>
  ),
});

export { MapViewInner as default };
export * from "./MapViewInner";

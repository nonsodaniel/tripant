"use client";

import { useState, useEffect, useRef } from "react";
import { X, Navigation, MapPin, Search, Loader2, Check } from "lucide-react";
import { useLocationStore } from "@/lib/store/useLocationStore";
import { useGeolocation } from "@/lib/hooks/useGeolocation";
import type { SearchResult } from "@/types";

const POPULAR_CITIES = [
  { name: "London",    country: "UK",          lat: 51.5074,  lon: -0.1278  },
  { name: "Paris",     country: "France",      lat: 48.8566,  lon: 2.3522   },
  { name: "New York",  country: "USA",         lat: 40.7128,  lon: -74.0060 },
  { name: "Tokyo",     country: "Japan",       lat: 35.6762,  lon: 139.6503 },
  { name: "Dubai",     country: "UAE",         lat: 25.2048,  lon: 55.2708  },
  { name: "Sydney",    country: "Australia",   lat: -33.8688, lon: 151.2093 },
  { name: "Barcelona", country: "Spain",       lat: 41.3851,  lon: 2.1734   },
  { name: "Amsterdam", country: "Netherlands", lat: 52.3676,  lon: 4.9041   },
  { name: "Rome",      country: "Italy",       lat: 41.9028,  lon: 12.4964  },
  { name: "Singapore", country: "Singapore",   lat: 1.3521,   lon: 103.8198 },
  { name: "Lagos",     country: "Nigeria",     lat: 6.5244,   lon: 3.3792   },
  { name: "Nairobi",   country: "Kenya",       lat: -1.2921,  lon: 36.8219  },
];

export function LocationPicker() {
  const {
    locationPickerOpen,
    closeLocationPicker,
    setCoordinates,
    setCityInfo,
    isLocating,
    city: currentCity,
  } = useLocationStore();
  const { locate } = useGeolocation();

  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [justSelected, setJustSelected] = useState<string | null>(null);
  const searchTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Reset and focus when opened
  useEffect(() => {
    if (locationPickerOpen) {
      setQuery("");
      setResults([]);
      setJustSelected(null);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [locationPickerOpen]);

  // Close on Escape
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") closeLocationPicker();
    }
    if (locationPickerOpen) document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [locationPickerOpen, closeLocationPicker]);

  // Debounced search via API
  useEffect(() => {
    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
    if (!query.trim() || query.length < 2) {
      setResults([]);
      setSearching(false);
      return;
    }
    setSearching(true);
    searchTimeoutRef.current = setTimeout(async () => {
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
        if (res.ok) {
          const data = await res.json();
          setResults(Array.isArray(data) ? data.slice(0, 8) : []);
        }
      } catch {
        // silent
      } finally {
        setSearching(false);
      }
    }, 300);
    return () => {
      if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
    };
  }, [query]);

  function pickLocation(name: string, country: string | undefined, lat: number, lon: number) {
    setJustSelected(name);
    setCoordinates({ lat, lon });
    setCityInfo({ city: name, country });
    setTimeout(() => closeLocationPicker(), 300);
  }

  function selectResult(result: SearchResult) {
    const countryPart = result.address?.split(",").pop()?.trim();
    pickLocation(result.name, countryPart, result.coordinates.lat, result.coordinates.lon);
  }

  function selectPopularCity(c: typeof POPULAR_CITIES[0]) {
    pickLocation(c.name, c.country, c.lat, c.lon);
  }

  function handleAutoDetect() {
    locate();
    closeLocationPicker();
  }

  if (!locationPickerOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/40 z-[500] animate-fade-in"
        onClick={closeLocationPicker}
      />

      {/* Sheet — slides up on mobile, centered on desktop */}
      <div
        className="fixed inset-x-0 bottom-0 sm:inset-auto sm:top-1/2 sm:left-1/2 sm:-translate-x-1/2 sm:-translate-y-1/2
                   z-[501] bg-surface rounded-t-2xl sm:rounded-2xl shadow-elevated sm:w-full sm:max-w-md
                   animate-slide-up overflow-hidden"
      >
        {/* Drag handle (mobile) */}
        <div className="flex justify-center pt-3 pb-1 sm:hidden">
          <div className="w-8 h-1 bg-border-strong rounded-full" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-5 pt-3 sm:pt-5 pb-4 border-b border-border">
          <div>
            <h2 className="font-semibold text-text-primary">Change Location</h2>
            <p className="text-xs text-text-secondary mt-0.5">
              {currentCity ? `Currently: ${currentCity}` : "Search a city or use GPS"}
            </p>
          </div>
          <button
            onClick={closeLocationPicker}
            className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-surface-secondary transition-colors duration-150 text-text-tertiary"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-4 space-y-4 max-h-[70vh] overflow-y-auto">
          {/* Search input */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-tertiary pointer-events-none" />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search city or region…"
              className="w-full h-11 pl-10 pr-10 bg-surface-secondary border border-border rounded-xl text-sm
                         text-text-primary placeholder:text-text-tertiary focus:outline-none
                         focus:ring-2 focus:ring-accent focus:border-transparent transition-all duration-150"
            />
            {searching && (
              <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-tertiary animate-spin pointer-events-none" />
            )}
            {query && !searching && (
              <button
                onClick={() => { setQuery(""); setResults([]); }}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-text-tertiary hover:text-text-secondary"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Search results */}
          {results.length > 0 && (
            <div className="space-y-0.5">
              {results.map((result) => {
                const isSelected = justSelected === result.name;
                return (
                  <button
                    key={result.id}
                    onClick={() => selectResult(result)}
                    className="w-full flex items-start gap-3 px-3 py-2.5 rounded-xl hover:bg-surface-secondary
                               active:scale-[0.99] transition-all duration-150 text-left"
                  >
                    {isSelected ? (
                      <Check className="w-4 h-4 text-accent flex-shrink-0 mt-0.5" />
                    ) : (
                      <MapPin className="w-4 h-4 text-text-tertiary flex-shrink-0 mt-0.5" />
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-text-primary truncate">{result.name}</p>
                      {result.address && (
                        <p className="text-xs text-text-tertiary truncate mt-0.5">
                          {result.address.split(",").slice(0, 3).join(",")}
                        </p>
                      )}
                    </div>
                    <span className="text-xs text-text-tertiary capitalize flex-shrink-0 mt-0.5">
                      {result.type}
                    </span>
                  </button>
                );
              })}
            </div>
          )}

          {/* No results message */}
          {query.length >= 2 && !searching && results.length === 0 && (
            <p className="text-sm text-text-tertiary text-center py-3">
              No results for &ldquo;{query}&rdquo;
            </p>
          )}

          {/* Auto-detect + popular cities (shown when not searching) */}
          {!query && (
            <>
              {/* GPS button */}
              <button
                onClick={handleAutoDetect}
                disabled={isLocating}
                className="w-full flex items-center gap-3 p-3.5 bg-accent-light border border-accent/20 rounded-xl
                           hover:bg-accent-light/80 active:scale-[0.99] transition-all duration-150 disabled:opacity-60"
              >
                {isLocating ? (
                  <Loader2 className="w-5 h-5 text-accent animate-spin flex-shrink-0" />
                ) : (
                  <Navigation className="w-5 h-5 text-accent flex-shrink-0" />
                )}
                <div className="text-left">
                  <p className="text-sm font-medium text-accent">
                    {isLocating ? "Detecting location…" : "Use my current location"}
                  </p>
                  <p className="text-xs text-text-secondary mt-0.5">GPS-based detection</p>
                </div>
              </button>

              {/* Popular cities */}
              <div>
                <p className="text-xs font-medium text-text-tertiary mb-2.5 uppercase tracking-wide">
                  Popular Cities
                </p>
                <div className="grid grid-cols-2 gap-2">
                  {POPULAR_CITIES.map((c) => {
                    const isSelected = justSelected === c.name;
                    return (
                      <button
                        key={c.name}
                        onClick={() => selectPopularCity(c)}
                        className={`flex items-center gap-2 p-2.5 rounded-xl border text-left
                                   active:scale-[0.97] transition-all duration-150
                                   ${currentCity === c.name
                                     ? "border-accent bg-accent-light"
                                     : "border-border bg-surface-secondary hover:border-accent hover:bg-accent-light"
                                   }`}
                      >
                        {isSelected ? (
                          <Check className="w-3.5 h-3.5 text-accent flex-shrink-0" />
                        ) : (
                          <MapPin className="w-3.5 h-3.5 text-text-tertiary flex-shrink-0" />
                        )}
                        <div className="min-w-0">
                          <p className="text-xs font-medium text-text-primary truncate">{c.name}</p>
                          <p className="text-[10px] text-text-tertiary">{c.country}</p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
}

"use client";

import { useEffect, useCallback, useRef } from "react";
import { useLocationStore } from "@/lib/store/useLocationStore";
import { reverseGeocode } from "@/lib/api/nominatim";

export function useGeolocation() {
  const {
    coordinates,
    city,
    permissionStatus,
    isLocating,
    setCoordinates,
    setCityInfo,
    setPermissionStatus,
    setIsLocating,
  } = useLocationStore();

  // Track whether we've already initiated a locate on this mount
  const didLocate = useRef(false);

  const locate = useCallback(() => {
    if (!navigator.geolocation) {
      setPermissionStatus("denied");
      return;
    }

    setIsLocating(true);

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const coords = {
          lat: position.coords.latitude,
          lon: position.coords.longitude,
        };
        setCoordinates(coords);
        setPermissionStatus("granted");

        try {
          const info = await reverseGeocode(coords);
          if (info) setCityInfo(info);
        } catch {
          // silent — city name is cosmetic
        } finally {
          setIsLocating(false);
        }
      },
      (error) => {
        setIsLocating(false);
        if (error.code === error.PERMISSION_DENIED) {
          setPermissionStatus("denied");
        } else {
          // POSITION_UNAVAILABLE or TIMEOUT — keep existing coords if any
          setPermissionStatus("unknown");
        }
      },
      {
        enableHighAccuracy: false, // faster on most devices; high-accuracy is slow
        timeout: 15000,
        maximumAge: 0, // always get a fresh position, never use cache
      }
    );
  }, [setCoordinates, setCityInfo, setPermissionStatus, setIsLocating]);

  // On mount: always check the Permissions API first so we can skip the slow
  // getCurrentPosition call if the user already denied, or re-use cached coords
  // only when permission is confirmed to still be granted.
  useEffect(() => {
    if (didLocate.current) return;
    didLocate.current = true;

    if (!navigator.geolocation) {
      setPermissionStatus("denied");
      return;
    }

    // Use Permissions API when available
    if (navigator.permissions) {
      navigator.permissions
        .query({ name: "geolocation" })
        .then((result) => {
          if (result.state === "denied") {
            setPermissionStatus("denied");
            return;
          }
          // "granted" or "prompt" — try to get location
          locate();

          // Re-check if the user changes permission in browser settings
          result.onchange = () => {
            if (result.state === "denied") {
              setPermissionStatus("denied");
            } else if (result.state === "granted") {
              locate();
            }
          };
        })
        .catch(() => {
          // Permissions API not fully supported; fall back
          locate();
        });
    } else {
      locate();
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return { coordinates, city, permissionStatus, isLocating, locate };
}

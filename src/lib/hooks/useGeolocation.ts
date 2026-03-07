"use client";

import { useEffect, useCallback } from "react";
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

  const locate = useCallback(async () => {
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
          // silent
        } finally {
          setIsLocating(false);
        }
      },
      (error) => {
        setIsLocating(false);
        if (error.code === error.PERMISSION_DENIED) {
          setPermissionStatus("denied");
        } else {
          setPermissionStatus("unknown");
        }
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
    );
  }, [setCoordinates, setCityInfo, setPermissionStatus, setIsLocating]);

  useEffect(() => {
    if (!coordinates) {
      locate();
    }
  }, []);

  return { coordinates, city, permissionStatus, isLocating, locate };
}

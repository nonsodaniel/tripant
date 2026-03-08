"use client";

import { useEffect, useState } from "react";
import { WifiOff, RefreshCw } from "lucide-react";

export function OfflineSplash() {
  const [offline, setOffline] = useState(false);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const handleOffline = () => {
      setOffline(true);
      setVisible(true);
    };
    const handleOnline = () => {
      setOffline(false);
      // Keep banner visible briefly so user sees "back online"
      setTimeout(() => setVisible(false), 2000);
    };

    // Check initial state
    if (typeof window !== "undefined" && !navigator.onLine) {
      setOffline(true);
      setVisible(true);
    }

    window.addEventListener("offline", handleOffline);
    window.addEventListener("online", handleOnline);
    return () => {
      window.removeEventListener("offline", handleOffline);
      window.removeEventListener("online", handleOnline);
    };
  }, []);

  if (!visible) return null;

  return (
    <div
      className={`fixed inset-x-0 bottom-16 lg:bottom-0 z-[9999] flex justify-center px-4 pb-3 transition-all duration-300 ${
        visible ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
      }`}
    >
      <div
        className={`flex items-center gap-3 px-4 py-3 rounded-2xl shadow-elevated border text-sm font-medium max-w-sm w-full ${
          offline
            ? "bg-surface border-border text-text-primary"
            : "bg-surface border-border text-accent"
        }`}
      >
        {offline ? (
          <>
            <WifiOff className="w-4 h-4 text-text-tertiary flex-shrink-0" />
            <span className="flex-1 text-text-secondary">
              No internet connection. Showing cached content.
            </span>
            <button
              onClick={() => window.location.reload()}
              className="flex items-center gap-1 text-accent hover:text-accent-dark transition-colors duration-150 flex-shrink-0"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Retry
            </button>
          </>
        ) : (
          <>
            <div className="w-2 h-2 rounded-full bg-green-500 flex-shrink-0" />
            <span className="flex-1">Back online</span>
          </>
        )}
      </div>
    </div>
  );
}

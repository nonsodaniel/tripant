"use client";

import { History, Trash2, Eye, Search, Bookmark, Briefcase, Clock } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { useSavedStore } from "@/lib/store/useSavedStore";
import { formatRelativeTime } from "@/lib/utils/format";
import Link from "next/link";
import type { ActivityHistory } from "@/types";

const TYPE_CONFIG: Record<
  ActivityHistory["type"],
  { icon: React.ReactNode; label: string; colorClass: string }
> = {
  view:        { icon: <Eye className="w-4 h-4" />,       label: "Viewed",       colorClass: "text-blue-500" },
  search:      { icon: <Search className="w-4 h-4" />,    label: "Searched",     colorClass: "text-text-tertiary" },
  save:        { icon: <Bookmark className="w-4 h-4" />,  label: "Saved",        colorClass: "text-accent" },
  trip_create: { icon: <Briefcase className="w-4 h-4" />, label: "Created trip", colorClass: "text-green-500" },
};

export default function HistoryPage() {
  const { history, recentSearches, clearHistory } = useSavedStore();

  return (
    <div className="max-w-3xl mx-auto">
      {/* Header */}
      <div className="bg-surface border-b border-border px-4 py-5">
        <div className="flex items-end justify-between">
          <div>
            <h1 className="text-2xl font-bold text-text-primary tracking-tight">History</h1>
            <p className="text-sm text-text-secondary mt-1">Your recent activity</p>
          </div>
          {history.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              icon={<Trash2 className="w-4 h-4" />}
              onClick={() => { if (confirm("Clear all history?")) clearHistory(); }}
            >
              Clear
            </Button>
          )}
        </div>
      </div>

      <div className="px-4 py-6 space-y-6">
        {/* Recent searches */}
        {recentSearches.length > 0 && (
          <section>
            <h2 className="text-sm font-semibold text-text-primary mb-3 flex items-center gap-2">
              <Clock className="w-3.5 h-3.5 text-text-tertiary" />
              Recent Searches
            </h2>
            <div className="flex flex-wrap gap-2">
              {recentSearches.map((q, i) => (
                <Link
                  key={i}
                  href={`/search?q=${encodeURIComponent(q)}`}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-surface border border-border rounded-full text-sm text-text-secondary hover:border-border-strong hover:text-text-primary active:scale-95 transition-all duration-150"
                >
                  <Search className="w-3 h-3" />
                  {q}
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* Activity feed */}
        {history.length === 0 ? (
          <EmptyState
            icon={<History className="w-6 h-6" />}
            title="No activity yet"
            description="Places you view, save, and search will appear here."
          />
        ) : (
          <section>
            <h2 className="text-sm font-semibold text-text-primary mb-3">Activity</h2>
            <div className="space-y-1 stagger">
              {history.slice(0, 100).map((entry) => {
                const config = TYPE_CONFIG[entry.type];
                return (
                  <div
                    key={entry.id}
                    className="flex items-center gap-3 p-3 bg-surface border border-border rounded-xl hover:border-border-strong transition-colors duration-150"
                  >
                    <div
                      className={`w-8 h-8 rounded-lg bg-surface-secondary flex items-center justify-center flex-shrink-0 ${config.colorClass}`}
                    >
                      {config.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-text-primary truncate">
                        {entry.type === "search"
                          ? `"${entry.query}"`
                          : entry.placeName || "Unknown"}
                      </p>
                      <p className="text-xs text-text-tertiary mt-0.5">
                        {config.label} · {formatRelativeTime(entry.timestamp)}
                      </p>
                    </div>
                    {entry.placeId && (
                      <Link
                        href={`/place/${encodeURIComponent(entry.placeId)}`}
                        className="text-xs font-medium text-accent hover:underline flex-shrink-0"
                      >
                        View
                      </Link>
                    )}
                  </div>
                );
              })}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}

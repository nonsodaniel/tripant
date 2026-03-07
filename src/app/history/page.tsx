"use client";

import { History, Trash2, Eye, Search, Bookmark, Briefcase } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { useSavedStore } from "@/lib/store/useSavedStore";
import { formatRelativeTime } from "@/lib/utils/format";
import Link from "next/link";
import type { ActivityHistory } from "@/types";

const TYPE_ICONS: Record<ActivityHistory["type"], React.ReactNode> = {
  view: <Eye className="w-4 h-4" />,
  search: <Search className="w-4 h-4" />,
  save: <Bookmark className="w-4 h-4" />,
  trip_create: <Briefcase className="w-4 h-4" />,
};

const TYPE_LABELS: Record<ActivityHistory["type"], string> = {
  view: "Viewed",
  search: "Searched",
  save: "Saved",
  trip_create: "Created trip",
};

export default function HistoryPage() {
  const { history, recentSearches, clearHistory } = useSavedStore();

  return (
    <div className="max-w-3xl mx-auto px-4 py-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-text-primary">History</h1>
          <p className="text-sm text-text-secondary mt-0.5">Your recent activity</p>
        </div>
        {history.length > 0 && (
          <Button
            variant="ghost"
            size="sm"
            icon={<Trash2 className="w-4 h-4" />}
            onClick={() => {
              if (confirm("Clear all history?")) clearHistory();
            }}
          >
            Clear
          </Button>
        )}
      </div>

      {recentSearches.length > 0 && (
        <section className="mb-6">
          <h2 className="text-sm font-semibold text-text-primary mb-3">Recent Searches</h2>
          <div className="flex flex-wrap gap-2">
            {recentSearches.map((q, i) => (
              <Link
                key={i}
                href={`/search?q=${encodeURIComponent(q)}`}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-surface border border-border rounded-full text-sm text-text-secondary hover:border-border-strong hover:text-text-primary transition-all duration-150"
              >
                <Search className="w-3 h-3" />
                {q}
              </Link>
            ))}
          </div>
        </section>
      )}

      {history.length === 0 ? (
        <EmptyState
          icon={<History className="w-6 h-6" />}
          title="No activity yet"
          description="Places you view, save, and search will appear here."
        />
      ) : (
        <section>
          <h2 className="text-sm font-semibold text-text-primary mb-3">Activity</h2>
          <div className="space-y-1">
            {history.slice(0, 100).map((entry) => (
              <div
                key={entry.id}
                className="flex items-center gap-3 p-3 bg-surface border border-border rounded-xl"
              >
                <div className="w-8 h-8 rounded-lg bg-surface-secondary flex items-center justify-center text-text-tertiary flex-shrink-0">
                  {TYPE_ICONS[entry.type]}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-text-primary truncate">
                    {entry.type === "search" ? `"${entry.query}"` : entry.placeName || "Unknown"}
                  </p>
                  <p className="text-xs text-text-tertiary mt-0.5">
                    {TYPE_LABELS[entry.type]} · {formatRelativeTime(entry.timestamp)}
                  </p>
                </div>
                {entry.placeId && (
                  <Link
                    href={`/place/${encodeURIComponent(entry.placeId)}`}
                    className="text-xs text-accent hover:underline flex-shrink-0"
                  >
                    View
                  </Link>
                )}
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

import { clsx } from "clsx";

interface SkeletonProps {
  className?: string;
}

export function Skeleton({ className }: SkeletonProps) {
  return (
    <div
      className={clsx(
        "animate-pulse rounded-lg bg-surface-tertiary",
        className
      )}
    />
  );
}

export function PlaceCardSkeleton({ horizontal = false }: { horizontal?: boolean }) {
  if (horizontal) {
    return (
      <div className="flex items-start gap-3 p-3 bg-surface border border-border rounded-xl">
        <Skeleton className="w-14 h-14 rounded-lg flex-shrink-0" />
        <div className="flex-1 min-w-0 space-y-2">
          <Skeleton className="h-3.5 w-3/4 rounded" />
          <Skeleton className="h-3 w-1/2 rounded" />
          <Skeleton className="h-3 w-1/3 rounded" />
        </div>
      </div>
    );
  }

  return (
    <div className="bg-surface border border-border rounded-2xl overflow-hidden">
      <Skeleton className="h-36 w-full rounded-none" />
      <div className="p-3 space-y-2">
        <Skeleton className="h-3 w-1/3 rounded" />
        <Skeleton className="h-4 w-2/3 rounded" />
        <Skeleton className="h-3 w-1/4 rounded" />
      </div>
    </div>
  );
}

export function PlaceDetailSkeleton() {
  return (
    <div className="max-w-3xl mx-auto animate-pulse">
      {/* Header */}
      <div className="sticky top-0 lg:top-14 z-30 bg-surface border-b border-border px-4 h-14 flex items-center gap-3">
        <Skeleton className="w-8 h-8 rounded-lg" />
        <Skeleton className="h-4 flex-1 max-w-xs rounded" />
      </div>
      {/* Hero */}
      <Skeleton className="h-52 sm:h-64 w-full rounded-none" />
      <div className="px-4 py-5 space-y-6">
        <div className="space-y-2">
          <Skeleton className="h-6 w-2/3 rounded" />
          <div className="flex gap-2">
            <Skeleton className="h-5 w-20 rounded-full" />
            <Skeleton className="h-5 w-24 rounded-full" />
          </div>
          <Skeleton className="h-3 w-full rounded" />
          <Skeleton className="h-3 w-5/6 rounded" />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Skeleton className="h-16 rounded-xl" />
          <Skeleton className="h-16 rounded-xl" />
        </div>
        <div className="flex gap-2">
          <Skeleton className="h-10 flex-1 rounded-xl" />
          <Skeleton className="h-10 w-32 rounded-xl" />
        </div>
        <Skeleton className="h-48 rounded-2xl" />
      </div>
    </div>
  );
}

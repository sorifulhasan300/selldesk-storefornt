import React from "react";

export default function ProductLoading() {
  return (
    <div
      aria-busy="true"
      aria-label="Loading product"
      className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6 space-y-10"
    >
      {/* Breadcrumb Skeleton */}
      <div className="flex items-center gap-2">
        <div className="skeleton-shimmer h-3.5 w-12 rounded" />
        <div className="skeleton-shimmer h-3.5 w-3.5 rounded-full" />
        <div className="skeleton-shimmer h-3.5 w-20 rounded" />
        <div className="skeleton-shimmer h-3.5 w-3.5 rounded-full" />
        <div className="skeleton-shimmer h-3.5 w-36 rounded" />
      </div>

      {/* Main PDP Grid Skeleton */}
      <div className="grid grid-cols-1 gap-10 lg:grid-cols-2 lg:gap-14">
        {/* Gallery Column */}
        <div className="space-y-4">
          <div className="skeleton-shimmer aspect-square w-full rounded-3xl" />
          <div className="flex gap-3 overflow-hidden">
            {Array.from({ length: 4 }).map((_, index) => (
              <div
                key={index}
                className="skeleton-shimmer h-[72px] w-[72px] shrink-0 rounded-xl"
              />
            ))}
          </div>
        </div>

        {/* Info Column */}
        <div className="space-y-6">
          <div className="space-y-3">
            <div className="skeleton-shimmer h-5 w-28 rounded-md" />
            <div className="skeleton-shimmer h-9 w-4/5 rounded-lg" />
            <div className="skeleton-shimmer h-4 w-36 rounded" />
          </div>

          <div className="flex items-baseline gap-3 pt-2">
            <div className="skeleton-shimmer h-10 w-36 rounded-lg" />
            <div className="skeleton-shimmer h-6 w-24 rounded" />
          </div>

          <div className="skeleton-shimmer h-8 w-32 rounded-xl" />

          {/* Stepper & Action Buttons */}
          <div className="space-y-3 pt-2">
            <div className="grid grid-cols-2 gap-3">
              <div className="skeleton-shimmer h-12 rounded-xl" />
              <div className="skeleton-shimmer h-12 rounded-xl" />
            </div>
            <div className="grid grid-cols-2 gap-2.5">
              <div className="skeleton-shimmer h-11 rounded-xl" />
              <div className="skeleton-shimmer h-11 rounded-xl" />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3 pt-4">
            {Array.from({ length: 3 }).map((_, index) => (
              <div
                key={index}
                className="skeleton-shimmer h-20 rounded-xl"
              />
            ))}
          </div>
        </div>
      </div>

      {/* Tabs Skeleton */}
      <div className="space-y-6 pt-6 border-t border-slate-100">
        <div className="skeleton-shimmer h-6 w-40 rounded" />
        <div className="space-y-2">
          <div className="skeleton-shimmer h-4 w-full rounded" />
          <div className="skeleton-shimmer h-4 w-11/12 rounded" />
          <div className="skeleton-shimmer h-4 w-3/4 rounded" />
        </div>
      </div>
    </div>
  );
}

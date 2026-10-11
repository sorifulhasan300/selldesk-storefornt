export default function ProductLoading() {
  return (
    <div
      aria-busy="true"
      aria-label="Loading product"
      className="space-y-6"
    >
      <div className="flex items-center gap-2">
        <div className="skeleton-shimmer h-3 w-12 rounded" />
        <div className="skeleton-shimmer h-3 w-3 rounded-full" />
        <div className="skeleton-shimmer h-3 w-16 rounded" />
        <div className="skeleton-shimmer h-3 w-3 rounded-full" />
        <div className="skeleton-shimmer h-3 w-28 rounded" />
      </div>

      <div className="grid grid-cols-1 gap-10 lg:grid-cols-2 lg:gap-14">
        <div className="flex flex-col-reverse gap-4 sm:flex-row">
          <div className="flex gap-3 overflow-hidden sm:flex-col">
            {Array.from({ length: 4 }, (_, index) => (
              <div
                key={index}
                className="skeleton-shimmer h-16 w-16 shrink-0 rounded-xl sm:h-18 sm:w-18"
              />
            ))}
          </div>
          <div className="skeleton-shimmer aspect-square w-full rounded-3xl" />
        </div>

        <div className="space-y-6">
          <div className="space-y-3">
            <div className="skeleton-shimmer h-3 w-24 rounded" />
            <div className="skeleton-shimmer h-8 w-4/5 rounded-lg" />
          </div>
          <div className="space-y-2 border-y border-slate-100 py-5">
            <div className="skeleton-shimmer h-4 w-full rounded" />
            <div className="skeleton-shimmer h-4 w-11/12 rounded" />
            <div className="skeleton-shimmer h-4 w-3/5 rounded" />
          </div>
          <div className="flex items-center justify-between">
            <div className="skeleton-shimmer h-8 w-32 rounded" />
            <div className="skeleton-shimmer h-7 w-24 rounded-full" />
          </div>
          <div className="skeleton-shimmer h-12 w-full rounded-xl" />
          <div className="grid grid-cols-3 gap-3">
            {Array.from({ length: 3 }, (_, index) => (
              <div
                key={index}
                className="skeleton-shimmer h-20 rounded-xl"
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

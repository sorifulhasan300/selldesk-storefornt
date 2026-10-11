export default function TenantLoading() {
  return (
    <div
      aria-busy="true"
      aria-label="Loading store content"
      className="space-y-12 py-4"
    >
      <div className="skeleton-shimmer h-[280px] w-full rounded-3xl sm:h-[380px] lg:h-[480px]" />

      <div className="space-y-4">
        <div className="skeleton-shimmer h-6 w-48 rounded-md" />
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-6">
          {Array.from({ length: 6 }, (_, index) => (
            <div
              key={index}
              className="skeleton-shimmer h-28 rounded-2xl"
            />
          ))}
        </div>
      </div>

      <div className="space-y-4">
        <div className="skeleton-shimmer h-6 w-48 rounded-md" />
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4 md:gap-6">
          {Array.from({ length: 8 }, (_, index) => (
            <div key={index} className="space-y-3">
              <div className="skeleton-shimmer aspect-square rounded-2xl" />
              <div className="skeleton-shimmer h-4 w-4/5 rounded" />
              <div className="skeleton-shimmer h-4 w-2/5 rounded" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

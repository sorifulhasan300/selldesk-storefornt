export default function TenantLoading() {
  return (
    <div className="space-y-12 animate-pulse py-4">
      {/* Banner Skeleton */}
      <div className="w-full h-[280px] sm:h-[380px] lg:h-[480px] bg-slate-200 rounded-3xl" />

      {/* Category Grid Skeleton */}
      <div className="space-y-4">
        <div className="h-6 w-48 bg-slate-200 rounded-md" />
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-28 bg-slate-200 rounded-2xl" />
          ))}
        </div>
      </div>

      {/* Product Grid Skeleton */}
      <div className="space-y-4">
        <div className="h-6 w-48 bg-slate-200 rounded-md" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="aspect-square bg-slate-200 rounded-2xl" />
          ))}
        </div>
      </div>
    </div>
  );
}

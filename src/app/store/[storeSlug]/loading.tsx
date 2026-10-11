import { Skeleton } from "@/shared/ui/skeleton";

export default function TenantLoading() {
  return (
    <div
      aria-busy="true"
      aria-label="Loading store content"
      className="space-y-12 py-4"
    >
      <Skeleton className="h-64 w-full rounded-2xl" />

      <div className="space-y-4">
        <Skeleton className="h-6 w-48 rounded-md" />
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-6">
          {Array.from({ length: 6 }, (_, index) => (
            <div key={index} className="flex flex-col items-center gap-3">
              <Skeleton className="size-24 rounded-full" />
              <Skeleton className="h-4 w-20 rounded" />
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-4">
        <Skeleton className="h-6 w-48 rounded-md" />
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4 md:gap-6">
          {Array.from({ length: 8 }, (_, index) => (
            <div key={index} className="space-y-3">
              <Skeleton className="aspect-square w-full rounded-2xl" />
              <Skeleton className="h-4 w-4/5 rounded" />
              <Skeleton className="h-4 w-2/5 rounded" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

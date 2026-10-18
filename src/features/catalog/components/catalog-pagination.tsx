import Link from "next/link";

interface CatalogPaginationProps {
  currentPage: number;
  totalPages: number;
  categoryId?: string;
  search?: string;
  sortBy?: string;
  sortOrder?: string;
}

export function CatalogPagination({
  currentPage,
  totalPages,
  categoryId,
  search,
  sortBy,
  sortOrder,
}: CatalogPaginationProps) {
  if (totalPages <= 1) return null;

  return (
    <div className="flex justify-center items-center gap-2 pt-6">
      {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => {
        const queryParams = new URLSearchParams();
        if (categoryId) queryParams.set("categoryId", categoryId);
        if (search) queryParams.set("search", search);
        if (sortBy) queryParams.set("sortBy", sortBy);
        if (sortOrder) queryParams.set("sortOrder", sortOrder);
        queryParams.set("page", String(pageNum));

        const isCurrent = pageNum === currentPage;

        return (
          <Link
            key={pageNum}
            href={`/products?${queryParams.toString()}`}
            className={`w-9 h-9 rounded-xl flex items-center justify-center text-xs font-bold transition-all ${
              isCurrent
                ? "bg-slate-900 text-white shadow-xs"
                : "bg-white border border-slate-200 text-slate-700 hover:border-slate-300"
            }`}
          >
            {pageNum}
          </Link>
        );
      })}
    </div>
  );
}


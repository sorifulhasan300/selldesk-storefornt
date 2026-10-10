import { getProducts, getCategories } from "@/features/catalog/server";
import { getBootstrap } from "@/features/tenant/server";
import { ProductCard, FilterSidebar } from "@/features/catalog";
import { Product, Category } from "@/shared/types";
import { Search } from "lucide-react";
import Link from "next/link";

interface CatalogPageProps {
  params: Promise<{ storeSlug: string }>;
  searchParams: Promise<{
    page?: string;
    limit?: string;
    categoryId?: string;
    search?: string;
    sortBy?: string;
    sortOrder?: "asc" | "desc";
  }>;
}

export default async function CatalogPage({
  params,
  searchParams,
}: CatalogPageProps) {
  const { storeSlug } = await params;
  const sp = await searchParams;

  const page = sp.page ? parseInt(sp.page, 10) : 1;
  const limit = sp.limit ? parseInt(sp.limit, 10) : 12;
  const categoryId = sp.categoryId;
  const search = sp.search;
  const sortBy = sp.sortBy;
  const sortOrder = sp.sortOrder;

  const [pData, cData, bData] = await Promise.all([
    getProducts(storeSlug, {
      page,
      limit,
      categoryId,
      search,
      sortBy,
      sortOrder,
    }),
    getCategories(storeSlug),
    getBootstrap(storeSlug),
  ]);

  const products: Product[] = pData.items || [];
  const totalPages = pData.totalPages || 1;
  const total = pData.total || 0;
  const categories: Category[] = cData || [];
  const currency = bData?.store?.currency || "USD";

  return (
    <div className="space-y-6">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/80 pb-5">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Product Catalog
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Showing {products.length} of {total} available items
          </p>
        </div>

        {/* Search Bar */}
        <form
          action="/products"
          method="GET"
          className="relative max-w-xs w-full"
        >
          {categoryId && (
            <input type="hidden" name="categoryId" value={categoryId} />
          )}
          <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
          <input
            name="search"
            defaultValue={search || ""}
            placeholder="Search catalog..."
            className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-xl text-xs bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          />
        </form>
      </div>

      {/* Main Catalog Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Filter Sidebar */}
        <aside className="lg:col-span-1">
          <FilterSidebar
            categories={categories}
            activeCategoryId={categoryId}
            sortBy={sortBy ? `${sortBy}:${sortOrder || "asc"}` : undefined}
          />
        </aside>

        {/* Product Grid */}
        <div className="lg:col-span-3 space-y-8">
          {products.length === 0 ? (
            <div className="bg-white border border-slate-200/80 rounded-2xl p-12 text-center">
              <h3 className="text-lg font-bold text-slate-800">
                No products found
              </h3>
              <p className="text-sm text-slate-500 mt-1">
                Try adjusting your search or category filters.
              </p>
              <Link
                href="/products"
                className="mt-4 inline-block px-5 py-2 bg-blue-600 text-white font-semibold text-xs rounded-xl"
              >
                Clear All Filters
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
              {products.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  currency={currency}
                />
              ))}
            </div>
          )}

          {/* Pagination controls */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-2 pt-6">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                (pageNum) => {
                  const queryParams = new URLSearchParams();
                  if (categoryId) queryParams.set("categoryId", categoryId);
                  if (search) queryParams.set("search", search);
                  if (sortBy) queryParams.set("sortBy", sortBy);
                  if (sortOrder) queryParams.set("sortOrder", sortOrder);
                  queryParams.set("page", String(pageNum));

                  const isCurrent = pageNum === page;

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
                },
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

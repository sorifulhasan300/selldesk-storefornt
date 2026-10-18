import { getProducts, getCategories } from "@/features/catalog/server";
import { getBootstrap } from "@/features/tenant/server";
import { ProductCard, FilterSidebar, CatalogPagination } from "@/features/catalog";
import { Product, Category } from "@/shared/types";
import { Search } from "lucide-react";
import Link from "next/link";
import { Input } from "@/shared/ui/input";

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
    <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6 space-y-6">
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
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <Input
            type="search"
            name="search"
            defaultValue={search ?? ""}
            placeholder="Search catalog..."
            aria-label="Search catalog"
            className="h-10 rounded-xl bg-white pl-9 pr-4 text-xs"
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
                className="mt-4 inline-block px-5 py-2 bg-[var(--store-primary)] hover:opacity-90 text-white font-semibold text-xs rounded-xl transition-opacity"
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

          <CatalogPagination
            currentPage={page}
            totalPages={totalPages}
            categoryId={categoryId}
            search={search}
            sortBy={sortBy}
            sortOrder={sortOrder}
          />
        </div>
      </div>
    </div>
  );
}

import { StorefrontService } from "@/services/storefront.service";
import { ProductCard } from "@/components/catalog/product-card";
import { FilterSidebar } from "@/components/catalog/filter-sidebar";
import { Product, Category } from "@/types";
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

  let products: Product[] = [];
  let categories: Category[] = [];
  let totalPages = 1;
  let total = 0;
  let currency = "USD";

  try {
    const [pData, cData, bData] = await Promise.all([
      StorefrontService.getProducts(storeSlug, {
        page,
        limit,
        categoryId,
        search,
        sortBy,
        sortOrder,
      }),
      StorefrontService.getCategories(storeSlug),
      StorefrontService.getBootstrap(storeSlug),
    ]);

    products = pData.items || [];
    totalPages = pData.totalPages || 1;
    total = pData.total || 0;
    categories = cData || [];
    currency = bData?.store?.currency || "USD";
  } catch (error) {
    // Development fallback
    categories = [
      {
        id: "c1",
        name: "Smart Watches",
        slug: "smart-watches",
        productCount: 12,
      },
      { id: "c2", name: "Audio & Headphones", slug: "audio", productCount: 8 },
      {
        id: "c3",
        name: "Footwear & Sneakers",
        slug: "sneakers",
        productCount: 15,
      },
    ];
    products = [
      {
        id: "p1",
        name: "Minimalist Chrono Watch",
        slug: "minimalist-chrono-watch",
        description: "Matte black stainless steel with sapphire crystal glass.",
        price: 199,
        salePrice: 159,
        stock: 14,
        images: [
          "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&auto=format&fit=crop&q=80",
        ],
        hasVariants: false,
        variants: [],
      },
      {
        id: "p2",
        name: "Wireless ANC Over-Ear Headphones",
        slug: "wireless-anc-headphones",
        description: "Studio-grade sound with 40-hour continuous battery life.",
        price: 299,
        salePrice: null,
        stock: 9,
        images: [
          "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&auto=format&fit=crop&q=80",
        ],
        hasVariants: false,
        variants: [],
      },
      {
        id: "p3",
        name: "Velocity Nitro Running Shoes",
        slug: "velocity-nitro-running-shoes",
        description:
          "Engineered mesh upper with responsive carbon plate cushioning.",
        price: 149,
        salePrice: 129,
        stock: 22,
        images: [
          "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&auto=format&fit=crop&q=80",
        ],
        hasVariants: true,
        variants: [],
      },
    ];
    total = products.length;
  }

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
                  const params = new URLSearchParams();
                  if (categoryId) params.set("categoryId", categoryId);
                  if (search) params.set("search", search);
                  if (sortBy) params.set("sortBy", sortBy);
                  if (sortOrder) params.set("sortOrder", sortOrder);
                  params.set("page", String(pageNum));

                  const isCurrent = pageNum === page;

                  return (
                    <Link
                      key={pageNum}
                      href={`/products?${params.toString()}`}
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

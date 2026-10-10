"use client";

import { Category } from "@/shared/types";
import { useRouter, useSearchParams } from "next/navigation";
import { Filter, X } from "lucide-react";

interface FilterSidebarProps {
  categories: Category[];
  activeCategoryId?: string;
  sortBy?: string;
}

export function FilterSidebar({
  categories,
  activeCategoryId,
  sortBy,
}: FilterSidebarProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const handleCategorySelect = (categoryId?: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (categoryId) {
      params.set("categoryId", categoryId);
    } else {
      params.delete("categoryId");
    }
    params.set("page", "1"); // reset page
    router.push(`/products?${params.toString()}`);
  };

  const handleSortChange = (newSort: string) => {
    const params = new URLSearchParams(searchParams.toString());
    const [field, order] = newSort.split(":");
    params.set("sortBy", field);
    params.set("sortOrder", order || "asc");
    router.push(`/products?${params.toString()}`);
  };

  const handleClearFilters = () => {
    router.push("/products");
  };

  const hasActiveFilters = Boolean(
    activeCategoryId || searchParams.get("search"),
  );

  return (
    <div className="bg-white border border-slate-200/80 rounded-2xl p-5 space-y-6">
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-slate-700" />
          <h3 className="font-bold text-sm text-slate-800">Filter Products</h3>
        </div>
        {hasActiveFilters && (
          <button
            onClick={handleClearFilters}
            className="text-xs text-rose-600 hover:text-rose-700 font-semibold flex items-center gap-1"
          >
            <X className="w-3.5 h-3.5" />
            Reset
          </button>
        )}
      </div>

      {/* Categories Filter */}
      <div>
        <h4 className="text-xs uppercase font-bold text-slate-400 mb-3 tracking-wider">
          Categories
        </h4>
        <div className="space-y-1.5">
          <button
            onClick={() => handleCategorySelect(undefined)}
            className={`w-full text-left px-3 py-1.5 rounded-lg text-sm transition-colors ${
              !activeCategoryId
                ? "bg-blue-50 text-blue-600 font-semibold"
                : "text-slate-600 hover:bg-slate-50"
            }`}
          >
            All Products
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => handleCategorySelect(cat.id)}
              className={`w-full text-left px-3 py-1.5 rounded-lg text-sm transition-colors flex justify-between items-center ${
                activeCategoryId === cat.id
                  ? "bg-blue-50 text-blue-600 font-semibold"
                  : "text-slate-600 hover:bg-slate-50"
              }`}
            >
              <span>{cat.name}</span>
              {cat.productCount !== undefined && (
                <span className="text-xs text-slate-400">
                  ({cat.productCount})
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Sort Filter */}
      <div>
        <h4 className="text-xs uppercase font-bold text-slate-400 mb-3 tracking-wider">
          Sort By
        </h4>
        <select
          value={sortBy || "createdAt:desc"}
          onChange={(e) => handleSortChange(e.target.value)}
          className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
        >
          <option value="createdAt:desc">Newest First</option>
          <option value="price:asc">Price: Low to High</option>
          <option value="price:desc">Price: High to Low</option>
          <option value="name:asc">Name: A to Z</option>
        </select>
      </div>
    </div>
  );
}


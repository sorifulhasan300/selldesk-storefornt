import "server-only";
import { serverFetch } from "@/shared/api/server-fetch";
import { tags, REVALIDATE } from "@/shared/api/tags";
import { ProductListResponse, Category } from "@/shared/types";

export interface CatalogQueryOptions {
  page?: number;
  limit?: number;
  search?: string;
  categoryId?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export const catalogService = {
  async getProducts(
    storeSlug: string,
    params: CatalogQueryOptions = {},
  ): Promise<ProductListResponse> {
    const searchParams = new URLSearchParams();
    if (params.page) searchParams.set("page", String(params.page));
    if (params.limit) searchParams.set("limit", String(params.limit));
    if (params.search) searchParams.set("search", params.search);
    if (params.categoryId) searchParams.set("categoryId", params.categoryId);
    if (params.sortBy) searchParams.set("sortBy", params.sortBy);
    if (params.sortOrder) searchParams.set("sortOrder", params.sortOrder);

    const qs = searchParams.toString() ? `?${searchParams.toString()}` : "";
    return serverFetch<ProductListResponse>(
      `/storefront/products${qs}`,
      storeSlug,
      {
        revalidate: REVALIDATE.products,
        tags: [tags.products(storeSlug)],
      },
    );
  },

  async getCategories(storeSlug: string): Promise<Category[]> {
    return serverFetch<Category[]>("/storefront/categories", storeSlug, {
      revalidate: REVALIDATE.categories,
      tags: [tags.categories(storeSlug)],
    });
  },
};


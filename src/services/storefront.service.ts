import { serverFetch, createApiClient } from "./api-client";
import {
  StorefrontBootstrap,
  Product,
  ProductListResponse,
  Category,
  CheckoutDto,
  CheckoutResponse,
  CouponDiscount,
} from "@/types";

export const StorefrontService = {
  // --- Server-side Data Fetching (RSC / ISR) ---

  async getBootstrap(storeSlug: string): Promise<StorefrontBootstrap> {
    return serverFetch<StorefrontBootstrap>("/storefront/init", storeSlug, {
      revalidate: 3600,
      tags: [`store:${storeSlug}:bootstrap`],
    });
  },

  async getProducts(
    storeSlug: string,
    params: {
      page?: number;
      limit?: number;
      search?: string;
      categoryId?: string;
      sortBy?: string;
      sortOrder?: "asc" | "desc";
    } = {},
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
        revalidate: 120,
        tags: [`store:${storeSlug}:products`],
      },
    );
  },

  async getProductBySlug(storeSlug: string, slug: string): Promise<Product> {
    return serverFetch<Product>(`/storefront/products/${slug}`, storeSlug, {
      revalidate: 300,
      tags: [`store:${storeSlug}:product:${slug}`],
    });
  },

  async getCategories(storeSlug: string): Promise<Category[]> {
    return serverFetch<Category[]>("/storefront/categories", storeSlug, {
      revalidate: 1800,
      tags: [`store:${storeSlug}:categories`],
    });
  },

  // --- Client-side Mutations & Actions ---

  async validateCoupon(
    storeSlug: string,
    code: string,
    cartTotal: number,
  ): Promise<CouponDiscount> {
    const client = createApiClient(storeSlug);
    const res = await client.post("/storefront/cart/validate-coupon", {
      code,
      cartTotal,
    });
    return (res as any).data ?? res;
  },

  async checkout(
    storeSlug: string,
    dto: CheckoutDto,
  ): Promise<CheckoutResponse> {
    const client = createApiClient(storeSlug);
    const res = await client.post("/orders/checkout", dto);
    return (res as any).data ?? res;
  },
};

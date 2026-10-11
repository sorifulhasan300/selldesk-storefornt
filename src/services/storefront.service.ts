import { createApiClient } from "@/shared/api/client";
import { checkoutService } from "@/features/checkout";
import {
  StorefrontBootstrap,
  ProductListResponse,
  Product,
  Category,
  CouponDiscount,
  CheckoutDto,
  CheckoutResponse,
} from "@/shared/types";

export interface CatalogQueryOptions {
  page?: number;
  limit?: number;
  search?: string;
  categoryId?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export const StorefrontService = {
  async getBootstrap(storeSlug: string): Promise<StorefrontBootstrap> {
    const client = createApiClient(storeSlug);
    const res = await client.get<StorefrontBootstrap>("/storefront/init");
    return res as unknown as StorefrontBootstrap;
  },

  async getProducts(
    storeSlug: string,
    params: CatalogQueryOptions = {},
  ): Promise<ProductListResponse> {
    const client = createApiClient(storeSlug);
    const res = await client.get<ProductListResponse>("/storefront/products", {
      params,
    });
    return res as unknown as ProductListResponse;
  },

  async getProductBySlug(storeSlug: string, slug: string): Promise<Product> {
    const client = createApiClient(storeSlug);
    const res = await client.get<Product>(
      `/storefront/products/${encodeURIComponent(slug)}`,
    );
    return res as unknown as Product;
  },

  async getCategories(storeSlug: string): Promise<Category[]> {
    const client = createApiClient(storeSlug);
    const res = await client.get<Category[]>("/storefront/categories");
    return res as unknown as Category[];
  },

  async validateCoupon(
    storeSlug: string,
    code: string,
    cartTotal: number,
  ): Promise<CouponDiscount> {
    return checkoutService.validateCoupon(storeSlug, code, cartTotal);
  },

  async checkout(
    storeSlug: string,
    dto: CheckoutDto,
    options?: { idempotencyKey?: string },
  ): Promise<CheckoutResponse> {
    return checkoutService.checkout(storeSlug, dto, options);
  },
};

export default StorefrontService;

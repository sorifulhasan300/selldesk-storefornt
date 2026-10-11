import { createApiClient } from "@/shared/api/client";
import { API_ENDPOINTS } from "@/shared/constants";
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
    const res = await client.get<StorefrontBootstrap>(API_ENDPOINTS.TENANT.INIT);
    return res as unknown as StorefrontBootstrap;
  },

  async getProducts(
    storeSlug: string,
    params: CatalogQueryOptions = {},
  ): Promise<ProductListResponse> {
    const client = createApiClient(storeSlug);
    const res = await client.get<ProductListResponse>(
      API_ENDPOINTS.CATALOG.PRODUCTS,
      {
        params,
      },
    );
    return res as unknown as ProductListResponse;
  },

  async getProductBySlug(storeSlug: string, slug: string): Promise<Product> {
    const client = createApiClient(storeSlug);
    const res = await client.get<Product>(
      API_ENDPOINTS.PRODUCTS.PRODUCT_BY_SLUG(slug),
    );
    return res as unknown as Product;
  },

  async getCategories(storeSlug: string): Promise<Category[]> {
    const client = createApiClient(storeSlug);
    const res = await client.get<Category[]>(API_ENDPOINTS.CATALOG.CATEGORIES);
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

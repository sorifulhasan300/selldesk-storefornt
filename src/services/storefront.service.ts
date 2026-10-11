import { tenantService } from "@/features/tenant/server";
import {
  catalogService,
  type CatalogQueryOptions,
} from "@/features/catalog/server";
import { productService } from "@/features/product/server";
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

export const StorefrontService = {
  async getBootstrap(storeSlug: string): Promise<StorefrontBootstrap> {
    return tenantService.getBootstrap(storeSlug);
  },

  async getProducts(
    storeSlug: string,
    params: CatalogQueryOptions = {},
  ): Promise<ProductListResponse> {
    return catalogService.getProducts(storeSlug, params);
  },

  async getProductBySlug(storeSlug: string, slug: string): Promise<Product> {
    return productService.getBySlug(storeSlug, slug);
  },

  async getCategories(storeSlug: string): Promise<Category[]> {
    return catalogService.getCategories(storeSlug);
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
  ): Promise<CheckoutResponse> {
    return checkoutService.checkout(storeSlug, dto);
  },
};

export default StorefrontService;

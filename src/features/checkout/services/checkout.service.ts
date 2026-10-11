import { createApiClient } from "@/shared/api/client";
import { CheckoutDto, CheckoutResponse, CouponDiscount } from "@/shared/types";

export interface CheckoutOptions {
  idempotencyKey?: string;
}

export const checkoutService = {
  async validateCoupon(
    storeSlug: string,
    code: string,
    cartTotal: number,
  ): Promise<CouponDiscount> {
    const client = createApiClient(storeSlug);
    const res = await client.post<CouponDiscount>(
      "/storefront/cart/validate-coupon",
      {
        code,
        cartTotal,
      },
    );
    const payload = res as unknown;
    if (payload && typeof payload === "object" && "data" in payload) {
      return (payload as { data: CouponDiscount }).data;
    }
    return payload as CouponDiscount;
  },

  async checkout(
    storeSlug: string,
    dto: CheckoutDto,
    options?: CheckoutOptions,
  ): Promise<CheckoutResponse> {
    const client = createApiClient(storeSlug);
    const headers: Record<string, string> = {};
    if (options?.idempotencyKey) {
      headers["Idempotency-Key"] = options.idempotencyKey;
    }
    const res = await client.post<CheckoutResponse>("/orders/checkout", dto, {
      headers: Object.keys(headers).length > 0 ? headers : undefined,
    });
    const payload = res as unknown;
    if (payload && typeof payload === "object" && "data" in payload) {
      return (payload as { data: CheckoutResponse }).data;
    }
    return payload as CheckoutResponse;
  },
};

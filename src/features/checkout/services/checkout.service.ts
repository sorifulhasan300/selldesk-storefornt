import { createApiClient } from "@/shared/api/client";
import { CheckoutDto, CheckoutResponse, CouponDiscount } from "@/shared/types";

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
  ): Promise<CheckoutResponse> {
    const client = createApiClient(storeSlug);
    const res = await client.post<CheckoutResponse>("/orders/checkout", dto);
    const payload = res as unknown;
    if (payload && typeof payload === "object" && "data" in payload) {
      return (payload as { data: CheckoutResponse }).data;
    }
    return payload as CheckoutResponse;
  },
};


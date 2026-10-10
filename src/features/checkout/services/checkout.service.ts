import { createApiClient } from "@/shared/api/client";
import { CheckoutDto, CheckoutResponse, CouponDiscount } from "@/shared/types";

export const checkoutService = {
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


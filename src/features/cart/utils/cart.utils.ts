import { CartItem, CouponDiscount } from "@/shared/types";

/**
 * Creates a unique composite key for a line item
 */
export function cartItemKey(productId: string, variantId?: string | null): string {
  return `${productId}:${variantId ?? "base"}`;
}

/**
 * Computes line-item subtotal
 */
export function computeSubtotal(items: CartItem[]): number {
  return items.reduce((sum, item) => sum + item.price * item.quantity, 0);
}

/**
 * Computes discount amount from coupon following the floor rule (0 <= discount <= subtotal)
 */
export function computeDiscount(
  subtotal: number,
  coupon: CouponDiscount | null | undefined,
): number {
  if (!coupon || subtotal <= 0) return 0;

  if (coupon.type === "PERCENTAGE") {
    const raw = Math.round((subtotal * coupon.amount) / 100);
    return Math.max(0, Math.min(raw, subtotal));
  }

  return Math.max(0, Math.min(coupon.amount, subtotal));
}


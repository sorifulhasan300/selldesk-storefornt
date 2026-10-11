import { ApiError } from "@/shared/api/api-error";

/**
 * Normalizes customer phone numbers to standard format
 */
export function normalizePhone(raw: string): string {
  const cleaned = raw.trim().replace(/[\s-]/g, "");
  if (cleaned.startsWith("+88")) return cleaned;
  if (cleaned.startsWith("8801")) return `+${cleaned}`;
  if (cleaned.startsWith("01")) return `+88${cleaned}`;
  return cleaned;
}

/**
 * Maps API and runtime errors to user-safe error messages (G12, SEC10)
 */
export function toSafeErrorMessage(err: unknown): string {
  if (err instanceof ApiError) {
    switch (err.code) {
      case "OUT_OF_STOCK":
      case "STOCK_CHANGED":
        return "One or more items in your cart are no longer available in the requested quantity.";
      case "PRICE_CHANGED":
        return "Product prices have changed. Please review your total before continuing.";
      case "COUPON_INVALID":
      case "COUPON_EXPIRED":
        return "The applied coupon is invalid or has expired.";
      case "RATE_LIMITED":
        return "Too many attempts. Please wait a moment and try again.";
      default:
        return err.message || "Failed to complete checkout. Please try again.";
    }
  }

  if (err && typeof err === "object" && "message" in err) {
    const msg = String((err as { message: unknown }).message);
    if (!msg.toLowerCase().includes("database") && !msg.toLowerCase().includes("syntax")) {
      return msg;
    }
  }

  return "Something went wrong while placing your order. Please try again.";
}

/**
 * Resolves post-checkout route considering current pathname context (subdomain vs direct /store/:slug)
 */
export function resolveOrderUrl(
  storeSlug: string,
  orderNumberOrId: string,
  accessToken?: string,
): string {
  const tokenQuery = accessToken ? `?t=${encodeURIComponent(accessToken)}` : "";
  const isDirectStorePath =
    typeof window !== "undefined" &&
    window.location.pathname.startsWith(`/store/${storeSlug}`);

  if (isDirectStorePath) {
    return `/store/${storeSlug}/orders/${orderNumberOrId}${tokenQuery}`;
  }
  return `/orders/${orderNumberOrId}${tokenQuery}`;
}


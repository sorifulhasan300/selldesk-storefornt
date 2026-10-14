import { ApiError } from "@/shared/api/api-error";
import { StoreDeliveryCharge, DeliveryZone } from "@/shared/types";

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

export interface ResolveDeliveryFeeOptions {
  customerDistrict?: string;
  selectedZoneName?: string | null;
  cityZone?: string | null;
}

export interface ResolvedDeliveryFee {
  fee: number;
  isFreeDelivery: boolean;
  matchedZone: { name: string; charge: number; districts?: string[] };
}

/**
 * Resolves delivery fee based on dynamic district zones and free delivery threshold.
 * 1. Checks if cart total >= freeDelivery.minOrderAmount and freeDelivery.active === true -> fee = 0
 * 2. Finds zone matching customer's selected district (zone.districts.includes(customerDistrict)) -> applies zone.charge
 * 3. Falls back to default / outside zone charge if no specific zone matched
 */
export function resolveCheckoutDeliveryFee(
  deliveryConfig: StoreDeliveryCharge | undefined | null,
  cartTotal: number,
  options: ResolveDeliveryFeeOptions = {},
): ResolvedDeliveryFee {
  const fallbackZone = {
    name: "Outside Dhaka",
    charge: deliveryConfig?.outsideCity ?? 120,
    districts: [] as string[],
  };

  if (!deliveryConfig) {
    return {
      fee: 60,
      isFreeDelivery: false,
      matchedZone: { name: "Inside Dhaka", charge: 60, districts: ["Dhaka"] },
    };
  }

  // 1. Free delivery threshold evaluation
  const freeConfig = deliveryConfig.freeDelivery;
  const isFreeByConfig =
    freeConfig?.active === true &&
    cartTotal >= Number(freeConfig.minOrderAmount ?? 0);

  const legacyThreshold =
    deliveryConfig.freeDeliveryThreshold !== null &&
    deliveryConfig.freeDeliveryThreshold !== undefined
      ? Number(deliveryConfig.freeDeliveryThreshold)
      : null;

  const isFreeByLegacy =
    legacyThreshold !== null &&
    legacyThreshold > 0 &&
    cartTotal >= legacyThreshold;

  const isFreeDelivery = Boolean(isFreeByConfig || isFreeByLegacy);

  // 2. Dynamic Zone resolution
  const zones: Array<{ id?: string; name: string; charge: number; districts?: string[] }> =
    deliveryConfig.zones && Array.isArray(deliveryConfig.zones) && deliveryConfig.zones.length > 0
      ? deliveryConfig.zones
      : [
          {
            name: "Inside Dhaka",
            charge: deliveryConfig.insideCity ?? 60,
            districts: ["Dhaka"],
          },
          {
            name: "Outside Dhaka",
            charge: deliveryConfig.outsideCity ?? 120,
            districts: [],
          },
        ];

  // Default outside zone fallback
  const defaultOutsideZone =
    zones.find(
      (z) => /outside/i.test(z.name) || !z.districts || z.districts.length === 0,
    ) ||
    zones[zones.length - 1] ||
    fallbackZone;

  let matchedZone = defaultOutsideZone;

  const district = (options.customerDistrict || "").trim().toLowerCase();

  if (district) {
    const found = zones.find(
      (z) =>
        Array.isArray(z.districts) &&
        z.districts.some((d) => {
          const dl = d.trim().toLowerCase();
          return dl === district || district.includes(dl) || (dl.length > 3 && district.startsWith(dl));
        }),
    );
    if (found) {
      matchedZone = found;
    }
  } else if (options.selectedZoneName) {
    const found = zones.find(
      (z) => z.name.toLowerCase() === options.selectedZoneName?.toLowerCase(),
    );
    if (found) {
      matchedZone = found;
    }
  } else if (options.cityZone) {
    const cz = options.cityZone.toLowerCase();
    if (cz === "inside" || cz.includes("inside")) {
      const insideZone =
        zones.find(
          (z) =>
            /inside/i.test(z.name) ||
            (Array.isArray(z.districts) &&
              z.districts.some((d) => /dhaka/i.test(d))),
        ) || zones[0];
      if (insideZone) matchedZone = insideZone;
    } else {
      matchedZone = defaultOutsideZone;
    }
  }

  const fee = isFreeDelivery ? 0 : Math.max(0, Number(matchedZone.charge));

  return {
    fee,
    isFreeDelivery,
    matchedZone,
  };
}


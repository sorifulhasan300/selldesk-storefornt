/**
 * Product URL and Social Messaging Utilities
 * Handles safe URL resolution for both subdomain and path-based routing,
 * plus formatters for WhatsApp, Messenger, and Hotline telephone dialing.
 */

export interface ProductSlugSource {
  id?: string;
  slug?: string | null;
}

/**
 * Normalizes a product or slug string, ensuring null/empty slugs fallback to ID safely.
 */
export function resolveProductSlug(
  productOrSlug: ProductSlugSource | string | null | undefined,
): string {
  if (!productOrSlug) return "";
  if (typeof productOrSlug === "string") {
    return productOrSlug.trim();
  }
  const slug = productOrSlug.slug?.trim();
  if (slug) return slug;
  return productOrSlug.id?.trim() || "";
}

/**
 * Builds a relative product URL.
 * Automatically handles subdomain (e.g., /products/[slug]) and
 * path-based (e.g., /store/[storeSlug]/products/[slug]) routing.
 */
export function buildProductPath(
  productOrSlug: ProductSlugSource | string,
  storeSlug?: string,
  isPathBased = false,
): string {
  const slug = resolveProductSlug(productOrSlug);
  const encodedSlug = encodeURIComponent(slug);

  if (isPathBased && storeSlug) {
    return `/store/${encodeURIComponent(storeSlug)}/products/${encodedSlug}`;
  }
  return `/products/${encodedSlug}`;
}

/**
 * Builds an absolute product URL with origin.
 */
export function buildProductAbsoluteUrl(
  productOrSlug: ProductSlugSource | string,
  origin: string,
  storeSlug?: string,
  isPathBased = false,
): string {
  const path = buildProductPath(productOrSlug, storeSlug, isPathBased);
  const cleanOrigin = origin.replace(/\/$/, "");
  return `${cleanOrigin}${path}`;
}

/**
 * Clean phone number for WhatsApp links (digits only, e.g. 8801700000000).
 */
export function sanitizePhoneNumber(phone: string): string {
  const cleaned = phone.replace(/[^\d+]/g, "").trim();
  if (cleaned.startsWith("+")) {
    return cleaned.slice(1);
  }
  return cleaned;
}

/**
 * Generates direct WhatsApp order chat URL.
 * Format: https://wa.me/{phone}?text=Hello,%20I%20want%20to%20order:%20{productName}%20(Price:%20{price})%20Link:%20{currentUrl}
 */
export function buildWhatsAppOrderUrl(params: {
  phone: string;
  productName: string;
  price: string | number;
  currentUrl: string;
}): string {
  const cleanPhone = sanitizePhoneNumber(params.phone);
  const text = `Hello, I want to order: ${params.productName} (Price: ${params.price}) Link: ${params.currentUrl}`;
  return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(text)}`;
}

/**
 * Extracts Facebook page ID or username from full URL or returns raw ID.
 */
export function extractFacebookPageId(pageIdOrUrl: string): string {
  if (!pageIdOrUrl) return "";
  const cleaned = pageIdOrUrl.trim();
  if (!cleaned.includes("facebook.com") && !cleaned.includes("m.me")) {
    return cleaned.replace(/^@/, "");
  }
  try {
    const url = new URL(
      cleaned.startsWith("http") ? cleaned : `https://${cleaned}`,
    );
    const parts = url.pathname.split("/").filter(Boolean);
    return parts[parts.length - 1] || "";
  } catch {
    return cleaned;
  }
}

/**
 * Generates direct Facebook Messenger chat URL.
 * Format: https://m.me/{facebookPageId}
 */
export function buildMessengerOrderUrl(pageIdOrUrl: string): string {
  const pageId = extractFacebookPageId(pageIdOrUrl);
  return `https://m.me/${pageId}`;
}

/**
 * Generates direct tel: dialer link.
 * Format: tel:{contactPhone}
 */
export function buildHotlineTelUrl(phone: string): string {
  const clean = phone.trim().replace(/\s+/g, "");
  return `tel:${clean}`;
}


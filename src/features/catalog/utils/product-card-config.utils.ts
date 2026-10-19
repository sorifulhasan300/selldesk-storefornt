import type { StorefrontProductCardConfig } from "@/shared/types";
import type {
  ProductCardStylePreset,
  ResolvedProductCardConfig,
} from "../types";

export const DEFAULT_PRODUCT_CARD_CONFIG: ResolvedProductCardConfig = {
  style: 2,
  showAddToCart: true,
  showBuyNow: true,
  showBrand: true,
  showDiscountBadge: true,
  showStockBadge: true,
  showBoxShadow: true,
  showQuickView: false,
  addToCartLabel: "Add to Cart",
  buyNowLabel: "Buy Now",
  preOrderLabel: "Pre Order",
  imgHeight: 240,
  borderRadius: 16,
  titleLines: 2,
};

function normalizeStyle(style?: number | string): ProductCardStylePreset {
  if (
    style === 1 ||
    style === "1" ||
    style === "classic" ||
    style === "standard"
  ) {
    return 1;
  }
  if (style === 2 || style === "2" || style === "modern") {
    return 2;
  }
  if (
    style === 3 ||
    style === "3" ||
    style === "elegant" ||
    style === "bordered"
  ) {
    return 3;
  }
  if (style === 4 || style === "4" || style === "minimal") {
    return 4;
  }
  return DEFAULT_PRODUCT_CARD_CONFIG.style;
}

export function resolveProductCardConfig(
  source?: StorefrontProductCardConfig | null,
  fallback?: StorefrontProductCardConfig | null,
): ResolvedProductCardConfig {
  const merged: StorefrontProductCardConfig = {
    ...fallback,
    ...source,
  };

  const parsedImgHeight =
    typeof merged.imgHeight === "number" && merged.imgHeight >= 100
      ? merged.imgHeight
      : DEFAULT_PRODUCT_CARD_CONFIG.imgHeight;

  const parsedRadius =
    typeof merged.borderRadius === "number" && merged.borderRadius >= 0
      ? merged.borderRadius
      : DEFAULT_PRODUCT_CARD_CONFIG.borderRadius;

  const titleLines: 1 | 2 = merged.titleLines === 1 ? 1 : 2;

  return {
    style: normalizeStyle(merged.style),
    showAddToCart: merged.showAddToCart !== false,
    showBuyNow: merged.showBuyNow !== false,
    showBrand: merged.showBrand !== false,
    showDiscountBadge: merged.showDiscountBadge !== false,
    showStockBadge: merged.showStockBadge !== false,
    showBoxShadow: merged.showBoxShadow !== false,
    showQuickView: merged.showQuickView === true,
    addToCartLabel:
      merged.addToCartLabel?.trim() ||
      DEFAULT_PRODUCT_CARD_CONFIG.addToCartLabel,
    buyNowLabel:
      merged.buyNowLabel?.trim() || DEFAULT_PRODUCT_CARD_CONFIG.buyNowLabel,
    preOrderLabel:
      merged.preOrderLabel?.trim() || DEFAULT_PRODUCT_CARD_CONFIG.preOrderLabel,
    imgHeight: parsedImgHeight,
    borderRadius: parsedRadius,
    titleLines,
  };
}


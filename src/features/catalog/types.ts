import type React from "react";
import type { Product, StorefrontProductCardConfig } from "@/shared/types";

export type ProductCardStylePreset = 1 | 2 | 3 | 4;

export interface ResolvedProductCardConfig {
  style: ProductCardStylePreset;
  showAddToCart: boolean;
  showBuyNow: boolean;
  showBrand: boolean;
  showDiscountBadge: boolean;
  showStockBadge: boolean;
  showBoxShadow: boolean;
  showQuickView: boolean;
  addToCartLabel: string;
  buyNowLabel: string;
  preOrderLabel: string;
  imgHeight: number;
  borderRadius: number;
  titleLines: 1 | 2;
}

export interface ProductCardProps {
  product: Product;
  currency?: string;
  cardConfig?: StorefrontProductCardConfig;
  cardWidth?: number | string;
  cardRadius?: number | string;
  showName?: boolean;
  showCategoryName?: boolean;
  storeSlug?: string;
  className?: string;
  style?: React.CSSProperties;
}


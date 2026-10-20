"use client";

import React from "react";
import { useParams } from "next/navigation";
import { cn } from "@/shared/lib/utils";
import type { ProductCardProps, ProductCardStylePreset } from "../types";
import { resolveProductCardConfig } from "../utils/product-card-config.utils";
import { useProductCardConfig } from "./product-card-config-provider";
import { ProductCardImage } from "./product-card-image";
import { ProductCardContent } from "./product-card-content";
import { ProductCardActions } from "./product-card-actions";

export type { ProductCardProps } from "../types";

function getPresetCardClasses(
  style: ProductCardStylePreset,
  showBoxShadow: boolean,
): string {
  const shadowClass =
    showBoxShadow === false ? "shadow-none" : "shadow-xs hover:shadow-md";

  switch (style) {
    case 1:
      return cn(
        "border border-slate-200/80 bg-white hover:border-slate-300",
        shadowClass,
      );
    case 3:
      return cn(
        "border border-slate-200/80 bg-white hover:border-[var(--store-primary)]",
        shadowClass,
      );
    case 4:
      return "border-0 bg-transparent shadow-none hover:shadow-none";
    case 2:
    default:
      return cn("border border-slate-200/80 bg-white", shadowClass);
  }
}

export function ProductCard({
  product,
  currency = "USD",
  cardConfig,
  cardWidth,
  cardRadius,
  showName = true,
  showCategoryName = true,
  storeSlug,
  className,
  style,
}: ProductCardProps) {
  const routeParams = useParams<{ storeSlug?: string }>();
  const resolvedStoreSlug =
    storeSlug ??
    (typeof routeParams?.storeSlug === "string" ? routeParams.storeSlug : "");

  const contextConfig = useProductCardConfig();
  const resolvedConfig = resolveProductCardConfig(cardConfig, contextConfig);

  const resolvedRadius =
    cardConfig?.borderRadius !== undefined
      ? `${resolvedConfig.borderRadius}px`
      : typeof cardRadius === "number"
        ? `${cardRadius}px`
        : cardRadius !== undefined
          ? String(cardRadius)
          : `${resolvedConfig.borderRadius}px`;

  const resolvedWidth =
    typeof cardWidth === "number" ? `${cardWidth}px` : cardWidth;

  const cardStyle: React.CSSProperties = {
    borderRadius: resolvedRadius,
    ...(resolvedWidth ? { width: resolvedWidth } : {}),
    ...style,
  };

  return (
    <div
      className={cn(
        "group relative flex w-full flex-col justify-between overflow-hidden transition-all duration-300",
        getPresetCardClasses(resolvedConfig.style, resolvedConfig.showBoxShadow),
        className,
      )}
      style={cardStyle}
    >
      <ProductCardImage
        product={product}
        config={resolvedConfig}
        storeSlug={resolvedStoreSlug}
        wishlist={cardConfig?.wishlist}
      />

      <div className="flex flex-1 flex-col justify-between p-4">
        <ProductCardContent
          product={product}
          config={resolvedConfig}
          currency={currency}
          showName={showName}
          showCategoryName={showCategoryName}
        />

        <ProductCardActions product={product} config={resolvedConfig} />
      </div>
    </div>
  );
}

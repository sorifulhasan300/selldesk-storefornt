"use client";

import React, { useContext } from "react";
import { Star, CheckCircle2, AlertTriangle, XCircle } from "lucide-react";
import type { Product } from "@/shared/types";
import { Badge } from "@/shared/ui/badge";
import { useProductPurchase } from "./product-purchase-provider";

export interface ProductInfoSummaryProps {
  product: Product;
  currency?: string;
  currentPrice?: number;
  regularPrice?: number;
  salePrice?: number | null;
  currentStock?: number;
  isOutOfStock?: boolean;
  showReviews?: boolean;
}

export function formatPrice(amount: number, currency = "BDT"): string {
  const symbolMap: Record<string, string> = {
    BDT: "৳",
    USD: "$",
    EUR: "€",
    GBP: "£",
  };
  const symbol = symbolMap[currency] || `${currency} `;
  const hasDecimals = amount % 1 !== 0;
  return `${symbol}${amount.toLocaleString(undefined, {
    minimumFractionDigits: hasDecimals ? 2 : 0,
    maximumFractionDigits: 2,
  })}`;
}

export function ProductInfoSummary({
  product,
  currency = "BDT",
  currentPrice: propPrice,
  regularPrice: propRegular,
  salePrice: propSale,
  currentStock: propStock,
  isOutOfStock: propOutOfStock,
  showReviews = true,
}: ProductInfoSummaryProps) {
  // Read from ProductPurchaseContext if available
  let purchaseContext: ReturnType<typeof useProductPurchase> | null = null;
  try {
    purchaseContext = useProductPurchase();
  } catch {
    purchaseContext = null;
  }

  const effectivePrice =
    purchaseContext?.currentPrice ?? propPrice ?? product.salePrice ?? product.price;
  const effectiveRegularPrice =
    purchaseContext?.regularPrice ?? propRegular ?? product.price;
  const effectiveSalePrice =
    purchaseContext?.salePrice !== undefined
      ? purchaseContext.salePrice
      : (propSale !== undefined ? propSale : product.salePrice);
  const effectiveStock =
    purchaseContext?.currentStock ?? propStock ?? product.stock;
  const effectiveOutOfStock =
    purchaseContext?.isOutOfStock ?? propOutOfStock ?? effectiveStock <= 0;
  const effectiveCurrency = purchaseContext?.currency ?? currency;

  const brandName =
    product.brand?.name ??
    (typeof product.brand === "string" ? product.brand : null);
  const categoryName = product.category?.name ?? null;

  const hasDiscount = Boolean(
    effectiveSalePrice != null &&
      effectiveRegularPrice > 0 &&
      effectiveSalePrice < effectiveRegularPrice,
  );
  const savingsAmount =
    hasDiscount && effectiveSalePrice != null
      ? effectiveRegularPrice - effectiveSalePrice
      : 0;
  const savingsPercent =
    hasDiscount && effectiveRegularPrice > 0
      ? Math.round((savingsAmount / effectiveRegularPrice) * 100)
      : 0;

  return (
    <div className="space-y-4">
      {/* Brand & Category row */}
      <div className="flex flex-wrap items-center gap-2 text-xs">
        {categoryName && (
          <span className="font-extrabold uppercase tracking-wider text-[var(--store-primary)] bg-[var(--store-primary)]/10 px-2.5 py-1 rounded-md">
            {categoryName}
          </span>
        )}
        {brandName && (
          <span className="font-semibold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-md">
            Brand: <strong className="text-slate-800">{brandName}</strong>
          </span>
        )}
      </div>

      {/* Product Title */}
      <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight leading-snug">
        {product.name}
      </h1>

      {/* Ratings and Stock Status */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-2 border-b border-slate-100">
        {showReviews ? (
          <div className="flex items-center gap-2 text-xs">
            <div className="flex items-center text-amber-400">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  className="w-4 h-4 fill-amber-400 stroke-amber-400"
                />
              ))}
            </div>
            <span className="font-bold text-slate-800">5.0</span>
            <span className="text-slate-400">(24 reviews)</span>
          </div>
        ) : (
          <div />
        )}

        {/* Stock Badge */}
        <div>
          {effectiveOutOfStock ? (
            <Badge
              variant="destructive"
              className="gap-1.5 bg-rose-50 border-rose-200 text-rose-700 text-xs font-bold px-3 py-1 rounded-full shadow-2xs"
            >
              <XCircle className="w-3.5 h-3.5" />
              <span>Out of Stock</span>
            </Badge>
          ) : effectiveStock <= 5 ? (
            <Badge className="gap-1.5 bg-amber-50 border-amber-200 text-amber-800 text-xs font-bold px-3 py-1 rounded-full shadow-2xs">
              <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
              <span>Only {effectiveStock} left in stock</span>
            </Badge>
          ) : (
            <Badge className="gap-1.5 bg-emerald-50 border-emerald-200 text-emerald-800 text-xs font-bold px-3 py-1 rounded-full shadow-2xs">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              <span>In Stock</span>
            </Badge>
          )}
        </div>
      </div>

      {/* Dynamic Price Display */}
      <div className="flex flex-wrap items-baseline gap-3 pt-1">
        <span className="text-3xl sm:text-4xl font-extrabold text-[var(--store-primary,#0f172a)] tracking-tight">
          {formatPrice(effectivePrice, effectiveCurrency)}
        </span>

        {hasDiscount && (
          <>
            <span className="text-lg sm:text-xl text-slate-400 line-through font-medium">
              {formatPrice(effectiveRegularPrice, effectiveCurrency)}
            </span>
            <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-bold bg-rose-50 text-rose-600 border border-rose-200/80">
              Save {formatPrice(savingsAmount, effectiveCurrency)} ({savingsPercent}%)
            </span>
          </>
        )}
      </div>

      {/* Short description if available */}
      {product.shortDescription && (
        <p className="text-sm text-slate-600 leading-relaxed pt-1">
          {product.shortDescription}
        </p>
      )}
    </div>
  );
}


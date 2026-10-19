import React from "react";
import Link from "next/link";
import type { Product } from "@/shared/types";
import { cn, formatCurrency } from "@/shared/lib/utils";
import type { ResolvedProductCardConfig } from "../types";

export interface ProductCardContentProps {
  product: Product;
  config: ResolvedProductCardConfig;
  currency?: string;
  showName?: boolean;
  showCategoryName?: boolean;
}

export function ProductCardContent({
  product,
  config,
  currency = "USD",
  showName = true,
  showCategoryName = true,
}: ProductCardContentProps) {
  const brandName =
    product.brand?.name ??
    (typeof product.brand === "string" ? product.brand : null);

  const currentPrice = product.salePrice ?? product.price;
  const hasDiscount = Boolean(
    product.salePrice && product.salePrice < product.price,
  );
  const isCentered = config.style === 2;

  return (
    <div
      className={cn(
        "flex flex-col gap-1",
        isCentered ? "items-center text-center" : "items-start text-left",
      )}
    >
      {config.showBrand && brandName ? (
        <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
          {brandName}
        </p>
      ) : showCategoryName && product.category ? (
        <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
          {product.category.name}
        </p>
      ) : null}

      {showName && (
        <Link href={`/products/${product.slug}`} className="group/title block">
          <h3
            className={cn(
              "text-sm font-semibold text-slate-800 transition-colors group-hover/title:text-[var(--store-primary)]",
              config.titleLines === 1 ? "line-clamp-1" : "line-clamp-2",
            )}
            title={product.name}
          >
            {product.name}
          </h3>
        </Link>
      )}

      <div
        className={cn(
          "mt-1 flex items-baseline gap-1.5",
          isCentered ? "justify-center" : "justify-start",
        )}
      >
        <span className="text-base font-bold text-slate-900">
          {formatCurrency(currentPrice, currency)}
        </span>
        {hasDiscount && (
          <span className="text-xs text-slate-400 line-through">
            {formatCurrency(product.price, currency)}
          </span>
        )}
      </div>
    </div>
  );
}


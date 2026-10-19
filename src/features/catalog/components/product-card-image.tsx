"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ShoppingBag } from "lucide-react";
import type { Product } from "@/shared/types";
import { Badge } from "@/shared/ui/badge";
import { WishlistToggle } from "@/features/wishlist";
import type { ResolvedProductCardConfig } from "../types";

export interface ProductCardImageProps {
  product: Product;
  config: ResolvedProductCardConfig;
  storeSlug?: string;
}

export function ProductCardImage({
  product,
  config,
  storeSlug,
}: ProductCardImageProps) {
  const [imageFailed, setImageFailed] = useState(false);
  const primaryImage = product.images?.[0] || null;

  const hasDiscount = Boolean(
    product.salePrice && product.salePrice < product.price,
  );
  const discountPercent =
    hasDiscount && product.salePrice
      ? Math.round(((product.price - product.salePrice) / product.price) * 100)
      : 0;

  const isOutOfStock = product.stock <= 0;
  const isPreOrder = Boolean(product.isPreOrder ?? product.preOrder);

  return (
    <div
      className="relative w-full overflow-hidden bg-slate-100 text-slate-300"
      style={{ height: `${config.imgHeight}px` }}
    >
      <Link
        href={`/products/${product.slug}`}
        className="relative block h-full w-full overflow-hidden"
        tabIndex={-1}
        aria-hidden="true"
      >
        {primaryImage && !imageFailed ? (
          <Image
            src={primaryImage}
            alt={product.name}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 320px"
            className="object-cover object-center group-hover:scale-105 transition-transform duration-500"
            onError={() => setImageFailed(true)}
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <ShoppingBag className="h-12 w-12 text-slate-300" />
          </div>
        )}

        {config.showStockBadge && isOutOfStock && (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-black/40 backdrop-blur-[2px]">
            <span className="rounded-md bg-slate-900/90 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-white">
              Out of Stock
            </span>
          </div>
        )}
      </Link>

      <div className="pointer-events-none absolute left-2.5 top-2.5 z-10 flex flex-col items-start gap-1">
        {config.showDiscountBadge && hasDiscount && (
          <Badge
            variant="destructive"
            className="bg-rose-500 px-2 py-0.5 text-[10px] font-bold tracking-wide text-white shadow-xs"
          >
            {discountPercent > 0 ? `-${discountPercent}%` : "Sale"}
          </Badge>
        )}
        {isPreOrder && (
          <Badge className="bg-amber-500 px-2 py-0.5 text-[10px] font-semibold tracking-wide text-white shadow-xs">
            {config.preOrderLabel}
          </Badge>
        )}
      </div>

      {storeSlug && (
        <div className="absolute right-2 top-2 z-20">
          <WishlistToggle storeSlug={storeSlug} product={product} />
        </div>
      )}
    </div>
  );
}


"use client";

import Link from "next/link";
import Image from "next/image";
import React, { useState } from "react";
import { useParams } from "next/navigation";
import { Product } from "@/shared/types";
import { cn, formatCurrency } from "@/shared/lib/utils";
import { useCartStore } from "@/features/cart";
import { WishlistToggle } from "@/features/wishlist";
import { ShoppingBag, Check } from "lucide-react";
import { Badge } from "@/shared/ui/badge";
import { Button } from "@/shared/ui/button";

export interface ProductCardProps {
  product: Product;
  currency?: string;
  cardWidth?: number | string;
  cardRadius?: number | string;
  showName?: boolean;
  showCategoryName?: boolean;
  storeSlug?: string;
  className?: string;
  style?: React.CSSProperties;
}

export function ProductCard({
  product,
  currency = "USD",
  cardWidth,
  cardRadius = 16,
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
  const addItem = useCartStore((s) => s.addItem);
  const [added, setAdded] = useState(false);
  const [failedImage, setFailedImage] = useState<string | null>(null);

  const primaryImage = product.images?.[0] || null;
  const imageFailed = primaryImage !== null && failedImage === primaryImage;

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    addItem({
      id: `${product.id}-base`,
      productId: product.id,
      name: product.name,
      price: product.salePrice ?? product.price,
      quantity: 1,
      image: primaryImage || "",
      maxStock: product.stock,
    });

    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  };

  const hasDiscount = product.salePrice && product.salePrice < product.price;

  const resolvedRadius =
    typeof cardRadius === "number" ? `${cardRadius}px` : cardRadius;
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
        "group relative w-full bg-white border border-slate-200/80 overflow-hidden shadow-xs hover:shadow-lg transition-all duration-300 flex flex-col justify-between",
        className,
      )}
      style={cardStyle}
    >
      <Link
        href={`/products/${product.slug}`}
        className="relative flex aspect-square items-center justify-center overflow-hidden bg-slate-100 text-slate-300"
      >
        {primaryImage && !imageFailed ? (
          <Image
            src={primaryImage}
            alt={product.name}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 320px"
            className="object-cover object-center group-hover:scale-105 transition-transform duration-500"
            onError={() => setFailedImage(primaryImage)}
          />
        ) : (
          <ShoppingBag className="w-12 h-12 text-slate-300" />
        )}

        {hasDiscount && (
          <Badge
            variant="destructive"
            className="absolute left-2.5 top-2.5 text-[11px] shadow-xs"
          >
            Sale
          </Badge>
        )}

        {product.stock <= 0 && (
          <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px] flex items-center justify-center">
            <span className="bg-slate-900/90 text-white text-xs font-semibold px-3 py-1 rounded-md uppercase tracking-wider">
              Out of Stock
            </span>
          </div>
        )}
      </Link>

      {resolvedStoreSlug && (
        <div className="absolute right-2 top-2 z-10">
          <WishlistToggle storeSlug={resolvedStoreSlug} product={product} />
        </div>
      )}

      <div className="p-4 flex flex-col flex-1 justify-between">
        <div>
          {showCategoryName && product.category && (
            <p className="text-[11px] uppercase tracking-wider font-semibold text-slate-400 mb-1">
              {product.category.name}
            </p>
          )}

          {showName && (
            <Link href={`/products/${product.slug}`}>
              <h3 className="line-clamp-2 text-sm font-semibold text-slate-800 transition-colors hover:text-(--store-primary)">
                {product.name}
              </h3>
            </Link>
          )}
        </div>

        <div className="pt-3 mt-3 border-t border-slate-100 flex items-center justify-between">
          <div className="flex items-baseline gap-1.5">
            <span className="text-base font-bold text-slate-900">
              {formatCurrency(product.salePrice ?? product.price, currency)}
            </span>
            {hasDiscount && (
              <span className="text-xs text-slate-400 line-through">
                {formatCurrency(product.price, currency)}
              </span>
            )}
          </div>

          <Button
            onClick={handleQuickAdd}
            disabled={product.stock <= 0}
            size="sm"
            className={cn(
              "size-9 rounded-xl p-0 transition-all duration-200",
              added
                ? "bg-emerald-600 text-white hover:bg-emerald-600"
                : "bg-slate-900 text-white hover:bg-(--store-primary)",
            )}
            title="Add to cart"
            aria-label={added ? "Added to cart" : "Add to cart"}
          >
            {added ? (
              <Check className="w-4 h-4" />
            ) : (
              <ShoppingBag className="w-4 h-4" />
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}

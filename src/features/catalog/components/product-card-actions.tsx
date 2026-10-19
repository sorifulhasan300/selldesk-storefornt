"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Check, ShoppingBag, Zap } from "lucide-react";
import type { Product } from "@/shared/types";
import { Button } from "@/shared/ui/button";
import { cn } from "@/shared/lib/utils";
import { useCartStore } from "@/features/cart";
import type { ResolvedProductCardConfig } from "../types";

export interface ProductCardActionsProps {
  product: Product;
  config: ResolvedProductCardConfig;
}

export function ProductCardActions({
  product,
  config,
}: ProductCardActionsProps) {
  const router = useRouter();
  const addItem = useCartStore((s) => s.addItem);
  const toggleDrawer = useCartStore((s) => s.toggleDrawer);
  const [added, setAdded] = useState(false);

  const isOutOfStock = product.stock <= 0;
  const isPreOrder = Boolean(product.isPreOrder ?? product.preOrder);
  const buyNowText = isPreOrder ? config.preOrderLabel : config.buyNowLabel;

  const showAddToCart = config.showAddToCart;
  const showBuyNow = config.showBuyNow && !isOutOfStock;

  if (!showAddToCart && !showBuyNow) {
    return null;
  }

  const addCurrentItem = () =>
    addItem({
      id: `${product.id}-base`,
      productId: product.id,
      name: product.name,
      price: product.salePrice ?? product.price,
      quantity: 1,
      image: product.images?.[0] || "",
      maxStock: product.stock,
    });

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addCurrentItem();
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  };

  const handleBuyNow = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addCurrentItem();
    toggleDrawer(false);
    router.push("/checkout");
  };

  const addToCartBtn = showAddToCart && (
    <Button
      type="button"
      onClick={handleAddToCart}
      disabled={isOutOfStock}
      size="sm"
      className={cn(
        "h-9 rounded-xl px-2.5 text-xs font-semibold transition-all duration-200 flex items-center justify-center gap-1.5 cursor-pointer",
        added
          ? "bg-emerald-600 text-white hover:bg-emerald-600"
          : "bg-slate-900 text-white hover:bg-[var(--store-primary)]",
        config.style === 3 && "w-full",
      )}
      title={config.addToCartLabel}
      aria-label={added ? "Added to cart" : config.addToCartLabel}
    >
      {added ? (
        <>
          <Check className="h-3.5 w-3.5" />
          <span className="truncate">Added</span>
        </>
      ) : (
        <>
          <ShoppingBag className="h-3.5 w-3.5 shrink-0" />
          <span className="truncate">{config.addToCartLabel}</span>
        </>
      )}
    </Button>
  );

  const buyNowBtn = showBuyNow && (
    <Button
      type="button"
      onClick={handleBuyNow}
      size="sm"
      className={cn(
        "h-9 rounded-xl px-2.5 text-xs font-bold bg-[var(--store-primary)] text-white hover:opacity-90 transition-all flex items-center justify-center gap-1.5 shadow-xs cursor-pointer",
        config.style === 3 && "w-full",
      )}
      title={buyNowText}
      aria-label={buyNowText}
    >
      <Zap className="h-3.5 w-3.5 shrink-0" />
      <span className="truncate">{buyNowText}</span>
    </Button>
  );

  if (config.style === 3) {
    return (
      <div className="mt-3 flex w-full flex-col gap-2">
        {buyNowBtn}
        {addToCartBtn}
      </div>
    );
  }

  if (config.style === 1) {
    return (
      <div className="mt-3 flex w-full items-center justify-between gap-2 border-t border-slate-100 pt-3">
        <div className="flex-1 min-w-0">{addToCartBtn}</div>
        {buyNowBtn && <div className="flex-1 min-w-0">{buyNowBtn}</div>}
      </div>
    );
  }

  const hasBoth = showAddToCart && showBuyNow;
  return (
    <div
      className={cn(
        "mt-3 w-full grid gap-2",
        hasBoth ? "grid-cols-2" : "grid-cols-1",
      )}
    >
      {addToCartBtn}
      {buyNowBtn}
    </div>
  );
}

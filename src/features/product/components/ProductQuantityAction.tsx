"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
  ShoppingBag,
  Zap,
  Plus,
  Minus,
  Check,
  MessageCircle,
  MessageSquare,
  PhoneCall,
  Heart,
} from "lucide-react";
import { toast } from "sonner";
import { useProductPurchase } from "./product-purchase-provider";
import { Button } from "@/shared/ui/button";
import { useWishlistStore } from "@/features/wishlist/store/use-wishlist-store";
import {
  buildWhatsAppOrderUrl,
  buildMessengerOrderUrl,
  buildHotlineTelUrl,
} from "../utils/product-url.utils";
import type {
  ProductActionButtonItem,
  ActionButtonKey,
} from "@/shared/types";

export interface ProductQuantityActionProps {
  storeSlug: string;
  actionsConfig?: ProductActionButtonItem[];
  contactPhone?: string | null;
  whatsappPhone?: string | null;
  facebookUrl?: string | null;
  currentUrl?: string;
}

export function ProductQuantityAction({
  storeSlug,
  actionsConfig,
  contactPhone,
  whatsappPhone,
  facebookUrl,
  currentUrl: initialUrl,
}: ProductQuantityActionProps) {
  const router = useRouter();
  const {
    product,
    selectedVariant,
    setSelectedVariant,
    quantity,
    setQuantity,
    currentPrice,
    currentStock,
    isOutOfStock,
    addToCart,
  } = useProductPurchase();

  const [isAdded, setIsAdded] = useState(false);
  const [isBuying, setIsBuying] = useState(false);

  // Wishlist state
  const isWishlisted = useWishlistStore((state) =>
    (state.productsByStore[storeSlug] ?? []).some(
      (item) => item.id === product.id,
    ),
  );
  const addWishlistProduct = useWishlistStore((state) => state.addProduct);
  const removeWishlistProduct = useWishlistStore((state) => state.removeProduct);

  const handleAddToCart = () => {
    const result = addToCart();
    if (!result.ok) {
      toast.error(
        result.reason === "OUT_OF_STOCK"
          ? "This product is out of stock"
          : "Maximum available quantity is already in your cart",
      );
      return false;
    }

    setIsAdded(true);
    toast.success(`${product.name} added to cart`);
    setTimeout(() => setIsAdded(false), 2000);
    return true;
  };

  const handleBuyNow = () => {
    if (isOutOfStock) {
      toast.error("This product is out of stock");
      return;
    }

    setIsBuying(true);
    const result = addToCart();
    if (!result.ok && result.reason === "OUT_OF_STOCK") {
      toast.error("This product is out of stock");
      setIsBuying(false);
      return;
    }

    // Determine checkout destination based on current pathname
    const isPathBased =
      typeof window !== "undefined" &&
      window.location.pathname.startsWith(`/store/${storeSlug}`);
    const checkoutUrl = isPathBased
      ? `/store/${storeSlug}/checkout`
      : `/checkout`;

    router.push(checkoutUrl);
  };

  const handleWishlistToggle = () => {
    if (isWishlisted) {
      removeWishlistProduct(storeSlug, product.id);
      toast.info("Removed from wishlist");
    } else {
      addWishlistProduct(storeSlug, product);
      toast.success("Added to wishlist");
    }
  };

  // URL resolution for social order buttons
  const resolvedUrl =
    initialUrl || (typeof window !== "undefined" ? window.location.href : "");
  const targetWhatsapp = whatsappPhone || contactPhone || "01700000000";
  const targetPhone = contactPhone || whatsappPhone || "01700000000";

  const whatsappUrl = buildWhatsAppOrderUrl({
    phone: targetWhatsapp,
    productName: product.name,
    price: currentPrice,
    currentUrl: resolvedUrl,
  });
  const messengerUrl = facebookUrl ? buildMessengerOrderUrl(facebookUrl) : null;
  const hotlineUrl = buildHotlineTelUrl(targetPhone);

  // If actionsConfig is provided, filter enabled ones
  const configuredActions = actionsConfig
    ? actionsConfig.filter((a) => a.enabled)
    : null;

  return (
    <div className="space-y-5 pt-1">
      {/* Variant Selector (if hasVariants) */}
      {product.hasVariants && product.variants?.length > 0 && (
        <div className="space-y-2.5">
          <label className="text-xs font-bold uppercase tracking-wider text-slate-500">
            Select Option / Variant
          </label>
          <div className="flex flex-wrap gap-2">
            {product.variants.map((variant) => {
              const label = variant.attributes
                ? Object.values(variant.attributes).join(" / ")
                : variant.sku;
              const isSelected = selectedVariant?.id === variant.id;
              const isVariantOutOfStock = variant.stock <= 0;

              return (
                <button
                  key={variant.id}
                  type="button"
                  disabled={isVariantOutOfStock}
                  onClick={() => {
                    setSelectedVariant(variant);
                    setQuantity(1);
                  }}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all border cursor-pointer ${
                    isSelected
                      ? "bg-slate-900 text-white border-slate-900 shadow-xs scale-102"
                      : isVariantOutOfStock
                        ? "bg-slate-50 text-slate-300 border-slate-200 line-through cursor-not-allowed"
                        : "bg-white text-slate-700 border-slate-200 hover:border-slate-300"
                  }`}
                >
                  {label}
                  {isVariantOutOfStock && " (Sold Out)"}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Quantity Stepper Row */}
      <div className="flex items-center gap-3">
        <label className="text-xs font-bold text-slate-700 w-16 shrink-0">
          Quantity:
        </label>
        <div className="inline-flex items-center border border-slate-200 rounded-xl bg-white p-1 shadow-2xs">
          <Button
            type="button"
            onClick={() => setQuantity((q) => Math.max(1, q - 1))}
            disabled={quantity <= 1 || isOutOfStock}
            variant="outline"
            size="icon"
            aria-label="Decrease quantity"
            className="size-8 rounded-lg border-slate-200 text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <Minus className="w-3.5 h-3.5" />
          </Button>

          <span className="w-10 text-center text-sm font-extrabold text-slate-900">
            {quantity}
          </span>

          <Button
            type="button"
            onClick={() => setQuantity((q) => Math.min(currentStock, q + 1))}
            disabled={quantity >= currentStock || isOutOfStock}
            variant="outline"
            size="icon"
            aria-label="Increase quantity"
            className="size-8 rounded-lg border-slate-200 text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
          </Button>
        </div>

        <span className="text-xs text-slate-400">
          {isOutOfStock
            ? "Unavailable"
            : `${currentStock} item${currentStock === 1 ? "" : "s"} available`}
        </span>
      </div>

      {/* Render Actions: Either Configured or Standard Reference UI */}
      {configuredActions && configuredActions.length > 0 ? (
        <div className="flex flex-wrap gap-2.5 pt-1">
          {configuredActions.map((action) => {
            const isFull = action.width === "full";
            const showIcon = action.display === "both" || action.display === "icon";
            const showLabel = action.display === "both" || action.display === "label";

            const widthClass = isFull ? "w-full" : "w-[calc(50%-0.35rem)]";

            switch (action.key) {
              case "addToCart":
                return (
                  <Button
                    key="addToCart"
                    type="button"
                    onClick={handleAddToCart}
                    disabled={isOutOfStock}
                    variant="outline"
                    className={`h-12 rounded-xl border-2 border-[var(--store-primary,#0f172a)] text-[var(--store-primary,#0f172a)] bg-[var(--store-primary,#0f172a)]/8 hover:bg-[var(--store-primary,#0f172a)]/18 font-extrabold text-sm transition-all shadow-2xs ${widthClass}`}
                  >
                    {showIcon && (
                      isAdded ? (
                        <Check className="w-4 h-4 text-emerald-600" />
                      ) : (
                        <ShoppingBag className="w-4 h-4" />
                      )
                    )}
                    {showLabel && (
                      <span>{isAdded ? "Added!" : action.label || "Add to Cart"}</span>
                    )}
                  </Button>
                );

              case "buyNow":
                return (
                  <Button
                    key="buyNow"
                    type="button"
                    onClick={handleBuyNow}
                    disabled={isOutOfStock || isBuying}
                    className={`h-12 rounded-xl bg-[var(--store-primary,#0f172a)] hover:opacity-90 text-white font-black text-sm tracking-wide shadow-md transition-all active:scale-[0.99] ${widthClass}`}
                  >
                    {showIcon && <Zap className="w-4 h-4 fill-current" />}
                    {showLabel && (
                      <span>{isBuying ? "Redirecting..." : action.label || "Buy Now"}</span>
                    )}
                  </Button>
                );

              case "whatsapp":
                return (
                  <a
                    key="whatsapp"
                    href={whatsappUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ backgroundColor: "#25D366" }}
                    className={`flex items-center justify-center gap-2 h-11 px-3 rounded-xl text-white font-bold text-xs shadow-xs hover:opacity-95 transition-all ${widthClass}`}
                  >
                    {showIcon && <MessageCircle className="w-4 h-4 fill-current" />}
                    {showLabel && <span>{action.label || "WhatsApp"}</span>}
                  </a>
                );

              case "messenger":
                return messengerUrl ? (
                  <a
                    key="messenger"
                    href={messengerUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ backgroundColor: "#0084FF" }}
                    className={`flex items-center justify-center gap-2 h-11 px-3 rounded-xl text-white font-bold text-xs shadow-xs hover:opacity-95 transition-all ${widthClass}`}
                  >
                    {showIcon && <MessageSquare className="w-4 h-4 fill-current" />}
                    {showLabel && <span>{action.label || "Messenger"}</span>}
                  </a>
                ) : null;

              case "call":
                return (
                  <a
                    key="call"
                    href={hotlineUrl}
                    className={`flex items-center justify-center gap-2 h-11 px-3 rounded-xl bg-slate-900 text-white hover:bg-slate-800 font-bold text-xs shadow-xs transition-all ${widthClass}`}
                  >
                    {showIcon && <PhoneCall className="w-4 h-4 text-emerald-400" />}
                    {showLabel && (
                      <span>{action.label ? `${action.label}: ${targetPhone}` : `Call: ${targetPhone}`}</span>
                    )}
                  </a>
                );

              case "wishlist":
                return (
                  <Button
                    key="wishlist"
                    type="button"
                    onClick={handleWishlistToggle}
                    variant="outline"
                    className={`h-11 rounded-xl border-slate-200 text-slate-700 hover:text-rose-600 hover:border-rose-200 font-semibold text-xs ${widthClass}`}
                  >
                    <Heart
                      className={`w-4 h-4 ${isWishlisted ? "fill-rose-600 text-rose-600" : ""}`}
                    />
                    {showLabel && (
                      <span>
                        {isWishlisted
                          ? "In Wishlist"
                          : action.label || "Add to Wishlist"}
                      </span>
                    )}
                  </Button>
                );

              default:
                return null;
            }
          })}
        </div>
      ) : (
        /* Standard Default High-Converting 2-Column Action Buttons */
        <div className="space-y-3 pt-1">
          {/* Main Action Buttons: Add to Cart (Light outline) & Buy Now (Primary bold) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Button
              type="button"
              onClick={handleAddToCart}
              disabled={isOutOfStock}
              variant="outline"
              className="h-12 w-full rounded-xl border-2 border-[var(--store-primary,#0f172a)] text-[var(--store-primary,#0f172a)] bg-[var(--store-primary,#0f172a)]/8 hover:bg-[var(--store-primary,#0f172a)]/18 font-extrabold text-sm transition-all shadow-2xs"
            >
              {isAdded ? (
                <>
                  <Check className="w-4 h-4 text-emerald-600" />
                  <span>Added to Cart!</span>
                </>
              ) : (
                <>
                  <ShoppingBag className="w-4 h-4" />
                  <span>Add to Cart</span>
                </>
              )}
            </Button>

            <Button
              type="button"
              onClick={handleBuyNow}
              disabled={isOutOfStock || isBuying}
              className="h-12 w-full rounded-xl bg-[var(--store-primary,#0f172a)] hover:opacity-95 text-white font-black text-sm tracking-wide shadow-md transition-all active:scale-[0.99]"
            >
              <Zap className="w-4 h-4 fill-current" />
              <span>{isBuying ? "Redirecting..." : "Buy Now"}</span>
            </Button>
          </div>

          {/* Social Quick Order Bar */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              style={{ backgroundColor: "#25D366" }}
              className="flex items-center justify-center gap-2 h-11 px-4 rounded-xl text-white font-bold text-xs shadow-xs hover:opacity-95 transition-all cursor-pointer"
            >
              <MessageCircle className="w-4 h-4 fill-current" />
              <span>WhatsApp Order</span>
            </a>

            {messengerUrl ? (
              <a
                href={messengerUrl}
                target="_blank"
                rel="noopener noreferrer"
                style={{ backgroundColor: "#0084FF" }}
                className="flex items-center justify-center gap-2 h-11 px-4 rounded-xl text-white font-bold text-xs shadow-xs hover:opacity-95 transition-all cursor-pointer"
              >
                <MessageSquare className="w-4 h-4 fill-current" />
                <span>Messenger</span>
              </a>
            ) : (
              <a
                href={hotlineUrl}
                className="flex items-center justify-center gap-2 h-11 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-xs transition-all cursor-pointer"
              >
                <PhoneCall className="w-4 h-4 text-emerald-400" />
                <span>Hotline: {targetPhone}</span>
              </a>
            )}
          </div>

          {/* Hotline full-width row if messenger was displayed */}
          {messengerUrl && (
            <a
              href={hotlineUrl}
              className="flex items-center justify-center gap-2 w-full h-10 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold text-xs border border-slate-200/80 transition-colors"
            >
              <PhoneCall className="w-4 h-4 text-emerald-600" />
              <span>Hotline Call: {targetPhone}</span>
            </a>
          )}

          {/* Wishlist button */}
          <div className="pt-1">
            <Button
              type="button"
              onClick={handleWishlistToggle}
              variant="outline"
              className="w-full h-10 rounded-xl border-slate-200 text-slate-700 hover:text-rose-600 hover:border-rose-200 font-semibold text-xs transition-colors"
            >
              <Heart
                className={`w-4 h-4 ${isWishlisted ? "fill-rose-600 text-rose-600" : ""}`}
              />
              <span>{isWishlisted ? "In Wishlist" : "Add to Wishlist"}</span>
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

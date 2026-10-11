"use client";

import { toast } from "sonner";
import { ShoppingBag, Zap } from "lucide-react";
import { formatCurrency } from "@/shared/lib/utils";
import { useProductPurchase } from "./product-purchase-provider";

export function MobileStickyBuyBar() {
  const {
    currency,
    currentPrice,
    currentStock,
    isOutOfStock,
    addToCart,
  } = useProductPurchase();

  const handlePurchase = () => {
    const result = addToCart();
    if (!result.ok) {
      toast.error(
        result.reason === "OUT_OF_STOCK"
          ? "This product is out of stock"
          : "Maximum available quantity is already in your cart",
      );
    }
  };

  return (
    <div className="fixed inset-x-0 bottom-0 z-30 border-t border-slate-200 bg-white/95 px-4 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] shadow-[0_-8px_24px_rgba(15,23,42,0.08)] backdrop-blur md:hidden">
      <div className="mx-auto flex max-w-7xl items-center gap-3">
        <div className="min-w-0 shrink-0">
          <p className="text-lg font-extrabold leading-tight text-slate-900">
            {formatCurrency(currentPrice, currency)}
          </p>
          <p
            className={`mt-1 text-[11px] font-bold ${
              isOutOfStock
                ? "text-rose-600"
                : currentStock <= 5
                  ? "text-amber-600"
                  : "text-emerald-600"
            }`}
          >
            {isOutOfStock
              ? "Out of stock"
              : currentStock <= 5
                ? `Only ${currentStock} left`
                : "In stock"}
          </p>
        </div>
        <div className="flex min-w-0 flex-1 gap-2">
          <button
            type="button"
            onClick={handlePurchase}
            disabled={isOutOfStock}
            className="flex min-h-11 flex-1 items-center justify-center gap-1.5 rounded-xl border border-[var(--store-primary)] px-2 text-xs font-bold text-[var(--store-primary)] transition-opacity hover:opacity-80 disabled:cursor-not-allowed disabled:border-slate-200 disabled:text-slate-400"
          >
            <ShoppingBag className="h-4 w-4 shrink-0" />
            Add to Cart
          </button>
          <button
            type="button"
            onClick={handlePurchase}
            disabled={isOutOfStock}
            className="flex min-h-11 flex-1 items-center justify-center gap-1.5 rounded-xl bg-[var(--store-primary)] px-2 text-xs font-bold text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-400"
          >
            <Zap className="h-4 w-4 shrink-0" />
            Buy Now
          </button>
        </div>
      </div>
    </div>
  );
}

"use client";

import { useState } from "react";
import { toast } from "sonner";
import { useProductPurchase } from "./product-purchase-provider";
import { cn, formatCurrency } from "@/shared/lib/utils";
import { ShoppingBag, Check, Plus, Minus, AlertCircle } from "lucide-react";
import { Badge } from "@/shared/ui/badge";
import { Button } from "@/shared/ui/button";

export function AddToCartCTA() {
  const {
    product,
    currency,
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

  const handleAddToCart = () => {
    const result = addToCart();
    if (!result.ok) {
      toast.error(
        result.reason === "OUT_OF_STOCK"
          ? "This product is out of stock"
          : "Maximum available quantity is already in your cart",
      );
      return;
    }

    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Price & Stock status */}
      <div className="flex items-baseline justify-between">
        <div className="flex items-baseline gap-3">
          <span className="text-3xl font-extrabold text-slate-900">
            {formatCurrency(currentPrice, currency)}
          </span>
          {product.salePrice && product.salePrice < product.price && (
            <span className="text-lg text-slate-400 line-through">
              {formatCurrency(product.price, currency)}
            </span>
          )}
        </div>

        {/* Stock Badge */}
        {isOutOfStock ? (
          <Badge
            variant="secondary"
            className="gap-1.5 bg-rose-50 text-rose-700"
          >
            <AlertCircle className="h-3.5 w-3.5" />
            Out of Stock
          </Badge>
        ) : currentStock <= 5 ? (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-50 text-amber-700 text-xs font-bold rounded-full">
            Only {currentStock} left!
          </span>
        ) : (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-700 text-xs font-bold rounded-full">
            In Stock
          </span>
        )}
      </div>

      {/* Variant Selector (if hasVariants) */}
      {product.hasVariants && product.variants?.length > 0 && (
        <div className="space-y-3">
          <h4 className="text-xs uppercase font-bold text-slate-500 tracking-wider">
            Select Variant
          </h4>
          <div className="flex flex-wrap gap-2.5">
            {product.variants.map((variant) => {
              const label = variant.attributes
                ? Object.values(variant.attributes).join(" / ")
                : variant.sku;
              const isSelected = selectedVariant?.id === variant.id;

              return (
                <button
                  key={variant.id}
                  onClick={() => {
                    setSelectedVariant(variant);
                    setQuantity(1);
                  }}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all border cursor-pointer ${
                    isSelected
                      ? "bg-slate-900 text-white border-slate-900 shadow-xs"
                      : "bg-white text-slate-700 border-slate-200 hover:border-slate-300"
                  }`}
                >
                  {label}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Quantity Stepper & Add to Cart button */}
      <div className="flex items-center gap-4 pt-2">
        <div className="flex items-center border border-slate-200 rounded-xl bg-white p-1">
          <Button
            onClick={() => setQuantity((q) => Math.max(1, q - 1))}
            disabled={quantity <= 1 || isOutOfStock}
            variant="outline"
            size="icon"
            aria-label="Decrease quantity"
            className="size-9 rounded-lg border-slate-200 text-slate-600 hover:bg-slate-100"
          >
            <Minus className="w-4 h-4" />
          </Button>
          <span className="w-10 text-center text-sm font-bold text-slate-900">
            {quantity}
          </span>
          <Button
            onClick={() => setQuantity((q) => Math.min(currentStock, q + 1))}
            disabled={quantity >= currentStock || isOutOfStock}
            variant="outline"
            size="icon"
            aria-label="Increase quantity"
            className="size-9 rounded-lg border-slate-200 text-slate-600 hover:bg-slate-100"
          >
            <Plus className="w-4 h-4" />
          </Button>
        </div>

        <Button
          onClick={handleAddToCart}
          disabled={isOutOfStock}
          size="lg"
          className={cn(
            "w-full flex-1 rounded-xl px-6 font-bold shadow-xs",
            isAdded
              ? "bg-emerald-600 text-white hover:bg-emerald-600"
              : "disabled:bg-slate-200 disabled:text-slate-400",
          )}
        >
          {isAdded ? (
            <>
              <Check className="w-5 h-5" /> Added to Shopping Bag
            </>
          ) : (
            <>
              <ShoppingBag className="w-5 h-5" /> Add to Shopping Bag
            </>
          )}
        </Button>
      </div>
    </div>
  );
}

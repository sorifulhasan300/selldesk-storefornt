"use client";

import { useState } from "react";
import { Product, ProductVariant } from "@/types";
import { useCartStore } from "@/store/use-cart-store";
import { formatCurrency } from "@/lib/utils";
import { ShoppingBag, Check, Plus, Minus, AlertCircle } from "lucide-react";

interface AddToCartCTAProps {
  product: Product;
  currency?: string;
}

export function AddToCartCTA({ product, currency = "USD" }: AddToCartCTAProps) {
  const addItem = useCartStore((s) => s.addItem);
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(
    product.variants?.[0] || null,
  );
  const [quantity, setQuantity] = useState(1);
  const [isAdded, setIsAdded] = useState(false);

  const currentPrice = selectedVariant
    ? (selectedVariant.salePrice ?? selectedVariant.price)
    : (product.salePrice ?? product.price);

  const currentStock = selectedVariant ? selectedVariant.stock : product.stock;
  const isOutOfStock = currentStock <= 0;

  const handleAddToCart = () => {
    if (isOutOfStock) return;

    const variantTitle = selectedVariant?.attributes
      ? Object.entries(selectedVariant.attributes)
          .map(([k, v]) => `${k}: ${v}`)
          .join(", ")
      : undefined;

    addItem({
      id: `${product.id}-${selectedVariant?.id || "base"}`,
      productId: product.id,
      variantId: selectedVariant?.id,
      name: product.name,
      price: currentPrice,
      quantity,
      image:
        product.images?.[0] ||
        "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&auto=format&fit=crop&q=80",
      variantTitle,
      maxStock: currentStock,
    });

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
          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-rose-50 text-rose-700 text-xs font-bold rounded-full">
            <AlertCircle className="w-3.5 h-3.5" /> Out of Stock
          </span>
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
          <button
            onClick={() => setQuantity((q) => Math.max(1, q - 1))}
            disabled={quantity <= 1 || isOutOfStock}
            className="p-2 hover:bg-slate-100 rounded-lg text-slate-600 disabled:opacity-40"
          >
            <Minus className="w-4 h-4" />
          </button>
          <span className="w-10 text-center text-sm font-bold text-slate-900">
            {quantity}
          </span>
          <button
            onClick={() => setQuantity((q) => Math.min(currentStock, q + 1))}
            disabled={quantity >= currentStock || isOutOfStock}
            className="p-2 hover:bg-slate-100 rounded-lg text-slate-600 disabled:opacity-40"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>

        <button
          onClick={handleAddToCart}
          disabled={isOutOfStock}
          className={`flex-1 py-3.5 px-6 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all shadow-xs cursor-pointer ${
            isAdded
              ? "bg-emerald-600 text-white"
              : "bg-blue-600 hover:bg-blue-700 text-white disabled:bg-slate-200 disabled:text-slate-400 disabled:cursor-not-allowed"
          }`}
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
        </button>
      </div>
    </div>
  );
}

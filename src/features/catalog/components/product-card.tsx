"use client";

import Link from "next/link";
import Image from "next/image";
import { Product } from "@/shared/types";
import { formatCurrency } from "@/shared/lib/utils";
import { useCartStore } from "@/features/cart";
import { ShoppingBag, Check } from "lucide-react";
import { useState } from "react";

interface ProductCardProps {
  product: Product;
  currency?: string;
}

export function ProductCard({ product, currency = "USD" }: ProductCardProps) {
  const addItem = useCartStore((s) => s.addItem);
  const [added, setAdded] = useState(false);

  const primaryImage =
    product.images?.[0] ||
    "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&auto=format&fit=crop&q=80";

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    addItem({
      id: `${product.id}-base`,
      productId: product.id,
      name: product.name,
      price: product.salePrice ?? product.price,
      quantity: 1,
      image: primaryImage,
      maxStock: product.stock,
    });

    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  };

  const hasDiscount = product.salePrice && product.salePrice < product.price;

  return (
    <div className="group relative bg-white rounded-2xl border border-slate-200/80 overflow-hidden shadow-xs hover:shadow-lg transition-all duration-300 flex flex-col justify-between">
      <Link
        href={`/products/${product.slug}`}
        className="block relative aspect-square overflow-hidden bg-slate-100"
      >
        <Image
          src={primaryImage}
          alt={product.name}
          fill
          sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
          className="object-cover object-center group-hover:scale-105 transition-transform duration-500"
        />

        {hasDiscount && (
          <span className="absolute top-2.5 left-2.5 bg-rose-600 text-white text-[11px] font-bold px-2 py-0.5 rounded-full shadow-xs">
            Sale
          </span>
        )}

        {product.stock <= 0 && (
          <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px] flex items-center justify-center">
            <span className="bg-slate-900/90 text-white text-xs font-semibold px-3 py-1 rounded-md uppercase tracking-wider">
              Out of Stock
            </span>
          </div>
        )}
      </Link>

      <div className="p-4 flex flex-col flex-1 justify-between">
        <div>
          {product.category && (
            <p className="text-[11px] uppercase tracking-wider font-semibold text-slate-400 mb-1">
              {product.category.name}
            </p>
          )}

          <Link href={`/products/${product.slug}`}>
            <h3 className="text-sm font-semibold text-slate-800 line-clamp-2 hover:text-blue-600 transition-colors">
              {product.name}
            </h3>
          </Link>
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

          <button
            onClick={handleQuickAdd}
            disabled={product.stock <= 0}
            className={`p-2 rounded-xl transition-all duration-200 cursor-pointer ${
              added
                ? "bg-emerald-600 text-white"
                : "bg-slate-900 hover:bg-blue-600 text-white disabled:opacity-30 disabled:cursor-not-allowed"
            }`}
            title="Add to cart"
          >
            {added ? (
              <Check className="w-4 h-4" />
            ) : (
              <ShoppingBag className="w-4 h-4" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
}


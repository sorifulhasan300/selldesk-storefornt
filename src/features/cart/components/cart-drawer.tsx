"use client";

import { useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useCart } from "../hooks/use-cart";
import { formatCurrency } from "@/shared/lib/utils";
import { X, Trash2, Plus, Minus, ShoppingBag, ArrowRight } from "lucide-react";

interface CartDrawerProps {
  currency?: string;
  storeSlug?: string;
}

export function CartDrawer({
  currency = "USD",
  storeSlug,
}: CartDrawerProps) {
  const {
    items,
    isOpen,
    toggleDrawer,
    updateQuantity,
    removeItem,
    subtotal,
    itemCount,
  } = useCart(storeSlug);

  // Close drawer on Escape key and prevent background scroll while open
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        toggleDrawer(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = originalOverflow;
    };
  }, [isOpen, toggleDrawer]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden" role="dialog" aria-modal="true">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-xs transition-opacity duration-300"
        onClick={() => toggleDrawer(false)}
        aria-hidden="true"
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col justify-between">
          {/* Header */}
          <div className="p-5 border-b border-slate-200 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-slate-800" />
              <h2 className="font-bold text-lg text-slate-900">
                Your Cart ({itemCount})
              </h2>
            </div>
            <button
              onClick={() => toggleDrawer(false)}
              className="p-2 text-slate-400 hover:text-slate-600 rounded-lg cursor-pointer transition-colors"
              aria-label="Close cart drawer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Cart Item List */}
          <div className="flex-1 overflow-y-auto p-5 divide-y divide-slate-100">
            {items.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center py-12">
                <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 mb-4">
                  <ShoppingBag className="w-8 h-8" />
                </div>
                <h3 className="font-bold text-slate-800 text-lg">
                  Your cart is empty
                </h3>
                <p className="text-sm text-slate-500 mt-1 max-w-xs">
                  Discover trending products and add them to your shopping bag.
                </p>
                <button
                  onClick={() => toggleDrawer(false)}
                  className="mt-6 px-6 py-2.5 bg-[var(--store-primary)] text-white font-semibold rounded-xl text-sm hover:opacity-90 transition-opacity cursor-pointer"
                >
                  Start Shopping
                </button>
              </div>
            ) : (
              items.map((item) => {
                const isMax = item.quantity >= (item.maxStock ?? 99);
                return (
                  <div key={item.id} className="py-4 flex gap-4">
                    <div className="relative w-18 h-18 rounded-xl overflow-hidden bg-slate-100 shrink-0 border border-slate-100">
                      <Image
                        src={item.image}
                        alt={item.name}
                        fill
                        sizes="72px"
                        className="object-cover"
                      />
                    </div>

                    <div className="flex-1 flex flex-col justify-between">
                      <div>
                        <div className="flex justify-between items-start gap-2">
                          <h4 className="text-sm font-semibold text-slate-800 line-clamp-1">
                            {item.name}
                          </h4>
                          <button
                            onClick={() => removeItem(item.id)}
                            className="text-slate-400 hover:text-rose-600 transition-colors p-1 cursor-pointer"
                            aria-label={`Remove ${item.name} from cart`}
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>

                        {item.variantTitle && (
                          <p className="text-xs text-slate-400">
                            {item.variantTitle}
                          </p>
                        )}
                      </div>

                      <div className="flex items-center justify-between mt-2">
                        <div className="flex items-center border border-slate-200 rounded-lg">
                          <button
                            onClick={() => updateQuantity(item.id, -1)}
                            className="p-1 hover:bg-slate-100 text-slate-600 rounded-l-lg cursor-pointer"
                            aria-label="Decrease quantity"
                          >
                            <Minus className="w-3.5 h-3.5" />
                          </button>
                          <span className="px-2.5 text-xs font-semibold text-slate-800">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => updateQuantity(item.id, 1)}
                            disabled={isMax}
                            className="p-1 hover:bg-slate-100 text-slate-600 rounded-r-lg disabled:opacity-30 cursor-pointer"
                            aria-label="Increase quantity"
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        <span className="text-sm font-bold text-slate-900">
                          {formatCurrency(item.price * item.quantity, currency)}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Footer Checkout CTA */}
          {items.length > 0 && (
            <div className="p-5 border-t border-slate-200 bg-slate-50 space-y-4">
              <div className="flex justify-between text-base font-bold text-slate-900">
                <span>Subtotal</span>
                <span>{formatCurrency(subtotal, currency)}</span>
              </div>
              <p className="text-xs text-slate-500">
                Taxes and shipping calculated during checkout.
              </p>

              <div className="space-y-2">
                <Link
                  href="/checkout"
                  onClick={() => toggleDrawer(false)}
                  className="w-full bg-[var(--store-primary)] hover:opacity-90 text-white font-bold py-3 px-4 rounded-xl flex items-center justify-center gap-2 shadow-xs transition-opacity"
                >
                  <span>Checkout Now</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>

                <Link
                  href="/cart"
                  onClick={() => toggleDrawer(false)}
                  className="w-full block text-center py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors"
                >
                  View Full Cart Details
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

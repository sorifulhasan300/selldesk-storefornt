"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCart } from "../hooks/use-cart";
import { formatCurrency } from "@/shared/lib/utils";
import { Trash2, Plus, Minus, ShoppingBag, ArrowRight } from "lucide-react";
import { Button } from "@/shared/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetTitle,
} from "@/shared/ui/sheet";

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
  const router = useRouter();

  return (
    <Sheet open={isOpen} onOpenChange={toggleDrawer}>
      <SheetContent
        side="right"
        className="h-full w-full max-w-md gap-0 overflow-hidden p-0 sm:max-w-md"
      >
        {/* Header */}
        <div className="flex items-center border-b border-slate-200 p-5 pr-12">
          <div className="flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-slate-800" />
            <SheetTitle className="text-lg font-bold text-slate-900">
              Your Cart ({itemCount})
            </SheetTitle>
          </div>
          <SheetDescription className="sr-only">
            Review and update the items in your shopping cart.
          </SheetDescription>
        </div>

        {/* Cart Item List */}
        <div className="flex-1 divide-y divide-slate-100 overflow-y-auto p-5">
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
              <Button
                onClick={() => toggleDrawer(false)}
                className="mt-6 rounded-xl px-6 text-sm font-semibold"
              >
                Start Shopping
              </Button>
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
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => removeItem(item.id)}
                          className="size-7 text-slate-400 hover:text-rose-600"
                          aria-label={`Remove ${item.name} from cart`}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>

                      {item.variantTitle && (
                        <p className="text-xs text-slate-400">
                          {item.variantTitle}
                        </p>
                      )}
                    </div>

                    <div className="flex items-center justify-between mt-2">
                      <div className="flex items-center border border-slate-200 rounded-lg">
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => updateQuantity(item.id, -1)}
                          className="size-7 rounded-l-lg rounded-r-none border-r-0 px-0 text-slate-600"
                          aria-label="Decrease quantity"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </Button>
                        <span className="px-2.5 text-xs font-semibold text-slate-800">
                          {item.quantity}
                        </span>
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => updateQuantity(item.id, 1)}
                          disabled={isMax}
                          className="size-7 rounded-l-none rounded-r-lg border-l-0 px-0 text-slate-600"
                          aria-label="Increase quantity"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </Button>
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
              <Button
                className="w-full rounded-xl py-3 font-bold"
                onClick={() => {
                  toggleDrawer(false);
                  router.push("/checkout");
                }}
              >
                <span>Checkout Now</span>
                <ArrowRight className="w-4 h-4" />
              </Button>

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
      </SheetContent>
    </Sheet>
  );
}

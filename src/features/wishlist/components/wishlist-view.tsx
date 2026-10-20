"use client";

import { useState } from "react";
import Link from "next/link";
import { Heart, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { ProductCard } from "@/features/catalog";
import { Badge } from "@/shared/ui/badge";
import { Button } from "@/shared/ui/button";
import { Skeleton } from "@/shared/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/shared/ui/dialog";
import type { Product, StorefrontProductCardConfig } from "@/shared/types";
import { useWishlistStore } from "../store/use-wishlist-store";

const EMPTY_PRODUCTS: Product[] = [];

export interface WishlistViewProps {
  storeSlug: string;
  currency: string;
  cardConfig?: StorefrontProductCardConfig;
}

export function WishlistView({
  storeSlug,
  currency,
  cardConfig,
}: WishlistViewProps) {
  const [isClearDialogOpen, setIsClearDialogOpen] = useState(false);
  const storeProducts = useWishlistStore(
    (state) => state.productsByStore[storeSlug],
  );
  const hasHydrated = useWishlistStore((state) => state.hasHydrated);
  const clearWishlist = useWishlistStore((state) => state.clearWishlist);

  const products =
    hasHydrated && storeProducts ? storeProducts : EMPTY_PRODUCTS;

  const handleClearWishlist = () => {
    clearWishlist(storeSlug);
    setIsClearDialogOpen(false);
    toast.success("Wishlist cleared");
  };

  // 1. Loading State: Render 4 skeleton product cards to eliminate layout shift (CLS)
  if (!hasHydrated) {
    return (
      <section className="space-y-6" aria-busy="true" aria-label="Loading wishlist">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-slate-200/80 pb-5">
          <div className="flex items-center gap-3">
            <Skeleton className="h-8 w-44 rounded-lg" />
            <Skeleton className="h-6 w-28 rounded-full" />
          </div>
          <Skeleton className="h-9 w-24 rounded-xl" />
        </div>
        <div className="grid grid-cols-2 gap-4 sm:gap-6 md:grid-cols-3 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <div
              key={index}
              className="flex flex-col justify-between overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-4 shadow-xs"
            >
              <Skeleton className="aspect-square w-full rounded-xl" />
              <div className="mt-4 space-y-2">
                <Skeleton className="h-4 w-4/5 rounded" />
                <Skeleton className="h-4 w-3/5 rounded" />
                <div className="flex items-center justify-between pt-2">
                  <Skeleton className="h-5 w-20 rounded" />
                </div>
                <Skeleton className="mt-3 h-9 w-full rounded-xl" />
              </div>
            </div>
          ))}
        </div>
      </section>
    );
  }

  // 2. Empty State
  if (products.length === 0) {
    return (
      <div className="mx-auto max-w-md py-16 text-center">
        <div className="mx-auto mb-5 flex size-20 items-center justify-center rounded-full bg-rose-50 text-rose-500 ring-8 ring-rose-50/50">
          <Heart className="size-10 stroke-[1.75]" />
        </div>
        <h1 className="text-2xl font-black tracking-tight text-slate-900 sm:text-3xl">
          Your wishlist is empty
        </h1>
        <p className="mt-2.5 text-sm text-slate-500 sm:text-base">
          Explore our collection and save your favorite items here.
        </p>
        <Link
          href="/products"
          className="mt-6 inline-flex items-center justify-center rounded-xl bg-(--store-primary) px-6 py-3.5 text-sm font-bold text-white shadow-xs transition-opacity hover:opacity-90 cursor-pointer"
        >
          Explore Products
        </Link>
      </div>
    );
  }

  // 3. Active State (products.length > 0)
  return (
    <section className="space-y-6">
      {/* Header Toolbar */}
      <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-slate-200/80 pb-5">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-black tracking-tight text-slate-900 sm:text-3xl">
            Your Wishlist
          </h1>
          <Badge
            variant="secondary"
            className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700"
          >
            {products.length} {products.length === 1 ? "item" : "items"} saved
          </Badge>
        </div>

        <div>
          <Dialog open={isClearDialogOpen} onOpenChange={setIsClearDialogOpen}>
            <DialogTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="gap-2 rounded-xl border-slate-200 text-slate-600 hover:border-rose-200 hover:bg-rose-50 hover:text-rose-600 transition-colors cursor-pointer"
              >
                <Trash2 className="size-4" />
                <span>Clear All</span>
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Clear Wishlist</DialogTitle>
                <DialogDescription>
                  Are you sure you want to remove all saved items from your wishlist? This action cannot be undone.
                </DialogDescription>
              </DialogHeader>
              <DialogFooter className="mt-4 flex flex-row justify-end gap-2">
                <Button
                  variant="outline"
                  onClick={() => setIsClearDialogOpen(false)}
                  className="rounded-xl cursor-pointer"
                >
                  Cancel
                </Button>
                <Button
                  variant="destructive"
                  onClick={handleClearWishlist}
                  className="rounded-xl bg-rose-600 text-white hover:bg-rose-700 cursor-pointer"
                >
                  Clear All
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </header>

      {/* Product Grid */}
      <div className="grid grid-cols-2 gap-4 sm:gap-6 md:grid-cols-3 lg:grid-cols-4">
        {products.map((product) => (
          <ProductCard
            key={product.id}
            product={product}
            currency={currency}
            storeSlug={storeSlug}
            cardConfig={cardConfig}
          />
        ))}
      </div>
    </section>
  );
}

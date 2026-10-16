"use client";

import Link from "next/link";
import { Heart } from "lucide-react";
import { ProductCard } from "@/features/catalog";
import { useWishlistStore } from "../store/use-wishlist-store";

export function WishlistView({
  storeSlug,
  currency,
}: {
  storeSlug: string;
  currency: string;
}) {
  const products = useWishlistStore(
    (state) => state.productsByStore[storeSlug] ?? [],
  );
  const hasHydrated = useWishlistStore((state) => state.hasHydrated);

  if (!hasHydrated) {
    return (
      <p className="py-12 text-center text-sm text-slate-500">
        Loading wishlist...
      </p>
    );
  }

  if (products.length === 0) {
    return (
      <div className="mx-auto max-w-md py-16 text-center">
        <Heart className="mx-auto size-10 text-slate-300" />
        <h1 className="mt-4 text-2xl font-black text-slate-900">
          Your wishlist is empty
        </h1>
        <p className="mt-2 text-sm text-slate-500">
          Save products here to find them again later.
        </p>
        <Link
          href="/products"
          className="mt-6 inline-flex rounded-xl bg-[var(--store-primary)] px-5 py-3 text-sm font-semibold text-white hover:opacity-90"
        >
          Browse products
        </Link>
      </div>
    );
  }

  return (
    <section className="space-y-6">
      <header className="border-b border-slate-200/80 pb-5">
        <h1 className="text-2xl font-black tracking-tight text-slate-900 sm:text-3xl">
          Your wishlist
        </h1>
        <p className="mt-2 text-sm text-slate-500">
          {products.length} saved {products.length === 1 ? "product" : "products"}
        </p>
      </header>
      <div className="grid grid-cols-2 gap-4 sm:gap-6 md:grid-cols-3 lg:grid-cols-4">
        {products.map((product) => (
          <ProductCard
            key={product.id}
            product={product}
            currency={currency}
            storeSlug={storeSlug}
          />
        ))}
      </div>
    </section>
  );
}

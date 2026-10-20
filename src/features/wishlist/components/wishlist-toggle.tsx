"use client";

import { Heart } from "lucide-react";
import type { Product } from "@/shared/types";
import { useWishlistStore } from "../store/use-wishlist-store";

export function WishlistToggle({
  storeSlug,
  product,
}: {
  storeSlug: string;
  product: Product;
}) {
  const isWishlisted = useWishlistStore((state) =>
    Boolean(
      state.productsByStore[storeSlug]?.some((item) => item.id === product.id),
    ),
  );
  const addProduct = useWishlistStore((state) => state.addProduct);
  const removeProduct = useWishlistStore((state) => state.removeProduct);

  return (
    <button
      type="button"
      onClick={() =>
        isWishlisted
          ? removeProduct(storeSlug, product.id)
          : addProduct(storeSlug, product)
      }
      aria-label={
        isWishlisted
          ? `Remove ${product.name} from wishlist`
          : `Add ${product.name} to wishlist`
      }
      aria-pressed={isWishlisted}
      title={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
      className="inline-flex size-9 items-center justify-center rounded-full border border-slate-200 bg-white/95 text-slate-600 shadow-sm transition-colors hover:text-rose-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-(--store-primary)"
    >
      <Heart
        className={`size-4 ${isWishlisted ? "fill-rose-600 text-rose-600" : ""}`}
      />
    </button>
  );
}

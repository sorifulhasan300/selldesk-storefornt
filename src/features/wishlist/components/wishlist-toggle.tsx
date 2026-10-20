"use client";

import type { MouseEvent } from "react";
import { Heart } from "lucide-react";
import { toast } from "sonner";
import type { Product } from "@/shared/types";
import { cn } from "@/shared/lib/utils";
import { useWishlistStore } from "../store/use-wishlist-store";

export interface WishlistToggleProps {
  storeSlug: string;
  product: Product;
  className?: string;
}

export function WishlistToggle({
  storeSlug,
  product,
  className,
}: WishlistToggleProps) {
  const isWishlisted = useWishlistStore((state) =>
    state.hasHydrated
      ? Boolean(
          state.productsByStore[storeSlug]?.some((item) => item.id === product.id),
        )
      : false,
  );
  const addProduct = useWishlistStore((state) => state.addProduct);
  const removeProduct = useWishlistStore((state) => state.removeProduct);

  const handleToggle = (e: MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();

    if (isWishlisted) {
      removeProduct(storeSlug, product.id);
      toast.info(`"${product.name}" removed from wishlist`);
    } else {
      addProduct(storeSlug, product);
      toast.success(`"${product.name}" added to wishlist`);
    }
  };

  return (
    <button
      type="button"
      onClick={handleToggle}
      aria-label={
        isWishlisted
          ? `Remove ${product.name} from wishlist`
          : `Add ${product.name} to wishlist`
      }
      aria-pressed={isWishlisted}
      title={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
      className={cn(
        "inline-flex size-9 items-center justify-center rounded-full border border-slate-200 bg-white/95 text-slate-600 shadow-sm transition-transform duration-150 active:scale-90 hover:text-rose-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-(--store-primary) cursor-pointer",
        className,
      )}
    >
      <Heart
        className={cn(
          "size-4 transition-colors",
          isWishlisted ? "fill-rose-600 text-rose-600" : "",
        )}
      />
    </button>
  );
}

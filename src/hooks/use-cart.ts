"use client";

import { useEffect, useState } from "react";
import { useCartStore } from "@/store/use-cart-store";

/**
 * Hydration-safe wrapper around useCartStore to prevent React 19 SSR mismatches
 */
export function useCart(storeSlug?: string) {
  const [isHydrated, setIsHydrated] = useState(false);
  const cart = useCartStore();

  useEffect(() => {
    setIsHydrated(true);
    if (storeSlug) {
      cart.initStore(storeSlug);
    }
  }, [storeSlug]);

  return {
    ...cart,
    isHydrated,
    // Return empty / 0 values during SSR to guarantee match
    items: isHydrated ? cart.items : [],
    itemCount: isHydrated ? cart.getItemCount() : 0,
    subtotal: isHydrated ? cart.getSubtotal() : 0,
    total: isHydrated ? cart.getTotal() : 0,
    discount: isHydrated ? cart.getDiscountAmount() : 0,
  };
}

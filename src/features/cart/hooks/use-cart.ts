"use client";

import { useEffect, useMemo } from "react";
import { useCartStore } from "../store/use-cart-store";
import { computeDiscount } from "../utils/cart.utils";

/**
 * Store-partitioned hook providing cart state and actions.
 * Adheres strictly to selector discipline (AGENT.md 4.2) and hydration safety (SKILL.md 2.2).
 */
export function useCart(storeSlug?: string) {
  const initStore = useCartStore((s) => s.initStore);
  const hasHydrated = useCartStore((s) => s.hasHydrated);

  useEffect(() => {
    if (hasHydrated && storeSlug) {
      initStore(storeSlug);
    }
  }, [hasHydrated, storeSlug, initStore]);

  // Granular selectors to prevent unnecessary re-renders
  const items = useCartStore((s) => s.items);
  const isOpen = useCartStore((s) => s.isOpen);
  const coupon = useCartStore((s) => s.coupon);
  const addItem = useCartStore((s) => s.addItem);
  const removeItem = useCartStore((s) => s.removeItem);
  const updateQuantity = useCartStore((s) => s.updateQuantity);
  const clearCart = useCartStore((s) => s.clearCart);
  const toggleDrawer = useCartStore((s) => s.toggleDrawer);
  const applyCoupon = useCartStore((s) => s.applyCoupon);

  const subtotal = useMemo(() => {
    if (!hasHydrated) return 0;
    return items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  }, [hasHydrated, items]);

  const itemCount = useMemo(() => {
    if (!hasHydrated) return 0;
    return items.reduce((sum, item) => sum + item.quantity, 0);
  }, [hasHydrated, items]);

  const discount = useMemo(() => {
    if (!hasHydrated) return 0;
    return computeDiscount(subtotal, coupon);
  }, [hasHydrated, subtotal, coupon]);

  const total = Math.max(0, subtotal - discount);

  return {
    items: hasHydrated ? items : [],
    isOpen,
    coupon: hasHydrated ? coupon : null,
    hasHydrated,
    isHydrated: hasHydrated,
    subtotal,
    discount,
    total,
    itemCount,
    addItem,
    removeItem,
    updateQuantity,
    clearCart,
    toggleDrawer,
    applyCoupon,
  };
}

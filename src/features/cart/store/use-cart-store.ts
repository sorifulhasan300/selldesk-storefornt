"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { CartItem, CouponDiscount } from "@/shared/types";

interface CartState {
  storeSlug: string;
  items: CartItem[];
  isOpen: boolean;
  coupon: CouponDiscount | null;

  // Actions
  initStore: (slug: string) => void;
  addItem: (item: CartItem) => void;
  removeItem: (itemId: string) => void;
  updateQuantity: (itemId: string, delta: number) => void;
  clearCart: () => void;
  toggleDrawer: (open?: boolean) => void;
  applyCoupon: (coupon: CouponDiscount | null) => void;

  // Selectors
  getSubtotal: () => number;
  getDiscountAmount: () => number;
  getTotal: () => number;
  getItemCount: () => number;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      storeSlug: "",
      items: [],
      isOpen: false,
      coupon: null,

      initStore: (slug: string) => {
        if (get().storeSlug !== slug) {
          set({ storeSlug: slug, items: [], coupon: null });
        }
      },

      addItem: (newItem) => {
        set((state) => {
          const existing = state.items.find((i) => i.id === newItem.id);
          if (existing) {
            const nextQty = Math.min(
              existing.quantity + newItem.quantity,
              newItem.maxStock || 99,
            );
            return {
              items: state.items.map((i) =>
                i.id === newItem.id ? { ...i, quantity: nextQty } : i,
              ),
              isOpen: true,
            };
          }
          return { items: [...state.items, newItem], isOpen: true };
        });
      },

      removeItem: (itemId) => {
        set((state) => ({
          items: state.items.filter((i) => i.id !== itemId),
        }));
      },

      updateQuantity: (itemId, delta) => {
        set((state) => ({
          items: state.items
            .map((item) => {
              if (item.id === itemId) {
                const nextQty = item.quantity + delta;
                return nextQty > 0
                  ? {
                      ...item,
                      quantity: Math.min(nextQty, item.maxStock || 99),
                    }
                  : null;
              }
              return item;
            })
            .filter(Boolean) as CartItem[],
        }));
      },

      clearCart: () => set({ items: [], coupon: null }),

      toggleDrawer: (open) =>
        set((state) => ({ isOpen: open !== undefined ? open : !state.isOpen })),

      applyCoupon: (coupon) => set({ coupon }),

      getSubtotal: () => {
        return get().items.reduce(
          (sum, item) => sum + item.price * item.quantity,
          0,
        );
      },

      getDiscountAmount: () => {
        const subtotal = get().getSubtotal();
        const coupon = get().coupon;
        if (!coupon || subtotal <= 0) return 0;

        if (coupon.type === "PERCENTAGE") {
          return (subtotal * coupon.amount) / 100;
        }
        return Math.min(coupon.amount, subtotal);
      },

      getTotal: () => {
        const subtotal = get().getSubtotal();
        const discount = get().getDiscountAmount();
        return Math.max(0, subtotal - discount);
      },

      getItemCount: () => {
        return get().items.reduce((sum, item) => sum + item.quantity, 0);
      },
    }),
    {
      name: "selldesk_storefront_cart",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        storeSlug: state.storeSlug,
        items: state.items,
        coupon: state.coupon,
      }),
    },
  ),
);


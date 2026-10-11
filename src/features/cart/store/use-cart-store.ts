"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { CartItem, CouponDiscount } from "@/shared/types";

const MAX_QTY_PER_LINE = 99;

export interface AddItemResult {
  ok: boolean;
  reason?: "OUT_OF_STOCK" | "MAX_REACHED";
  clamped?: boolean;
}

interface CartState {
  storeSlug: string;
  items: CartItem[];
  isOpen: boolean;
  coupon: CouponDiscount | null;
  hasHydrated: boolean;

  // Actions
  initStore: (slug: string) => void;
  addItem: (item: CartItem) => AddItemResult;
  removeItem: (itemId: string) => void;
  updateQuantity: (itemId: string, delta: number) => void;
  clearCart: () => void;
  toggleDrawer: (open?: boolean) => void;
  applyCoupon: (coupon: CouponDiscount | null) => void;
  setHasHydrated: (hydrated: boolean) => void;

  // Computations
  getSubtotal: () => number;
  getDiscountAmount: () => number;
  getTotal: () => number;
  getItemCount: () => number;
}

type PersistedCartState = Pick<CartState, "storeSlug" | "items" | "coupon">;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function isCouponDiscount(value: unknown): value is CouponDiscount {
  return (
    isRecord(value) &&
    typeof value.code === "string" &&
    (value.type === "PERCENTAGE" || value.type === "FIXED") &&
    typeof value.amount === "number" &&
    Number.isFinite(value.amount) &&
    typeof value.discountCalculated === "number" &&
    Number.isFinite(value.discountCalculated)
  );
}

function migrateCartState(persistedState: unknown): PersistedCartState {
  if (!isRecord(persistedState)) {
    return { storeSlug: "", items: [], coupon: null };
  }

  const items = Array.isArray(persistedState.items)
    ? persistedState.items.filter(
        (item): item is CartItem =>
          isRecord(item) &&
          typeof item.id === "string" &&
          typeof item.productId === "string" &&
          typeof item.name === "string" &&
          typeof item.price === "number" &&
          Number.isFinite(item.price) &&
          item.price >= 0 &&
          typeof item.quantity === "number" &&
          Number.isInteger(item.quantity) &&
          item.quantity > 0 &&
          typeof item.image === "string" &&
          typeof item.maxStock === "number" &&
          Number.isFinite(item.maxStock) &&
          item.maxStock >= 0 &&
          (item.variantId === undefined ||
            typeof item.variantId === "string") &&
          (item.variantTitle === undefined ||
            typeof item.variantTitle === "string"),
      )
    : [];
  const coupon = persistedState.coupon;

  return {
    storeSlug:
      typeof persistedState.storeSlug === "string"
        ? persistedState.storeSlug
        : "",
    items,
    coupon: isCouponDiscount(coupon) ? coupon : null,
  };
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      storeSlug: "",
      items: [],
      isOpen: false,
      coupon: null,
      hasHydrated: false,

      initStore: (slug: string) => {
        if (!get().hasHydrated) return;
        if (get().storeSlug !== slug) {
          set({ storeSlug: slug, items: [], coupon: null });
        }
      },

      setHasHydrated: (hydrated: boolean) => set({ hasHydrated: hydrated }),

      addItem: (newItem: CartItem): AddItemResult => {
        const key = newItem.id;
        const limit = Math.min(
          newItem.maxStock ?? MAX_QTY_PER_LINE,
          MAX_QTY_PER_LINE,
        );

        if (limit <= 0) {
          return { ok: false, reason: "OUT_OF_STOCK" };
        }

        const { items } = get();
        const existing = items.find((i) => i.id === key);
        const current = existing?.quantity ?? 0;
        const next = Math.min(current + newItem.quantity, limit);

        if (next === current && current >= limit) {
          return { ok: false, reason: "MAX_REACHED" };
        }

        const updatedItems = existing
          ? items.map((i) =>
              i.id === key ? { ...i, quantity: next, maxStock: limit } : i,
            )
          : [...items, { ...newItem, id: key, quantity: next, maxStock: limit }];

        set({
          items: updatedItems,
          isOpen: true,
        });

        return {
          ok: true,
          clamped: current + newItem.quantity > limit,
        };
      },

      removeItem: (itemId: string) => {
        const nextItems = get().items.filter((i) => i.id !== itemId);
        set({
          items: nextItems,
          coupon: nextItems.length === 0 ? null : get().coupon,
        });
      },

      updateQuantity: (itemId: string, delta: number) => {
        if (!Number.isInteger(delta) || delta === 0) return;

        const nextItems = get()
          .items.map((item) => {
            if (item.id === itemId) {
              const nextQty = item.quantity + delta;
              const limit = Math.min(
                item.maxStock ?? MAX_QTY_PER_LINE,
                MAX_QTY_PER_LINE,
              );
              if (nextQty <= 0) return null;
              return {
                ...item,
                quantity: Math.min(nextQty, limit),
              };
            }
            return item;
          })
          .filter((item): item is CartItem => item !== null);

        set({
          items: nextItems,
          coupon: nextItems.length === 0 ? null : get().coupon,
        });
      },

      clearCart: () => set({ items: [], coupon: null }),

      toggleDrawer: (open?: boolean) =>
        set((state) => ({ isOpen: open !== undefined ? open : !state.isOpen })),

      applyCoupon: (coupon: CouponDiscount | null) => set({ coupon }),

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
          const calculated = Math.round((subtotal * coupon.amount) / 100);
          return Math.max(0, Math.min(calculated, subtotal));
        }

        return Math.max(0, Math.min(coupon.amount, subtotal));
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
      version: 1,
      storage: createJSONStorage(() => localStorage),
      migrate: (persistedState) => migrateCartState(persistedState),
      partialize: (state) => ({
        storeSlug: state.storeSlug,
        items: state.items,
        coupon: state.coupon,
      }),
      onRehydrateStorage: () => () => {
        useCartStore.setState({ hasHydrated: true });
      },
    },
  ),
);

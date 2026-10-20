"use client";

import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import type { Product } from "@/shared/types";

export interface WishlistState {
  productsByStore: Record<string, Product[]>;
  hasHydrated: boolean;
  addProduct: (storeSlug: string, product: Product) => void;
  removeProduct: (storeSlug: string, productId: string) => void;
  clearWishlist: (storeSlug: string) => void;
  setHasHydrated: (hasHydrated: boolean) => void;
}

export const useWishlistStore = create<WishlistState>()(
  persist(
    (set) => ({
      productsByStore: {},
      hasHydrated: false,
      addProduct: (storeSlug, product) =>
        set((state) => {
          const products = state.productsByStore[storeSlug] ?? [];
          if (products.some((item) => item.id === product.id)) return state;
          return {
            productsByStore: {
              ...state.productsByStore,
              [storeSlug]: [...products, product],
            },
          };
        }),
      removeProduct: (storeSlug, productId) =>
        set((state) => ({
          productsByStore: {
            ...state.productsByStore,
            [storeSlug]: (state.productsByStore[storeSlug] ?? []).filter(
              (product) => product.id !== productId,
            ),
          },
        })),
      clearWishlist: (storeSlug) =>
        set((state) => ({
          productsByStore: {
            ...state.productsByStore,
            [storeSlug]: [],
          },
        })),
      setHasHydrated: (hasHydrated) => set({ hasHydrated }),
    }),
    {
      name: "selldesk_storefront_wishlist",
      version: 1,
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ productsByStore: state.productsByStore }),
      onRehydrateStorage: () => () => {
        useWishlistStore.getState().setHasHydrated(true);
      },
    },
  ),
);

"use client";

import React, { createContext, useContext, useMemo } from "react";
import type { StorefrontProductCardConfig } from "@/shared/types";

interface ProductCardContextValue {
  config?: StorefrontProductCardConfig;
  wishlist?: { active: boolean };
}

const ProductCardConfigContext = createContext<ProductCardContextValue>({});

export interface ProductCardConfigProviderProps {
  config?: StorefrontProductCardConfig;
  wishlist?: { active: boolean };
  children: React.ReactNode;
}

export function ProductCardConfigProvider({
  config,
  wishlist,
  children,
}: ProductCardConfigProviderProps) {
  const value = useMemo(() => ({ config, wishlist }), [config, wishlist]);

  return (
    <ProductCardConfigContext.Provider value={value}>
      {children}
    </ProductCardConfigContext.Provider>
  );
}

export function useProductCardConfig(): StorefrontProductCardConfig | undefined {
  return useContext(ProductCardConfigContext).config;
}

export function useProductCardWishlist(): { active: boolean } | undefined {
  return useContext(ProductCardConfigContext).wishlist;
}


"use client";

import React, { createContext, useContext } from "react";
import type { StorefrontProductCardConfig } from "@/shared/types";

const ProductCardConfigContext = createContext<
  StorefrontProductCardConfig | undefined
>(undefined);

export interface ProductCardConfigProviderProps {
  config?: StorefrontProductCardConfig;
  children: React.ReactNode;
}

export function ProductCardConfigProvider({
  config,
  children,
}: ProductCardConfigProviderProps) {
  return (
    <ProductCardConfigContext.Provider value={config}>
      {children}
    </ProductCardConfigContext.Provider>
  );
}

export function useProductCardConfig(): StorefrontProductCardConfig | undefined {
  return useContext(ProductCardConfigContext);
}


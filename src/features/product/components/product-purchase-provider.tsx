"use client";

import {
  createContext,
  type Dispatch,
  type ReactNode,
  type SetStateAction,
  useContext,
  useState,
} from "react";
import { useCartStore, type AddItemResult } from "@/features/cart";
import type { Product, ProductVariant } from "@/shared/types";

interface ProductPurchaseContextValue {
  product: Product;
  currency: string;
  selectedVariant: ProductVariant | null;
  setSelectedVariant: Dispatch<SetStateAction<ProductVariant | null>>;
  quantity: number;
  setQuantity: Dispatch<SetStateAction<number>>;
  currentPrice: number;
  currentStock: number;
  isOutOfStock: boolean;
  addToCart: () => AddItemResult;
}

interface ProductPurchaseProviderProps {
  product: Product;
  currency: string;
  children: ReactNode;
}

const ProductPurchaseContext =
  createContext<ProductPurchaseContextValue | null>(null);

export function ProductPurchaseProvider({
  product,
  currency,
  children,
}: ProductPurchaseProviderProps) {
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(
    product.variants?.[0] ?? null,
  );
  const [quantity, setQuantity] = useState(1);
  const addItem = useCartStore((state) => state.addItem);

  const currentPrice = selectedVariant
    ? (selectedVariant.salePrice ?? selectedVariant.price)
    : (product.salePrice ?? product.price);
  const currentStock = selectedVariant ? selectedVariant.stock : product.stock;
  const isOutOfStock = currentStock <= 0;

  const addToCart = () => {
    if (isOutOfStock) {
      return { ok: false, reason: "OUT_OF_STOCK" } as const;
    }

    const variantTitle = selectedVariant?.attributes
      ? Object.entries(selectedVariant.attributes)
          .map(([key, value]) => `${key}: ${value}`)
          .join(", ")
      : undefined;

    return addItem({
      id: `${product.id}-${selectedVariant?.id || "base"}`,
      productId: product.id,
      variantId: selectedVariant?.id,
      name: product.name,
      price: currentPrice,
      quantity,
      image: product.images?.[0] || "",
      variantTitle,
      maxStock: currentStock,
    });
  };

  return (
    <ProductPurchaseContext.Provider
      value={{
        product,
        currency,
        selectedVariant,
        setSelectedVariant,
        quantity,
        setQuantity,
        currentPrice,
        currentStock,
        isOutOfStock,
        addToCart,
      }}
    >
      {children}
    </ProductPurchaseContext.Provider>
  );
}

export function useProductPurchase() {
  const context = useContext(ProductPurchaseContext);
  if (!context) {
    throw new Error(
      "useProductPurchase must be used within ProductPurchaseProvider",
    );
  }
  return context;
}

import React from "react";
import type { Product, StorefrontProductCardConfig } from "@/shared/types";
import { ProductCard } from "@/features/catalog";

export interface ProductRelatedGridProps {
  products: Product[];
  currentProductId: string;
  currency?: string;
  storeSlug: string;
  cardConfig?: StorefrontProductCardConfig;
  showRelatedProducts?: boolean;
}

export function ProductRelatedGrid({
  products,
  currentProductId,
  currency = "BDT",
  storeSlug,
  cardConfig,
  showRelatedProducts = true,
}: ProductRelatedGridProps) {
  if (!showRelatedProducts) return null;

  // Exclude current viewing product and limit to 4
  const related = products
    .filter((p) => p.id !== currentProductId)
    .slice(0, 4);

  if (related.length === 0) return null;

  return (
    <section aria-labelledby="section-related-products" className="space-y-6 pt-10 border-t border-slate-200/80">
      <div className="flex items-center gap-2 border-l-4 border-[var(--store-primary,#0f172a)] pl-3.5 py-0.5">
        <h2
          id="section-related-products"
          className="text-lg sm:text-xl font-black text-slate-900 tracking-tight"
        >
          Related Products
        </h2>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
        {related.map((item) => (
          <ProductCard
            key={item.id}
            product={item}
            currency={currency}
            storeSlug={storeSlug}
            cardConfig={cardConfig}
          />
        ))}
      </div>
    </section>
  );
}


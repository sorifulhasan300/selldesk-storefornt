"use client";

import dynamic from "next/dynamic";
import { DynamicSectionRenderer } from "./DynamicSectionRenderer";
import type { HomePageSection, Product, StoreConfig } from "@/shared/types";

export interface StoreHomePageClientProps {
  initialSections: HomePageSection[];
  store: StoreConfig;
  currency?: string;
  products?: Product[];
  categories?: unknown[];
  sliders?: unknown[];
  isPreview?: boolean;
}

const StoreHomePagePreview = dynamic(
  () => import("./StoreHomePagePreview"),
);

export function StoreHomePageClient({
  initialSections,
  store,
  currency,
  products = [],
  categories = [],
  sliders = [],
  isPreview = false,
}: StoreHomePageClientProps) {
  const resolvedCurrency = currency || store?.currency || "USD";

  if (isPreview) {
    return (
      <StoreHomePagePreview
        initialSections={initialSections}
        currency={resolvedCurrency}
        products={products}
        categories={categories}
        sliders={sliders}
      />
    );
  }

  return (
    <div className="w-full">
      <DynamicSectionRenderer
        sections={initialSections}
        currency={resolvedCurrency}
        fallbackProducts={products}
        fallbackCategories={categories}
        fallbackSliders={sliders}
      />
    </div>
  );
}

export default StoreHomePageClient;

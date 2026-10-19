"use client";

import dynamic from "next/dynamic";
import { DynamicSectionRenderer } from "./DynamicSectionRenderer";
import { StorefrontHeroSlider } from "./StorefrontHeroSlider";
import type {
  HomePageSection,
  Product,
  StoreConfig,
  StorefrontProductCardConfig,
  StorefrontSliderConfig,
} from "@/shared/types";

export interface StoreHomePageClientProps {
  initialSections: HomePageSection[];
  store: StoreConfig;
  currency?: string;
  products?: Product[];
  categories?: unknown[];
  sliders?: unknown[];
  sliderConfig?: StorefrontSliderConfig | null;
  isPreview?: boolean;
  cardConfig?: StorefrontProductCardConfig;
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
  sliderConfig,
  isPreview = false,
  cardConfig,
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
        sliderConfig={sliderConfig}
        cardConfig={cardConfig}
      />
    );
  }

  return (
    <div className="w-full">
      <StorefrontHeroSlider
        sliders={sliders}
        sliderConfig={sliderConfig}
        currency={resolvedCurrency}
      />
      <DynamicSectionRenderer
        sections={initialSections}
        currency={resolvedCurrency}
        fallbackProducts={products}
        fallbackCategories={categories}
        fallbackSliders={sliders}
        sliderConfig={sliderConfig}
        cardConfig={cardConfig}
      />
    </div>
  );
}

export default StoreHomePageClient;

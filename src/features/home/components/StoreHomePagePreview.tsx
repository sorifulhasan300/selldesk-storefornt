"use client";

import { useLivePreviewSync } from "../preview/use-live-preview-sync";
import { DynamicSectionRenderer } from "./DynamicSectionRenderer";
import { StorefrontHeroSlider } from "./StorefrontHeroSlider";
import type {
  HomePageSection,
  Product,
  StorefrontProductCardConfig,
  StorefrontSliderConfig,
} from "@/shared/types";

interface StoreHomePagePreviewProps {
  initialSections: HomePageSection[];
  currency: string;
  products: Product[];
  categories: unknown[];
  sliders: unknown[];
  sliderConfig?: StorefrontSliderConfig | null;
  cardConfig?: StorefrontProductCardConfig;
}

export default function StoreHomePagePreview({
  initialSections,
  currency,
  products,
  categories,
  sliders,
  sliderConfig,
  cardConfig,
}: StoreHomePagePreviewProps) {
  const {
    sections,
    isPreview: isPreviewActive,
    selectedSectionId,
    sendBuilderAction,
  } = useLivePreviewSync(initialSections);

  return (
    <div className="w-full">
      <StorefrontHeroSlider
        sliders={sliders}
        sliderConfig={sliderConfig}
        currency={currency}
        isPreview={isPreviewActive}
      />
      <DynamicSectionRenderer
        sections={sections}
        currency={currency}
        fallbackProducts={products}
        fallbackCategories={categories}
        fallbackSliders={sliders}
        sliderConfig={sliderConfig}
        cardConfig={cardConfig}
        isPreview={isPreviewActive}
        selectedSectionId={selectedSectionId}
        onAction={sendBuilderAction}
      />
    </div>
  );
}

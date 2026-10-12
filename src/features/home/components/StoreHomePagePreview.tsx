"use client";

import { useLivePreviewSync } from "../preview/use-live-preview-sync";
import { DynamicSectionRenderer } from "./DynamicSectionRenderer";
import type { HomePageSection, Product } from "@/shared/types";

interface StoreHomePagePreviewProps {
  initialSections: HomePageSection[];
  currency: string;
  products: Product[];
  categories: unknown[];
  sliders: unknown[];
}

export default function StoreHomePagePreview({
  initialSections,
  currency,
  products,
  categories,
  sliders,
}: StoreHomePagePreviewProps) {
  const {
    sections,
    isPreview: isPreviewActive,
    selectedSectionId,
    sendBuilderAction,
  } = useLivePreviewSync(initialSections);

  return (
    <div className="w-full">
      <DynamicSectionRenderer
        sections={sections}
        currency={currency}
        fallbackProducts={products}
        fallbackCategories={categories}
        fallbackSliders={sliders}
        isPreview={isPreviewActive}
        selectedSectionId={selectedSectionId}
        onAction={sendBuilderAction}
      />
    </div>
  );
}

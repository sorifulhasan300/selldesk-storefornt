"use client";

import { useLivePreviewSync } from "../preview/use-live-preview-sync";
import { DynamicSectionRenderer } from "./DynamicSectionRenderer";
import { HomePageSection, Product, StoreConfig } from "@/shared/types";

interface StoreHomePageClientProps {
  initialSections: HomePageSection[];
  store: StoreConfig;
  currency?: string;
  products?: Product[];
  categories?: unknown[];
  sliders?: unknown[];
  isPreview?: boolean;
}

export function StoreHomePageClient({
  initialSections,
  store,
  currency,
  products = [],
  categories = [],
  sliders = [],
  isPreview = false,
}: StoreHomePageClientProps) {
  const {
    sections,
    isPreview: isPreviewActive,
    selectedSectionId,
    sendBuilderAction,
  } = useLivePreviewSync(initialSections, isPreview);

  return (
    <div className="w-full">
      <DynamicSectionRenderer
        sections={sections}
        currency={currency || store?.currency || "USD"}
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

export default StoreHomePageClient;

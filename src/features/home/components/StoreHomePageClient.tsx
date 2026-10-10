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
      {isPreviewActive && (
        <div className="mb-6 px-4 py-2 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs font-semibold flex items-center justify-between shadow-2xs">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
            </span>
            <span>
              Live Preview Mode Active &mdash; Changes sync automatically
            </span>
          </div>
          <span className="text-[10px] uppercase font-bold tracking-wider bg-amber-600 text-white px-2 py-0.5 rounded-md">
            Draft Sync
          </span>
        </div>
      )}

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


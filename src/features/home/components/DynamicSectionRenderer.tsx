"use client";

import React from "react";
import { HomePageSection, Product } from "@/shared/types";
import { DynamicSectionBlock } from "./DynamicSectionBlock";
import { getDefaultHomePageSections } from "../utils/default-sections";
import {
  HeroSliderBlock,
  CategoryGridBlock,
  ProductShowcaseBlock,
  VideoReelsBlock,
  CustomerReviewsBlock,
  BannerGridBlock,
  BrandShowcaseBlock,
} from "../sections";

interface DynamicSectionRendererProps {
  sections: HomePageSection[];
  currency?: string;
  fallbackProducts?: Product[];
  fallbackCategories?: unknown[];
  fallbackSliders?: unknown[];
  isPreview?: boolean;
  selectedSectionId?: string | null;
  onAction?: (actionType: string, sectionId: string) => void;
}

function resolveSectionBlock(
  section: HomePageSection,
  currency: string,
  fallbackProducts: Product[],
  fallbackSliders: unknown[],
  isPreview: boolean,
): React.ReactNode {
  const rawType = (section.type || section.key || "")
    .trim()
    .toLowerCase()
    .replace(/[-_]/g, "");

  switch (rawType) {
    case "heroslider":
      return (
        <HeroSliderBlock
          section={section}
          currency={currency}
          isPreview={isPreview}
          fallbackSliders={fallbackSliders}
        />
      );

    case "banners":
    case "banner":
      if (
        section.config?.displayType === "slider" ||
        section.config?.viewType === "slider" ||
        section.config?.displayMode === "slider" ||
        section.config?.displayMode === "carousel" ||
        section.config?.displayType === "carousel" ||
        section.config?.viewType === "carousel" ||
        section.config?.layout === "carousel" ||
        section.config?.isCarousel === true ||
        section.title?.toLowerCase().includes("hero") ||
        section.title?.toLowerCase().includes("slider") ||
        Boolean(
          section.config?.autoPlayInterval &&
            section.config?.displayMode !== "grid",
        )
      ) {
        return (
          <HeroSliderBlock
            section={section}
            currency={currency}
            isPreview={isPreview}
            fallbackSliders={fallbackSliders}
          />
        );
      }
      return <BannerGridBlock section={section} />;

    case "category":
    case "categories":
      return <CategoryGridBlock section={section} />;

    case "products":
    case "product":
      return (
        <ProductShowcaseBlock
          section={section}
          currency={currency}
          fallbackProducts={fallbackProducts}
        />
      );

    case "videos":
    case "video":
      return <VideoReelsBlock section={section} />;

    case "customerreviews":
    case "customerreview":
    case "reviews":
    case "testimonials":
      return <CustomerReviewsBlock section={section} />;

    case "brands":
    case "brand":
      return <BrandShowcaseBlock section={section} />;

    default:
      return null;
  }
}

export function DynamicSectionRenderer({
  sections = [],
  currency = "USD",
  fallbackProducts = [],
  fallbackCategories = [],
  fallbackSliders = [],
  isPreview = false,
  selectedSectionId,
  onAction,
}: DynamicSectionRendererProps) {
  const activeSections =
    Array.isArray(sections) && sections.length > 0
      ? sections.filter((s) => s.isActive !== false)
      : [];

  const displaySections: HomePageSection[] =
    activeSections.length > 0
      ? activeSections
      : getDefaultHomePageSections(
          fallbackSliders,
          fallbackCategories,
          fallbackProducts,
        );

  return (
    <div className="space-y-12 sm:space-y-16">
      {displaySections.map((section, idx) => {
        const blockContent = resolveSectionBlock(
          section,
          currency,
          fallbackProducts,
          fallbackSliders,
          isPreview,
        );
        if (!blockContent) return null;

        const uniqueKey =
          section.id || `${section.type || section.key || "sec"}-${idx}`;

        const isFirst = idx === 0;
        const isLast = idx === displaySections.length - 1;
        const isSelected = Boolean(
          selectedSectionId && section.id === selectedSectionId,
        );

        return (
          <DynamicSectionBlock
            key={uniqueKey}
            section={section}
            currency={currency}
            isPreview={isPreview}
            isSelected={isSelected}
            isFirst={isFirst}
            isLast={isLast}
            onAction={onAction}
          >
            {blockContent}
          </DynamicSectionBlock>
        );
      })}
    </div>
  );
}


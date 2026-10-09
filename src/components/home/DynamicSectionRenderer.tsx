"use client";

import React from "react";
import { HomePageSection, Product } from "@/types";
import { DynamicSectionBlock } from "./DynamicSectionBlock";
import {
  HeroSliderBlock,
  CategoryGridBlock,
  ProductShowcaseBlock,
  VideoReelsBlock,
  CustomerReviewsBlock,
  BannerGridBlock,
  BrandShowcaseBlock,
} from "./sections";

interface DynamicSectionRendererProps {
  sections: HomePageSection[];
  currency?: string;
  fallbackProducts?: Product[];
  fallbackCategories?: any[];
  fallbackSliders?: any[];
}

export function DynamicSectionRenderer({
  sections = [],
  currency = "USD",
  fallbackProducts = [],
  fallbackCategories = [],
  fallbackSliders = [],
}: DynamicSectionRendererProps) {
  // If no sections provided, build default scaffold sections
  const activeSections =
    Array.isArray(sections) && sections.length > 0
      ? sections.filter((s) => s.isActive !== false)
      : [];

  const displaySections: HomePageSection[] =
    activeSections.length > 0
      ? activeSections
      : [
          {
            id: "default-hero",
            type: "heroSlider",
            title: "Featured Collection",
            isActive: true,
            data: fallbackSliders,
          },
          {
            id: "default-categories",
            type: "category",
            title: "Shop By Category",
            subtitle: "Browse our curated departments",
            isActive: true,
            data: fallbackCategories,
            config: { columns: 6, mobileColumns: 2, showName: true },
          },
          {
            id: "default-products",
            type: "products",
            title: "Trending Now",
            subtitle: "Most popular selections this week",
            isActive: true,
            data: fallbackProducts,
            config: { columns: 4, mobileColumns: 2, showViewAll: true },
          },
        ];

  // Helper to resolve polymorphic section block
  const renderSectionBlock = (section: HomePageSection, index: number) => {
    const rawType = (section.type || section.key || "")
      .trim()
      .toLowerCase()
      .replace(/[-_]/g, "");

    switch (rawType) {
      case "heroslider":
        return <HeroSliderBlock section={section} currency={currency} />;

      case "banners":
      case "banner":
        // If configured as slider or designated as hero banner, render hero slider block
        if (
          section.config?.displayType === "slider" ||
          section.config?.viewType === "slider" ||
          section.title?.toLowerCase().includes("hero")
        ) {
          return <HeroSliderBlock section={section} currency={currency} />;
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
        console.warn(`[DynamicSectionRenderer] Unrecognized section type: "${section.type}" at index ${index}`);
        return null;
    }
  };

  return (
    <div className="space-y-12 sm:space-y-16">
      {displaySections.map((section, idx) => {
        const blockContent = renderSectionBlock(section, idx);
        if (!blockContent) return null;

        const uniqueKey =
          section.id || `${section.type || section.key || "sec"}-${idx}`;

        return (
          <DynamicSectionBlock
            key={uniqueKey}
            section={section}
            currency={currency}
          >
            {blockContent}
          </DynamicSectionBlock>
        );
      })}
    </div>
  );
}


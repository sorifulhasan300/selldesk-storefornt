"use client";

import React from "react";
import {
  HomePageSection,
  Product,
  StorefrontSliderConfig,
} from "@/shared/types";
import { DynamicSectionBlock } from "./DynamicSectionBlock";
import { resolveSectionBlock } from "./section-block-resolver";
import { isHeroSliderSection } from "../utils/home-section.utils";

interface DynamicSectionRendererProps {
  sections: HomePageSection[];
  currency?: string;
  fallbackProducts?: Product[];
  fallbackCategories?: unknown[];
  fallbackSliders?: unknown[];
  sliderConfig?: StorefrontSliderConfig | null;
  isPreview?: boolean;
  selectedSectionId?: string | null;
  onAction?: (actionType: string, sectionId: string) => void;
}

export function DynamicSectionRenderer({
  sections = [],
  currency = "USD",
  fallbackProducts = [],
  fallbackCategories = [],
  fallbackSliders = [],
  sliderConfig,
  isPreview = false,
  selectedSectionId,
  onAction,
}: DynamicSectionRendererProps) {
  const seenSectionIds = new Set<string>();
  const activeSections =
    Array.isArray(sections) && sections.length > 0
      ? sections
          .map((section, index) => ({ section, index }))
          .filter(({ section }) => {
            if (section.isActive === false || isHeroSliderSection(section)) {
              return false;
            }
            if (!isPreview && section.id) {
              if (seenSectionIds.has(section.id)) return false;
              seenSectionIds.add(section.id);
            }
            return true;
          })
          .sort(
            (left, right) =>
              (left.section.order ??
                left.section.sortOrder ??
                left.index) -
              (right.section.order ??
                right.section.sortOrder ??
                right.index),
          )
          .map(({ section }) => section)
      : [];

  const displaySections: HomePageSection[] = activeSections;

  if (displaySections.length === 0) {
    return null;
  }

  return (
    <div className="w-full">
      {displaySections.map((section, idx) => {
        const blockContent = resolveSectionBlock({
          section,
          currency,
          fallbackProducts,
          isPreview,
        });
        if (!blockContent) return null;

        const uniqueKey =
          section.id || `${section.type || section.key || "section"}-${idx}`;

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

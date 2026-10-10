"use client";

import React from "react";
import { HomePageSection } from "@/shared/types";
import { DynamicSectionHeader } from "./DynamicSectionHeader";
import { SectionPreviewToolbar } from "../preview/SectionPreviewToolbar";
import {
  buildSectionStyleVariables,
  resolveSectionVisibilityClass,
} from "../utils/section-styles.utils";
import { cn } from "@/shared/lib/utils";

interface DynamicSectionBlockProps {
  section: HomePageSection;
  children: React.ReactNode;
  currency?: string;
  isPreview?: boolean;
  isSelected?: boolean;
  isFirst?: boolean;
  isLast?: boolean;
  onAction?: (actionType: string, sectionId: string) => void;
}

export function DynamicSectionBlock({
  section,
  children,
  isPreview = false,
  isSelected = false,
  isFirst = false,
  isLast = false,
  onAction,
}: DynamicSectionBlockProps) {
  if (section.isActive === false) {
    return null;
  }

  const visibilityClass = resolveSectionVisibilityClass(section.styles);
  if (visibilityClass === "hidden") {
    return null;
  }

  const containerStyle = buildSectionStyleVariables(section.styles);
  const sectionId = section.id || `section-${section.type || "block"}`;

  return (
    <section
      id={sectionId}
      data-section-id={section.id}
      style={containerStyle}
      onClick={() => {
        if (isPreview && section.id) {
          onAction?.("SELECT_SECTION", section.id);
        }
      }}
      className={cn(
        "group relative w-full transition-all duration-200",
        visibilityClass,
        "pt-[var(--pt-mobile)] pb-[var(--pb-mobile)] sm:pt-[var(--pt-desktop)] sm:pb-[var(--pb-desktop)]",
        "mt-[var(--mt-mobile)] mb-[var(--mb-mobile)] sm:mt-[var(--mt-desktop)] sm:mb-[var(--mb-desktop)]",
      )}
    >
      {isPreview && (
        <>
          {/* Dashed blue border outline on hover or selected */}
          <div
            className={cn(
              "pointer-events-none absolute inset-0 z-20 rounded-xl border-2 border-dashed border-sky-400 transition-opacity duration-150",
              isSelected
                ? "opacity-100 ring-2 ring-sky-400/20"
                : "opacity-0 group-hover:opacity-100",
            )}
          />

          {/* Floating action pill on hover or selected */}
          <div
            className={cn(
              "absolute top-2 left-3 z-30 transition-opacity duration-150",
              isSelected
                ? "opacity-100 pointer-events-auto"
                : "opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto",
            )}
          >
            <SectionPreviewToolbar
              type={section.type || section.key}
              isFirst={isFirst}
              isLast={isLast}
              onEdit={() =>
                section.id && onAction?.("SELECT_SECTION", section.id)
              }
              onDuplicate={() =>
                section.id && onAction?.("DUPLICATE_SECTION", section.id)
              }
              onMoveUp={() =>
                section.id && onAction?.("MOVE_SECTION_UP", section.id)
              }
              onMoveDown={() =>
                section.id && onAction?.("MOVE_SECTION_DOWN", section.id)
              }
              onRemove={() =>
                section.id && onAction?.("REMOVE_SECTION", section.id)
              }
            />
          </div>
        </>
      )}

      <DynamicSectionHeader section={section} />
      <div className="w-full">{children}</div>
    </section>
  );
}

export default DynamicSectionBlock;


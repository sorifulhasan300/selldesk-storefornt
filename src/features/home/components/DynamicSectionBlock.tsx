"use client";

import React from "react";
import { HomePageSection } from "@/shared/types";
import { DynamicSectionHeader } from "./DynamicSectionHeader";
import { SectionPreviewToolbar } from "../preview/SectionPreviewToolbar";
import {
  buildSectionStyleVariables,
  getSectionContainerClass,
  resolveSectionVisibilityClass,
  SECTION_SPACING_CLASSES,
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

const previewOutlineClasses = (selected: boolean) =>
  cn(
    "outline outline-2 -outline-offset-2 outline-dashed",
    selected ? "outline-sky-500" : "outline-transparent hover:outline-sky-400",
  );

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
  const containerClass = getSectionContainerClass(section);

  return (
    <section
      id={sectionId}
      data-section-id={section.id}
      aria-labelledby={section.id ? `section-title-${section.id}` : undefined}
      style={containerStyle}
      onClick={() => {
        if (isPreview && section.id) {
          onAction?.("SELECT_SECTION", section.id);
        }
      }}
      className={cn(
        "group relative w-full transition-all duration-200",
        visibilityClass,
        SECTION_SPACING_CLASSES,
        isPreview && previewOutlineClasses(isSelected),
      )}
    >
      {isPreview && (
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
      )}

      <div className={cn("w-full", containerClass)}>
        <DynamicSectionHeader section={section} />
        {children}
      </div>
    </section>
  );
}

export default DynamicSectionBlock;


"use client";

import React from "react";
import { HomePageSection } from "@/types";
import { DynamicSectionHeader } from "./DynamicSectionHeader";
import {
  buildSectionStyleVariables,
  resolveSectionVisibilityClass,
} from "./utils/section-styles.utils";

interface DynamicSectionBlockProps {
  section: HomePageSection;
  children: React.ReactNode;
  currency?: string;
}

export function DynamicSectionBlock({
  section,
  children,
}: DynamicSectionBlockProps) {
  if (section.isActive === false) {
    return null;
  }

  const visibilityClass = resolveSectionVisibilityClass(section.styles);
  if (visibilityClass === "hidden") {
    return null;
  }

  const containerStyle = buildSectionStyleVariables(section.styles);

  return (
    <section
      id={section.id || `section-${section.type || "block"}`}
      style={containerStyle}
      className={`w-full transition-all duration-200 ${visibilityClass} pt-[var(--pt-mobile)] pb-[var(--pb-mobile)] sm:pt-[var(--pt-desktop)] sm:pb-[var(--pb-desktop)] mt-[var(--mt-mobile)] mb-[var(--mb-mobile)] sm:mt-[var(--mt-desktop)] sm:mb-[var(--mb-desktop)]`}
    >
      <DynamicSectionHeader section={section} />
      <div className="w-full">{children}</div>
    </section>
  );
}

import React from "react";
import Link from "next/link";
import { HomePageSection, SectionStyles } from "@/shared/types";
import { ArrowRight } from "lucide-react";

interface DynamicSectionHeaderProps {
  section: HomePageSection;
}

export function DynamicSectionHeader({ section }: DynamicSectionHeaderProps) {
  const styles: SectionStyles = section.styles || {};
  const config = section.config || {};

  const titleText =
    typeof section.title === "string"
      ? section.title
      : typeof config.title === "string"
      ? config.title
      : undefined;

  const subtitleText =
    typeof section.subtitle === "string"
      ? section.subtitle
      : typeof config.subtitle === "string"
      ? config.subtitle
      : undefined;

  const isHero =
    (section.type || "").toLowerCase().includes("hero") ||
    section.key === "heroSlider";

  const shouldRender =
    Boolean(titleText) &&
    config.showTitle !== false &&
    (!isHero || config.showTitle === true);

  if (!shouldRender || !titleText) {
    return null;
  }

  const titleAlign = styles.titleAlignment || styles.titleAlign || "left";
  const titleFontSize =
    typeof styles.titleFontSize === "number"
      ? `${styles.titleFontSize}px`
      : styles.titleFontSize;

  const subtitleFontSize =
    typeof styles.subtitleFontSize === "number"
      ? `${styles.subtitleFontSize}px`
      : styles.subtitleFontSize;

  const headerAlignmentClass =
    titleAlign === "center"
      ? "text-center items-center justify-center"
      : titleAlign === "right"
      ? "text-right items-end justify-end"
      : "text-left items-start justify-between";

  const showViewAll = config.showViewAll === true;
  const viewAllUrl =
    typeof config.categoryId === "string"
      ? `/products?categoryId=${config.categoryId}`
      : "/products";

  return (
    <div
      className={`flex flex-col sm:flex-row gap-2 mb-6 ${headerAlignmentClass}`}
    >
      <div className={titleAlign === "center" ? "mx-auto" : ""}>
        <h2
          style={{
            fontSize: titleFontSize,
            fontWeight: styles.titleFontWeight,
            color: styles.titleColor,
            lineHeight: styles.titleLineHeight,
          }}
          className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight"
        >
          {titleText}
        </h2>
        {subtitleText && (
          <p
            style={{
              fontSize: subtitleFontSize,
              color: styles.subtitleColor,
            }}
            className="text-xs sm:text-sm text-slate-500 mt-1 max-w-2xl"
          >
            {subtitleText}
          </p>
        )}
      </div>

      {showViewAll && titleAlign !== "center" && (
        <Link
          href={viewAllUrl}
          className="hidden sm:inline-flex items-center gap-1 text-xs sm:text-sm font-bold text-blue-600 hover:text-blue-700 hover:underline shrink-0"
        >
          <span>View All</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      )}
    </div>
  );
}


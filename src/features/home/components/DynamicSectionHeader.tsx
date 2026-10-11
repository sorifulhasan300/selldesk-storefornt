import React from "react";
import Link from "next/link";
import { HomePageSection, SectionStyles } from "@/shared/types";
import { safeColor } from "../utils/section-styles.utils";
import { cn } from "@/shared/lib/utils";
import { ArrowRight } from "lucide-react";

interface DynamicSectionHeaderProps {
  section: HomePageSection;
}

function formatFontSize(val: unknown): string | undefined {
  if (val === undefined || val === null || val === "") return undefined;
  if (typeof val === "number" && Number.isFinite(val) && val > 0) return `${val}px`;
  if (typeof val === "string") {
    const trimmed = val.trim();
    if (!trimmed) return undefined;
    if (/^\d+(\.\d+)?$/.test(trimmed)) return `${trimmed}px`;
    if (/^\d+(\.\d+)?(px|rem|em|%)$/.test(trimmed)) return trimmed;
  }
  return undefined;
}

function safeFontWeight(
  val: unknown,
): React.CSSProperties["fontWeight"] | undefined {
  if (val === undefined || val === null || val === "") return undefined;
  if (typeof val === "number" && val >= 100 && val <= 900) return val;
  if (typeof val === "string") {
    const trimmed = val.trim();
    if (/^[1-9]00$/.test(trimmed)) return Number(trimmed);
    const lower = trimmed.toLowerCase();
    if (["normal", "bold", "lighter", "bolder"].includes(lower)) {
      return lower as React.CSSProperties["fontWeight"];
    }
  }
  return undefined;
}

function safeFontStyle(val: unknown): "normal" | "italic" | undefined {
  if (typeof val === "string") {
    const trimmed = val.trim().toLowerCase();
    if (trimmed === "italic" || trimmed === "normal") return trimmed;
  }
  return undefined;
}

function formatLetterSpacing(val: unknown): string | undefined {
  if (val === undefined || val === null || val === "") return undefined;
  if (typeof val === "number" && Number.isFinite(val)) return `${val}px`;
  if (typeof val === "string") {
    const trimmed = val.trim();
    if (!trimmed) return undefined;
    if (/^-?\d+(\.\d+)?$/.test(trimmed)) return `${trimmed}px`;
    if (
      /^-?\d+(\.\d+)?(px|em|rem|%)$/.test(trimmed) ||
      trimmed === "normal"
    ) {
      return trimmed;
    }
  }
  return undefined;
}

function formatLineHeight(val: unknown): string | number | undefined {
  if (val === undefined || val === null || val === "") return undefined;
  if (typeof val === "number" && Number.isFinite(val) && val > 0) return val;
  if (typeof val === "string") {
    const trimmed = val.trim();
    if (!trimmed) return undefined;
    const parsed = parseFloat(trimmed);
    if (Number.isFinite(parsed) && /^\d+(\.\d+)?$/.test(trimmed)) return parsed;
    if (
      /^\d+(\.\d+)?(px|rem|em|%)$/.test(trimmed) ||
      trimmed === "normal"
    ) {
      return trimmed;
    }
  }
  return undefined;
}

function safeHref(v: unknown): string | null {
  if (typeof v !== "string") return null;
  const s = v.trim();
  if (s.startsWith("/") && !s.startsWith("//")) return s;
  try {
    const u = new URL(s);
    return u.protocol === "https:" || u.protocol === "http:" ? u.toString() : null;
  } catch {
    return null;
  }
}

export function DynamicSectionHeader({ section }: DynamicSectionHeaderProps) {
  const styles: SectionStyles = section.styles || {};
  const config = section.config || {};

  const rawTitle =
    typeof section.title === "string"
      ? section.title
      : typeof config.title === "string"
      ? config.title
      : undefined;

  const rawSubtitle =
    typeof section.subtitle === "string"
      ? section.subtitle
      : typeof config.subtitle === "string"
      ? config.subtitle
      : undefined;

  const titleText =
    rawTitle && rawTitle.trim().length > 0 ? rawTitle.trim() : undefined;
  const subtitleText =
    rawSubtitle && rawSubtitle.trim().length > 0
      ? rawSubtitle.trim()
      : undefined;

  const hasTitle = Boolean(titleText && config.showTitle !== false);
  const hasSubtitle = Boolean(subtitleText);

  if (!hasTitle && !hasSubtitle) {
    return null;
  }

  const typeStr = (section.type || section.key || "")
    .toLowerCase()
    .replace(/[-_]/g, "");
  const isSlider =
    config.displayType === "slider" || config.viewType === "slider";
  const isHero =
    typeStr === "heroslider" || (typeStr === "banners" && isSlider);

  if (isHero && config.showTitle !== true) {
    return null;
  }

  const titleAlign = styles.titleAlignment || styles.titleAlign || "left";

  const titleStyles: React.CSSProperties = {
    fontSize: formatFontSize(styles.titleFontSize ?? config.titleFontSize),
    fontWeight: safeFontWeight(styles.titleFontWeight ?? config.titleFontWeight),
    fontStyle: safeFontStyle(styles.titleFontStyle ?? config.titleFontStyle),
    letterSpacing: formatLetterSpacing(
      styles.titleLetterSpacing ?? config.titleLetterSpacing,
    ),
    lineHeight: formatLineHeight(
      styles.titleLineHeight ?? config.titleLineHeight,
    ),
    color: safeColor(styles.titleColor ?? config.titleColor),
  };

  const subtitleStyles: React.CSSProperties = {
    fontSize: formatFontSize(
      styles.subtitleFontSize ?? config.subtitleFontSize,
    ),
    fontWeight: safeFontWeight(
      styles.subtitleFontWeight ?? config.subtitleFontWeight,
    ),
    fontStyle: safeFontStyle(
      styles.subtitleFontStyle ?? config.subtitleFontStyle,
    ),
    letterSpacing: formatLetterSpacing(
      styles.subtitleLetterSpacing ?? config.subtitleLetterSpacing,
    ),
    lineHeight: formatLineHeight(
      styles.subtitleLineHeight ?? config.subtitleLineHeight,
    ),
    color: safeColor(styles.subtitleColor ?? config.subtitleColor),
  };

  const headerAlignmentClass =
    titleAlign === "center"
      ? "text-center items-center justify-center"
      : titleAlign === "right"
      ? "text-right items-end justify-end"
      : "text-left items-start justify-between";

  const showViewAll = config.showViewAll === true;
  const rawViewAllUrl =
    typeof config.viewAllUrl === "string"
      ? config.viewAllUrl
      : typeof config.categoryId === "string"
      ? `/products?categoryId=${encodeURIComponent(config.categoryId)}`
      : "/products";
  const viewAllUrl = safeHref(rawViewAllUrl);

  return (
    <div
      className={cn(
        "flex flex-col sm:flex-row gap-2 mb-6",
        headerAlignmentClass,
      )}
    >
      <div className={titleAlign === "center" ? "mx-auto" : ""}>
        {hasTitle && (
          <h2
            id={section.id ? `section-title-${section.id}` : undefined}
            style={titleStyles}
            className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight"
          >
            {titleText}
          </h2>
        )}
        {hasSubtitle && (
          <p
            style={subtitleStyles}
            className={cn(
              "text-xs sm:text-sm text-slate-500 max-w-2xl",
              hasTitle && "mt-1",
            )}
          >
            {subtitleText}
          </p>
        )}
      </div>

      {showViewAll && viewAllUrl && titleAlign !== "center" && (
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


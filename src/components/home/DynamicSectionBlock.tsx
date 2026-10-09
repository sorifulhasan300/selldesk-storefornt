"use client";

import React from "react";
import Link from "next/link";
import { HomePageSection, SectionStyles } from "@/types";
import { ArrowRight } from "lucide-react";

interface DynamicSectionBlockProps {
  section: HomePageSection;
  children: React.ReactNode;
  currency?: string;
}

function parsePx(val: number | string | undefined, defaultVal: number): number {
  if (val === undefined || val === null) return defaultVal;
  if (typeof val === "number") return val;
  const parsed = parseFloat(val);
  return isNaN(parsed) ? defaultVal : parsed;
}

export function DynamicSectionBlock({
  section,
  children,
}: DynamicSectionBlockProps) {
  // If explicitly disabled in config, skip rendering
  if (section.isActive === false) {
    return null;
  }

  const styles: SectionStyles = section.styles || {};
  const config = section.config || {};

  // Responsive Visibility
  const hideOnMobile = Boolean(styles.hideOnMobile);
  const hideOnDesktop = Boolean(styles.hideOnDesktop);

  if (hideOnMobile && hideOnDesktop) {
    return null;
  }

  const visibilityClass = hideOnMobile
    ? "hidden sm:block"
    : hideOnDesktop
    ? "sm:hidden"
    : "block";

  // Spacing Calculations (Numeric px values for desktop and mobile)
  const dPt = parsePx(styles.paddingTop, 0);
  const dPb = parsePx(styles.paddingBottom, 0);
  const mPt = parsePx(styles.mobilePaddingTop, dPt > 0 ? Math.min(dPt, 24) : 0);
  const mPb = parsePx(styles.mobilePaddingBottom, dPb > 0 ? Math.min(dPb, 24) : 0);

  const dMt = parsePx(styles.marginTop, 0);
  const dMb = parsePx(styles.marginBottom, 0);
  const mMt = parsePx(styles.mobileMarginTop, dMt > 0 ? Math.min(dMt, 16) : 0);
  const mMb = parsePx(styles.mobileMarginBottom, dMb > 0 ? Math.min(dMb, 16) : 0);

  // Background styling
  const isGradient = styles.backgroundType === "gradient" && styles.backgroundGradient;
  const background = isGradient
    ? styles.backgroundGradient
    : styles.backgroundColor || undefined;
  const backgroundImage =
    !isGradient && styles.backgroundImage ? `url(${styles.backgroundImage})` : undefined;

  // Border styling
  const borderColor = styles.borderColor || undefined;
  const borderStyle = styles.borderStyle || (borderColor ? "solid" : undefined);
  const borderWidthTop = styles.borderWidthTop ? `${styles.borderWidthTop}px` : undefined;
  const borderWidthRight = styles.borderWidthRight ? `${styles.borderWidthRight}px` : undefined;
  const borderWidthBottom = styles.borderWidthBottom ? `${styles.borderWidthBottom}px` : undefined;
  const borderWidthLeft = styles.borderWidthLeft ? `${styles.borderWidthLeft}px` : undefined;

  // Border radius
  const borderRadiusTopLeft = styles.borderRadiusTopLeft
    ? `${styles.borderRadiusTopLeft}px`
    : styles.borderRadius
    ? typeof styles.borderRadius === "number"
      ? `${styles.borderRadius}px`
      : styles.borderRadius
    : undefined;

  const borderRadiusTopRight = styles.borderRadiusTopRight
    ? `${styles.borderRadiusTopRight}px`
    : styles.borderRadius
    ? typeof styles.borderRadius === "number"
      ? `${styles.borderRadius}px`
      : styles.borderRadius
    : undefined;

  const borderRadiusBottomRight = styles.borderRadiusBottomRight
    ? `${styles.borderRadiusBottomRight}px`
    : styles.borderRadius
    ? typeof styles.borderRadius === "number"
      ? `${styles.borderRadius}px`
      : styles.borderRadius
    : undefined;

  const borderRadiusBottomLeft = styles.borderRadiusBottomLeft
    ? `${styles.borderRadiusBottomLeft}px`
    : styles.borderRadius
    ? typeof styles.borderRadius === "number"
      ? `${styles.borderRadius}px`
      : styles.borderRadius
    : undefined;

  // Compose CSS styles object with custom CSS properties for responsive padding/margin
  const containerStyle: React.CSSProperties = {
    // Spacing variables
    "--pt-mobile": `${mPt}px`,
    "--pb-mobile": `${mPb}px`,
    "--pt-desktop": `${dPt}px`,
    "--pb-desktop": `${dPb}px`,
    "--mt-mobile": `${mMt}px`,
    "--mb-mobile": `${mMb}px`,
    "--mt-desktop": `${dMt}px`,
    "--mb-desktop": `${dMb}px`,

    // Backgrounds
    background,
    backgroundImage,
    backgroundSize: "cover",
    backgroundPosition: "center",

    // Borders
    borderColor,
    borderStyle,
    borderTopWidth: borderWidthTop,
    borderRightWidth: borderWidthRight,
    borderBottomWidth: borderWidthBottom,
    borderLeftWidth: borderWidthLeft,

    // Border Radius
    borderTopLeftRadius: borderRadiusTopLeft,
    borderTopRightRadius: borderRadiusTopRight,
    borderBottomRightRadius: borderRadiusBottomRight,
    borderBottomLeftRadius: borderRadiusBottomLeft,

    // Shadows
    boxShadow: styles.boxShadow || undefined,
  } as React.CSSProperties;

  // Section Heading Logic
  const titleText = section.title || config.title;
  const subtitleText = section.subtitle || config.subtitle;
  const isHeroSlider =
    (section.type || "").toLowerCase().includes("hero") ||
    section.key === "heroSlider";

  // By default, show header if title is available and showTitle is not false (except for heroSlider)
  const shouldRenderHeader =
    Boolean(titleText) &&
    config.showTitle !== false &&
    (!isHeroSlider || config.showTitle === true);

  // Typography Preferences
  const titleAlign = styles.titleAlignment || styles.titleAlign || "left";
  const titleFontSize = styles.titleFontSize
    ? typeof styles.titleFontSize === "number"
      ? `${styles.titleFontSize}px`
      : styles.titleFontSize
    : undefined;

  const titleFontWeight = styles.titleFontWeight || undefined;
  const titleColor = styles.titleColor || undefined;
  const titleLineHeight = styles.titleLineHeight || undefined;

  const subtitleFontSize = styles.subtitleFontSize
    ? typeof styles.subtitleFontSize === "number"
      ? `${styles.subtitleFontSize}px`
      : styles.subtitleFontSize
    : undefined;
  const subtitleColor = styles.subtitleColor || undefined;

  // Alignment classes
  const headerAlignmentClass =
    titleAlign === "center"
      ? "text-center items-center justify-center"
      : titleAlign === "right"
      ? "text-right items-end justify-end"
      : "text-left items-start justify-between";

  const showViewAll = config.showViewAll === true;
  const viewAllUrl = config.categoryId
    ? `/products?categoryId=${config.categoryId}`
    : "/products";

  return (
    <section
      id={section.id || `section-${section.type || "block"}`}
      style={containerStyle}
      className={`w-full transition-all duration-200 ${visibilityClass} pt-[var(--pt-mobile)] pb-[var(--pb-mobile)] sm:pt-[var(--pt-desktop)] sm:pb-[var(--pb-desktop)] mt-[var(--mt-mobile)] mb-[var(--mb-mobile)] sm:mt-[var(--mt-desktop)] sm:mb-[var(--mb-desktop)]`}
    >
      {/* Section Heading & Subheading */}
      {shouldRenderHeader && (
        <div
          className={`flex flex-col sm:flex-row gap-2 mb-6 ${headerAlignmentClass}`}
        >
          <div className={titleAlign === "center" ? "mx-auto" : ""}>
            <h2
              style={{
                fontSize: titleFontSize,
                fontWeight: titleFontWeight,
                color: titleColor,
                lineHeight: titleLineHeight,
              }}
              className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight"
            >
              {titleText}
            </h2>
            {subtitleText && (
              <p
                style={{
                  fontSize: subtitleFontSize,
                  color: subtitleColor,
                }}
                className="text-xs sm:text-sm text-slate-500 mt-1 max-w-2xl"
              >
                {subtitleText}
              </p>
            )}
          </div>

          {/* Optional View All CTA in header */}
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
      )}

      {/* Block Body Content */}
      <div className="w-full">{children}</div>
    </section>
  );
}


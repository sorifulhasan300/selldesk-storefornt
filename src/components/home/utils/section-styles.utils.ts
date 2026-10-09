import React from "react";
import { SectionStyles } from "@/types";

export function parsePx(
  val: number | string | undefined,
  defaultVal: number,
): number {
  if (val === undefined || val === null) return defaultVal;
  if (typeof val === "number") return val;
  const parsed = parseFloat(val);
  return isNaN(parsed) ? defaultVal : parsed;
}

export function resolveSectionVisibilityClass(styles?: SectionStyles): string {
  if (!styles) return "block";
  if (styles.hideOnMobile && styles.hideOnDesktop) return "hidden";
  if (styles.hideOnMobile) return "hidden sm:block";
  if (styles.hideOnDesktop) return "sm:hidden";
  return "block";
}

export function buildSectionStyleVariables(
  styles?: SectionStyles,
): React.CSSProperties {
  if (!styles) return {};

  const dPt = parsePx(styles.paddingTop, 0);
  const dPb = parsePx(styles.paddingBottom, 0);
  const mPt = parsePx(styles.mobilePaddingTop, dPt > 0 ? Math.min(dPt, 24) : 0);
  const mPb = parsePx(styles.mobilePaddingBottom, dPb > 0 ? Math.min(dPb, 24) : 0);

  const dMt = parsePx(styles.marginTop, 0);
  const dMb = parsePx(styles.marginBottom, 0);
  const mMt = parsePx(styles.mobileMarginTop, dMt > 0 ? Math.min(dMt, 16) : 0);
  const mMb = parsePx(styles.mobileMarginBottom, dMb > 0 ? Math.min(dMb, 16) : 0);

  const isGradient =
    styles.backgroundType === "gradient" && styles.backgroundGradient;
  const background = isGradient
    ? styles.backgroundGradient
    : styles.backgroundColor || undefined;
  const backgroundImage =
    !isGradient && styles.backgroundImage
      ? `url(${styles.backgroundImage})`
      : undefined;

  const borderColor = styles.borderColor || undefined;
  const borderStyle = styles.borderStyle || (borderColor ? "solid" : undefined);
  const borderWidthTop = styles.borderWidthTop ? `${styles.borderWidthTop}px` : undefined;
  const borderWidthRight = styles.borderWidthRight ? `${styles.borderWidthRight}px` : undefined;
  const borderWidthBottom = styles.borderWidthBottom ? `${styles.borderWidthBottom}px` : undefined;
  const borderWidthLeft = styles.borderWidthLeft ? `${styles.borderWidthLeft}px` : undefined;

  const formatRadius = (val?: number | string) =>
    val !== undefined
      ? typeof val === "number"
        ? `${val}px`
        : val
      : undefined;

  return {
    "--pt-mobile": `${mPt}px`,
    "--pb-mobile": `${mPb}px`,
    "--pt-desktop": `${dPt}px`,
    "--pb-desktop": `${dPb}px`,
    "--mt-mobile": `${mMt}px`,
    "--mb-mobile": `${mMb}px`,
    "--mt-desktop": `${dMt}px`,
    "--mb-desktop": `${dMb}px`,

    background,
    backgroundImage,
    backgroundSize: "cover",
    backgroundPosition: "center",

    borderColor,
    borderStyle,
    borderTopWidth: borderWidthTop,
    borderRightWidth: borderWidthRight,
    borderBottomWidth: borderWidthBottom,
    borderLeftWidth: borderWidthLeft,

    borderTopLeftRadius: formatRadius(styles.borderRadiusTopLeft ?? styles.borderRadius),
    borderTopRightRadius: formatRadius(styles.borderRadiusTopRight ?? styles.borderRadius),
    borderBottomRightRadius: formatRadius(styles.borderRadiusBottomRight ?? styles.borderRadius),
    borderBottomLeftRadius: formatRadius(styles.borderRadiusBottomLeft ?? styles.borderRadius),

    boxShadow: styles.boxShadow || undefined,
  } as React.CSSProperties;
}

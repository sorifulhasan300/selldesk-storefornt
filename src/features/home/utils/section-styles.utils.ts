import React from "react";
import { HomePageSection, SectionStyles } from "@/shared/types";

const MAX_SPACING = 400;

export function parsePx(
  val: unknown,
  defaultVal: number,
): number {
  if (val === undefined || val === null || val === "") return defaultVal;
  const n = typeof val === "number" ? val : parseFloat(String(val));
  if (!Number.isFinite(n)) return defaultVal;
  return Math.min(Math.max(n, 0), MAX_SPACING);
}

export function parsePxOrUndef(val: unknown): number | undefined {
  const n = parsePx(val, NaN);
  return Number.isNaN(n) ? undefined : n;
}

export function resolveSectionVisibilityClass(styles?: SectionStyles): string {
  if (!styles) return "block";
  if (styles.hideOnMobile && styles.hideOnDesktop) return "hidden";
  if (styles.hideOnMobile) return "max-sm:hidden";
  if (styles.hideOnDesktop) return "sm:hidden";
  return "block";
}

const COLOR_REGEX =
  /^(#[0-9a-f]{3,8}|rgba?\([\d\s.,%]+\)|hsla?\([\d\s.,%]+\)|transparent)$/i;

export function safeColor(v: unknown): string | undefined {
  if (typeof v !== "string") return undefined;
  const s = v.trim();
  return COLOR_REGEX.test(s) ? s : undefined;
}

export const SECTION_SPACING_CLASSES =
  "pt-[var(--pt-mobile,0px)] pb-[var(--pb-mobile,0px)] pl-[var(--pl-mobile,0px)] pr-[var(--pr-mobile,0px)] " +
  "mt-[var(--mt-mobile,0px)] mb-[var(--mb-mobile,0px)] ml-[var(--ml-mobile,0px)] mr-[var(--mr-mobile,0px)] " +
  "sm:pt-[var(--pt-desktop,0px)] sm:pb-[var(--pb-desktop,0px)] sm:pl-[var(--pl-desktop,0px)] sm:pr-[var(--pr-desktop,0px)] " +
  "sm:mt-[var(--mt-desktop,0px)] sm:mb-[var(--mb-desktop,0px)] sm:ml-[var(--ml-desktop,0px)] sm:mr-[var(--mr-desktop,0px)]";

const MOBILE_CAP = { padY: 24, padX: 16, marY: 16, marX: 8 } as const;

type Side = "Top" | "Bottom" | "Left" | "Right";
const SIDES: [Side, string, boolean][] = [
  ["Top", "t", true],
  ["Bottom", "b", true],
  ["Left", "l", false],
  ["Right", "r", false],
];

export function buildSectionStyleVariables(
  styles?: SectionStyles,
): React.CSSProperties {
  if (!styles) return {};

  const s = styles as Record<string, unknown>;
  const out: Record<string, string> = {};

  for (const [side, k, vertical] of SIDES) {
    const padD = parsePx(s[`padding${side}`], 0);
    const marD = parsePx(s[`margin${side}`], 0);
    out[`--p${k}-desktop`] = `${padD}px`;
    out[`--m${k}-desktop`] = `${marD}px`;
    out[`--p${k}-mobile`] = `${parsePx(
      s[`mobilePadding${side}`],
      Math.min(padD, vertical ? MOBILE_CAP.padY : MOBILE_CAP.padX),
    )}px`;
    out[`--m${k}-mobile`] = `${parsePx(
      s[`mobileMargin${side}`],
      Math.min(marD, vertical ? MOBILE_CAP.marY : MOBILE_CAP.marX),
    )}px`;
  }

  const isGradient =
    styles.backgroundType === "gradient" && Boolean(styles.backgroundGradient);

  let backgroundColor: string | undefined = undefined;
  let backgroundImage: string | undefined = undefined;
  let backgroundSize: string | undefined = undefined;
  let backgroundPosition: string | undefined = undefined;
  let backgroundRepeat: string | undefined = undefined;

  if (isGradient) {
    backgroundImage = styles.backgroundGradient;
  } else {
    backgroundColor = safeColor(styles.backgroundColor);
    if (styles.backgroundImage) {
      backgroundImage = styles.backgroundImage.startsWith("url(")
        ? styles.backgroundImage
        : `url(${styles.backgroundImage})`;
      backgroundSize = "cover";
      backgroundPosition = "center";
      backgroundRepeat = "no-repeat";
    }
  }

  const borderColor = safeColor(styles.borderColor);
  const borderStyle = styles.borderStyle || (borderColor ? "solid" : undefined);
  const borderWidthTop =
    styles.borderWidthTop !== undefined
      ? `${parsePx(styles.borderWidthTop, 0)}px`
      : undefined;
  const borderWidthRight =
    styles.borderWidthRight !== undefined
      ? `${parsePx(styles.borderWidthRight, 0)}px`
      : undefined;
  const borderWidthBottom =
    styles.borderWidthBottom !== undefined
      ? `${parsePx(styles.borderWidthBottom, 0)}px`
      : undefined;
  const borderWidthLeft =
    styles.borderWidthLeft !== undefined
      ? `${parsePx(styles.borderWidthLeft, 0)}px`
      : undefined;

  const formatRadius = (val?: number | string) =>
    val !== undefined
      ? typeof val === "number"
        ? `${parsePx(val, 0)}px`
        : val
      : undefined;

  return {
    ...out,
    backgroundColor,
    backgroundImage,
    backgroundSize,
    backgroundPosition,
    backgroundRepeat,

    borderColor,
    borderStyle,
    borderTopWidth: borderWidthTop,
    borderRightWidth: borderWidthRight,
    borderBottomWidth: borderWidthBottom,
    borderLeftWidth: borderWidthLeft,

    borderTopLeftRadius: formatRadius(
      styles.borderRadiusTopLeft ?? styles.borderRadius,
    ),
    borderTopRightRadius: formatRadius(
      styles.borderRadiusTopRight ?? styles.borderRadius,
    ),
    borderBottomRightRadius: formatRadius(
      styles.borderRadiusBottomRight ?? styles.borderRadius,
    ),
    borderBottomLeftRadius: formatRadius(
      styles.borderRadiusBottomLeft ?? styles.borderRadius,
    ),

    boxShadow: styles.boxShadow || undefined,
  } as React.CSSProperties;
}

export function getSectionContainerClass(section: HomePageSection): string {
  const layout = section.styles?.layout?.toLowerCase();

  if (layout === "full-width") {
    return "w-full px-0";
  }
  if (layout === "cropped" || layout === "fluid") {
    return "w-full max-w-[1920px] mx-auto px-4 sm:px-8 overflow-hidden";
  }
  if (layout === "standard" || layout === "boxed") {
    return "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8";
  }

  const typeStr = (section.type || section.key || "")
    .toLowerCase()
    .replace(/[-_]/g, "");
  const isSlider =
    section.config?.displayType === "slider" ||
    section.config?.viewType === "slider";
  if (typeStr === "heroslider" || (typeStr === "banners" && isSlider)) {
    return "w-full px-0";
  }

  return "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8";
}

export function buildCardVariables(s: HomePageSection): React.CSSProperties {
  const c = s.config ?? {};
  const st = s.styles ?? {};
  const out: Record<string, string> = {};
  const set = (name: string, v: number | undefined) => {
    if (v !== undefined) out[name] = `${v}px`;
  };
  set("--card-width", parsePxOrUndef(c.cardWidth));
  set("--cat-width", parsePxOrUndef(c.cardWidth));
  set("--card-gap", parsePxOrUndef(c.cardGap ?? st.cardGap));
  set("--card-radius", parsePxOrUndef(c.cardRadius ?? st.borderRadius));
  return out as React.CSSProperties;
}


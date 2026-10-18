import type { CSSProperties } from "react";
import type { StorefrontBootstrap } from "@/shared/types";

const COLOR_REGEX =
  /^(#[0-9a-f]{3,8}|rgba?\([\d\s.,%]+\)|hsla?\([\d\s.,%]+\)|transparent)$/i;

function safeColor(v: unknown, fallback: string): string {
  if (typeof v === "string" && COLOR_REGEX.test(v.trim())) {
    return v.trim();
  }
  return fallback;
}

function safeFont(v: unknown, fallback = "inherit"): string {
  if (typeof v === "string" && /^[a-zA-Z0-9\s, '"-]+$/.test(v.trim())) {
    return v.trim();
  }
  return fallback;
}

export function buildThemeVariables(
  bootstrap: StorefrontBootstrap,
): CSSProperties {
  const store = bootstrap.store;
  const config = bootstrap.config;
  const colorConfig = config?.color;

  const rawConfig =
    bootstrap?.config && typeof bootstrap.config === "object"
      ? (bootstrap.config as Record<string, unknown>)
      : {};
  const rawTheme =
    typeof rawConfig.theme === "object" && rawConfig.theme !== null
      ? (rawConfig.theme as Record<string, unknown>)
      : {};
  const storeRecord =
    store && typeof store === "object"
      ? (store as unknown as Record<string, unknown>)
      : {};

  const primaryCandidate =
    colorConfig?.primary || store?.themeColor || "#2563eb";
  const storePrimary = safeColor(primaryCandidate, "#2563eb");

  const bgCandidate =
    colorConfig?.bg ||
    ((colorConfig as Record<string, unknown> | undefined)?.background as string) ||
    (storeRecord.bgColor as string) ||
    "#ffffff";
  const storeBg = safeColor(bgCandidate, "#ffffff");

  const textCandidate =
    colorConfig?.text || (storeRecord.textColor as string) || "#0f172a";
  const storeText = safeColor(textCandidate, "#0f172a");

  const storeFont = safeFont(
    storeRecord.fontFamily ||
      storeRecord.font ||
      rawTheme.font ||
      rawConfig.font,
    "inherit",
  );

  return {
    "--store-primary": storePrimary,
    "--store-bg": storeBg,
    "--store-text": storeText,
    "--store-font": storeFont,
    "--primary-brand": storePrimary,
  } as CSSProperties;
}


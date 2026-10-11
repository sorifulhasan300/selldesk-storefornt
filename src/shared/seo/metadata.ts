import type { Metadata } from "next";
import type { StoreConfig } from "@/shared/types";

export function toMetaDescription(
  raw: string | null | undefined,
  fallback: string,
  maxLength = 155,
): string {
  const text = (raw ?? "")
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/\s+/g, " ")
    .trim();
  if (!text) return fallback;
  if (text.length <= maxLength) return text;

  const truncated = text.slice(0, maxLength);
  const wordBoundary = truncated.lastIndexOf(" ");
  return `${truncated.slice(0, wordBoundary > 80 ? wordBoundary : maxLength).trimEnd()}…`;
}

export function toAbsoluteImage(
  value: string | null | undefined,
  origin: string,
): string | undefined {
  if (!value?.trim()) return undefined;
  try {
    const url = new URL(value, origin);
    return url.protocol === "https:" ? url.toString() : undefined;
  } catch {
    return undefined;
  }
}

export function buildOpenGraph(options: {
  store: Pick<StoreConfig, "name">;
  title: string;
  description: string;
  url: string;
  image?: string;
}): NonNullable<Metadata["openGraph"]> {
  return {
    type: "website",
    siteName: options.store.name,
    title: options.title,
    description: options.description,
    url: options.url,
    images: options.image
      ? [{ url: options.image, alt: options.title }]
      : [],
  };
}

export function buildTwitter(options: {
  title: string;
  description: string;
  image?: string;
}): NonNullable<Metadata["twitter"]> {
  return {
    card: options.image ? "summary_large_image" : "summary",
    title: options.title,
    description: options.description,
    images: options.image ? [options.image] : [],
  };
}

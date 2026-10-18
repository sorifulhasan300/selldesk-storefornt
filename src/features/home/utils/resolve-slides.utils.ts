import { BannerSlideItem } from "@/shared/types";

export function resolveBannerSlides(
  data: unknown,
  config: Record<string, unknown> = {},
  fallbackSliders: unknown[] = [],
): BannerSlideItem[] {
  // Resolve slides from all available sources in priority order:
  // 1. config.items (unified store config) 2. section.data 3. config.banners 4. config.slides 5. fallbackSliders
  const rawSlides: unknown[] =
    Array.isArray(config.items) && (config.items as unknown[]).length > 0
      ? (config.items as unknown[])
      : Array.isArray(data) && data.length > 0
      ? data
      : Array.isArray(config.banners) && (config.banners as unknown[]).length > 0
      ? (config.banners as unknown[])
      : Array.isArray(config.slides) && (config.slides as unknown[]).length > 0
      ? (config.slides as unknown[])
      : Array.isArray(fallbackSliders) && fallbackSliders.length > 0
      ? fallbackSliders
      : [];

  return (rawSlides as Record<string, unknown>[])
    .filter((s) => s && typeof s === "object" && s.active !== false)
    .map((s, idx) => {
      const imgObj =
        typeof s.image === "object" && s.image !== null
          ? (s.image as Record<string, unknown>)
          : undefined;
      const thumbs =
        imgObj && typeof imgObj.thumbs === "object" && imgObj.thumbs !== null
          ? (imgObj.thumbs as Record<string, unknown>)
          : undefined;

      const img =
        (thumbs?.large as string) ||
        (thumbs?.url as string) ||
        (imgObj?.url as string) ||
        (s.imageUrl as string) ||
        (s.url as string) ||
        (typeof s.image === "string" ? (s.image as string) : "") ||
        "";

      const link =
        (s.link as string) ||
        (s.linkUrl as string) ||
        (s.redirectUrl as string) ||
        (s.ctaUrl as string) ||
        "";

      return {
        id: (s.id || s._id || `slide-${idx}`) as string,
        imageUrl: img,
        headline: (s.headline || s.title || "") as string,
        subHeadline: (s.subHeadline || s.subtitle || "") as string,
        linkUrl: link,
        ctaLabel: (s.ctaLabel || "") as string,
        altText:
          (s.altText || s.headline || s.title || "Promotional banner") as string,
      };
    })
    .filter((s) => Boolean(s.imageUrl));
}


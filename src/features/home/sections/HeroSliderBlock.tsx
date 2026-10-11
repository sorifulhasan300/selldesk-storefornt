"use client";

import { HomePageSection, BannerSlideItem } from "@/shared/types";
import { useHeroSlider } from "../hooks/useHeroSlider";
import { HeroSlideItem } from "./HeroSlideItem";
import { HeroSliderControls } from "./HeroSliderControls";

interface HeroSliderBlockProps {
  section: HomePageSection;
  currency?: string;
  isPreview?: boolean;
  fallbackSliders?: unknown[];
}

export function HeroSliderBlock({
  section,
  isPreview = false,
  fallbackSliders = [],
}: HeroSliderBlockProps) {
  const { config = {}, styles = {}, data } = section;

  // Resolve slides from all available sources in priority order:
  // 1. section.data  2. config.banners  3. config.slides  4. fallbackSliders
  const rawSlides: unknown[] =
    Array.isArray(data) && data.length > 0
      ? data
      : Array.isArray(config.banners) && (config.banners as unknown[]).length > 0
      ? (config.banners as unknown[])
      : Array.isArray(config.slides) && (config.slides as unknown[]).length > 0
      ? (config.slides as unknown[])
      : Array.isArray(fallbackSliders) && fallbackSliders.length > 0
      ? fallbackSliders
      : [];

  const slides: BannerSlideItem[] = (rawSlides as Record<string, unknown>[])
    .map((s, idx) => {
      const img =
        (s.imageUrl as string) ||
        (s.url as string) ||
        ((s.image as Record<string, unknown>)?.large as string) ||
        ((s.image as Record<string, unknown>)?.medium as string) ||
        "";
      return {
        id: (s.id || s._id || `slide-${idx}`) as string,
        imageUrl: img,
        headline: (s.headline || s.title || "") as string,
        subHeadline: (s.subHeadline || s.subtitle || "") as string,
        linkUrl:
          (s.ctaUrl || s.linkUrl || s.redirectUrl || "/products") as string,
        ctaLabel: (s.ctaLabel || "Shop Collection") as string,
        altText:
          (s.altText || s.headline || s.title || "Promotional banner") as string,
      };
    })
    .filter((s) => Boolean(s.imageUrl));

  const isAutoplay =
    config.autoplay !== false && config.autoPlay !== false;

  const rawInterval = config.autoPlayInterval ?? config.autoplayInterval;
  const parsedInterval =
    typeof rawInterval === "number"
      ? rawInterval
      : typeof rawInterval === "string" && !Number.isNaN(Number(rawInterval))
      ? Number(rawInterval)
      : 5000;

  const normalizedInterval =
    parsedInterval > 0 && parsedInterval < 50
      ? parsedInterval * 1000
      : parsedInterval;

  const autoPlayInterval = isAutoplay ? normalizedInterval : 0;

  const showDots =
    config.showDots !== false && config.showPagination !== false;
  const showArrows =
    config.showArrows !== false && config.showNavArrows !== false;

  const {
    current,
    setCurrent,
    setIsPaused,
    nextSlide,
    prevSlide,
    handleTouchStart,
    handleTouchEnd,
    handleTouchCancel,
    handleKeyDown,
  } = useHeroSlider({
    slidesCount: slides.length,
    autoPlayInterval,
  });

  const borderRadius =
    styles.borderRadius !== undefined
      ? typeof styles.borderRadius === "number"
        ? `${styles.borderRadius}px`
        : styles.borderRadius
      : styles.borderRadiusTopLeft !== undefined
      ? `${styles.borderRadiusTopLeft}px`
      : "1.5rem";

  // In preview mode show a placeholder so the merchant can see and click the
  // slider area in the builder even before any slides have been added.
  if (slides.length === 0) {
    if (!isPreview) return null;

    return (
      <div
        className="relative w-full h-[300px] sm:h-[400px] md:h-[480px] lg:h-[540px] overflow-hidden select-none flex flex-col items-center justify-center gap-4 bg-slate-100 border-2 border-dashed border-slate-300"
        style={{ borderRadius }}
        role="region"
        aria-label="Hero slider placeholder"
      >
        {/* Banner frame icon */}
        <div className="flex items-center justify-center w-20 h-20 rounded-2xl bg-slate-200 text-slate-400">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={1.5}
            strokeLinecap="round"
            strokeLinejoin="round"
            className="w-10 h-10"
            aria-hidden="true"
          >
            <rect x="2" y="4" width="20" height="16" rx="2" />
            <path d="m10 9 5 3-5 3V9Z" />
            <path d="M2 8h20" />
          </svg>
        </div>

        {/* Prompt text */}
        <div className="text-center px-6 max-w-xs">
          <p className="text-base font-semibold text-slate-600">
            Hero Slider
          </p>
          <p className="text-sm text-slate-400 mt-1">
            Add your banner slides in the builder to display your promotions
            here.
          </p>
        </div>

        {/* Decorative dots row */}
        <div className="flex items-center gap-2 mt-2" aria-hidden="true">
          {[0, 1, 2].map((i) => (
            <span
              key={i}
              className={`block rounded-full ${i === 0 ? "w-4 h-2 bg-slate-400" : "w-2 h-2 bg-slate-300"}`}
            />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div
      className="relative w-full h-[300px] sm:h-[400px] md:h-[480px] lg:h-[540px] overflow-hidden shadow-sm bg-slate-900 group select-none"
      style={{ borderRadius }}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onTouchCancel={handleTouchCancel}
      onKeyDown={handleKeyDown}
      tabIndex={0}
      role="region"
      aria-label="Promotional banner carousel"
    >
      {slides.map((slide, idx) => (
        <HeroSlideItem
          key={slide.id || slide._id || idx}
          slide={slide}
          isCurrent={current === idx}
          priority={idx === 0}
          defaultTitle={section.title}
          defaultSubtitle={section.subtitle}
        />
      ))}

      <HeroSliderControls
        slidesCount={slides.length}
        current={current}
        showArrows={showArrows}
        showDots={showDots}
        onPrev={prevSlide}
        onNext={nextSlide}
        onSelect={setCurrent}
      />
    </div>
  );
}


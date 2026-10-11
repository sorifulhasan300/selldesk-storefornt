"use client";

import { HomePageSection, BannerSlideItem } from "@/shared/types";
import { useHeroSlider } from "../hooks/useHeroSlider";
import { HeroSlideItem } from "./HeroSlideItem";
import { HeroSliderControls } from "./HeroSliderControls";

interface HeroSliderBlockProps {
  section: HomePageSection;
  currency?: string;
}

export function HeroSliderBlock({ section }: HeroSliderBlockProps) {
  const { config = {}, styles = {}, data } = section;

  // Extract and normalize slides with robust fallbacks
  const rawSlides: unknown[] =
    Array.isArray(data) && data.length > 0
      ? data
      : Array.isArray(config.banners) && config.banners.length > 0
      ? config.banners
      : Array.isArray(config.slides) && config.slides.length > 0
      ? config.slides
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

  if (slides.length === 0) return null;

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


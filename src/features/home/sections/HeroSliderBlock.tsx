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

  // Extract slides strictly without `any`
  const rawSlides: BannerSlideItem[] = Array.isArray(data)
    ? (data as BannerSlideItem[])
    : Array.isArray(config.banners)
    ? (config.banners as BannerSlideItem[])
    : Array.isArray(config.slides)
    ? (config.slides as BannerSlideItem[])
    : [];

  const slides: BannerSlideItem[] =
    rawSlides.length > 0
      ? rawSlides
      : [
          {
            id: "fallback-hero-1",
            title: section.title || "Discover Our New Collection",
            subtitle:
              section.subtitle ||
              "Explore curated premium items delivered directly to your doorstep.",
            imageUrl:
              "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1600&auto=format&fit=crop&q=80",
            linkUrl: "/products",
            ctaLabel: "Shop Collection",
          },
        ];

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


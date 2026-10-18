"use client";

import React from "react";
import { HomePageSection } from "@/shared/types";
import { useHeroSlider } from "../hooks/useHeroSlider";
import { HeroSlideItem } from "./HeroSlideItem";
import { HeroSliderControls } from "./HeroSliderControls";
import { HeroSliderPlaceholder } from "./HeroSliderPlaceholder";
import { resolveBannerSlides } from "../utils/resolve-slides.utils";

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

  const slides = resolveBannerSlides(data, config, fallbackSliders);

  // Behavior Controls:
  const isAutoplay =
    config.autoplay !== false &&
    config.autoplay !== "false" &&
    config.autoPlay !== false &&
    config.autoPlay !== "false";
  const rawInterval = config.autoplayInterval ?? config.autoPlayInterval;
  const parsedSeconds =
    typeof rawInterval === "number"
      ? rawInterval
      : typeof rawInterval === "string" && !Number.isNaN(Number(rawInterval))
      ? Number(rawInterval)
      : 3;
  const intervalMs =
    parsedSeconds > 0 && parsedSeconds < 60
      ? parsedSeconds * 1000
      : parsedSeconds || 3000;
  const autoPlayInterval = isAutoplay ? intervalMs : 0;

  const showArrows =
    config.showArrows !== false &&
    config.showArrows !== "false" &&
    config.showNavArrows !== false &&
    config.showNavArrows !== "false";
  const showDots =
    config.showDots !== false &&
    config.showDots !== "false" &&
    config.showPagination !== false &&
    config.showPagination !== "false";

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

  // Spacing & Corner Radius:
  const rawRadius =
    config.borderRadius ?? config.cornerRadius ?? styles.borderRadius;
  const borderRadius = `${rawRadius ?? 0}px`;
  const marginTop = `${config.marginTop ?? 0}px`;
  const marginBottom = `${config.marginBottom ?? 0}px`;

  // Background Color & Gradient:
  const background =
    (config.backgroundGradient as string) ||
    (config.backgroundColor as string) ||
    undefined;

  // 3 Layout Modes (config.layout):
  // Layout 1 (Standard - Default): max-w-7xl mx-auto px-4 sm:px-6 lg:px-8
  // Layout 2 (Full Width): w-full px-0
  // Layout 3 (Cropped): max-w-6xl mx-auto px-4 sm:px-6
  const layoutMode = Number(config.layout) || 1;
  const containerClasses =
    layoutMode === 2
      ? "w-full px-0"
      : layoutMode === 3
      ? "max-w-6xl mx-auto px-4 sm:px-6"
      : "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8";

  if (slides.length === 0) {
    if (!isPreview) return null;
    return (
      <div className="w-full" style={{ marginTop, marginBottom, background }}>
        <div className={containerClasses}>
          <HeroSliderPlaceholder borderRadius={borderRadius} />
        </div>
      </div>
    );
  }

  return (
    <div className="w-full" style={{ marginTop, marginBottom, background }}>
      <div className={containerClasses}>
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
      </div>
    </div>
  );
}

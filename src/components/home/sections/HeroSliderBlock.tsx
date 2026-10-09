"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { HomePageSection, BannerSlideItem } from "@/types";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface HeroSliderBlockProps {
  section: HomePageSection;
  currency?: string;
}

export function HeroSliderBlock({ section }: HeroSliderBlockProps) {
  const { config = {}, styles = {}, data } = section;

  // Extract slides from section data or fallback to config
  const rawSlides: BannerSlideItem[] = Array.isArray(data)
    ? data
    : Array.isArray(config.banners)
    ? config.banners
    : Array.isArray(config.slides)
    ? config.slides
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

  const [current, setCurrent] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const touchStartX = useRef<number | null>(null);

  const autoPlayInterval =
    typeof config.autoPlayInterval === "number"
      ? config.autoPlayInterval
      : typeof config.autoplayInterval === "number"
      ? config.autoplayInterval
      : 5000;

  const showDots = config.showDots !== false;
  const showArrows = config.showArrows !== false;

  const nextSlide = useCallback(() => {
    setCurrent((prev) => (prev + 1) % slides.length);
  }, [slides.length]);

  const prevSlide = useCallback(() => {
    setCurrent((prev) => (prev - 1 + slides.length) % slides.length);
  }, [slides.length]);

  // Autoplay timer
  useEffect(() => {
    if (slides.length <= 1 || isPaused || autoPlayInterval <= 0) return;
    const interval = setInterval(nextSlide, autoPlayInterval);
    return () => clearInterval(interval);
  }, [slides.length, isPaused, autoPlayInterval, nextSlide]);

  // Touch swipe support
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    const touchEndX = e.changedTouches[0].clientX;
    const diff = touchStartX.current - touchEndX;

    if (Math.abs(diff) > 50) {
      if (diff > 0) {
        nextSlide();
      } else {
        prevSlide();
      }
    }
    touchStartX.current = null;
  };

  // Keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowLeft") prevSlide();
    if (e.key === "ArrowRight") nextSlide();
  };

  // Custom border radius from styles
  const borderRadius =
    styles.borderRadius !== undefined
      ? typeof styles.borderRadius === "number"
        ? `${styles.borderRadius}px`
        : styles.borderRadius
      : styles.borderRadiusTopLeft !== undefined
      ? `${styles.borderRadiusTopLeft}px`
      : "1.5rem"; // default rounded-3xl

  if (slides.length === 0) return null;

  const activeSlide = slides[current] || slides[0];
  const slideTitle =
    activeSlide.headline || activeSlide.title || section.title || "Special Collection";
  const slideSubtitle =
    activeSlide.subHeadline || activeSlide.subtitle || section.subtitle;
  const slideLink =
    activeSlide.ctaUrl ||
    activeSlide.linkUrl ||
    activeSlide.redirectUrl ||
    "/products";
  const slideCtaText = activeSlide.ctaLabel || "Shop Collection";

  return (
    <div
      className="relative w-full h-[300px] sm:h-[400px] md:h-[480px] lg:h-[540px] overflow-hidden shadow-sm bg-slate-900 group select-none"
      style={{ borderRadius }}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onKeyDown={handleKeyDown}
      tabIndex={0}
      role="region"
      aria-label="Promotional banner carousel"
    >
      {/* Background Banner Slides */}
      {slides.map((slide, idx) => {
        const isCurrent = current === idx;
        const imageUrl =
          slide.imageUrl ||
          "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1600&auto=format&fit=crop&q=80";

        return (
          <div
            key={slide.id || slide._id || idx}
            className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${
              isCurrent ? "opacity-100 z-10" : "opacity-0 z-0 pointer-events-none"
            }`}
          >
            <Image
              src={imageUrl}
              alt={slide.headline || slide.title || "Banner image"}
              fill
              priority={idx === 0}
              className="object-cover object-center brightness-90"
              sizes="(max-width: 768px) 100vw, 1200px"
            />
          </div>
        );
      })}

      {/* Gradient Overlay & Content Container */}
      <div className="absolute inset-0 z-20 bg-gradient-to-r from-black/80 via-black/40 to-transparent flex items-center px-6 sm:px-12 lg:px-20">
        <div className="max-w-xl text-white space-y-4">
          <span className="inline-block px-3.5 py-1 bg-white/20 backdrop-blur-md rounded-full text-xs font-semibold uppercase tracking-wider text-white border border-white/10">
            Featured Highlight
          </span>
          <h2 className="text-2xl sm:text-4xl lg:text-5xl font-black tracking-tight leading-tight text-white drop-shadow-xs">
            {slideTitle}
          </h2>
          {slideSubtitle && (
            <p className="text-xs sm:text-sm md:text-base text-slate-200 line-clamp-2 sm:line-clamp-3">
              {slideSubtitle}
            </p>
          )}
          <div>
            <Link
              href={slideLink}
              className="inline-flex items-center justify-center mt-2 px-6 py-3 bg-white text-slate-900 font-bold text-xs sm:text-sm rounded-xl hover:bg-blue-600 hover:text-white transition-all shadow-md active:scale-95"
            >
              {slideCtaText}
            </Link>
          </div>
        </div>
      </div>

      {/* Navigation Arrows */}
      {showArrows && slides.length > 1 && (
        <>
          <button
            onClick={prevSlide}
            className="absolute left-4 top-1/2 -translate-y-1/2 z-30 p-2.5 rounded-full bg-white/25 hover:bg-white text-white hover:text-slate-900 backdrop-blur-md transition-all opacity-0 group-hover:opacity-100 focus:opacity-100 cursor-pointer shadow-md"
            aria-label="Previous slide"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            onClick={nextSlide}
            className="absolute right-4 top-1/2 -translate-y-1/2 z-30 p-2.5 rounded-full bg-white/25 hover:bg-white text-white hover:text-slate-900 backdrop-blur-md transition-all opacity-0 group-hover:opacity-100 focus:opacity-100 cursor-pointer shadow-md"
            aria-label="Next slide"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </>
      )}

      {/* Dots Indicator */}
      {showDots && slides.length > 1 && (
        <div className="absolute bottom-5 left-1/2 -translate-x-1/2 z-30 flex items-center gap-2">
          {slides.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrent(idx)}
              className={`h-2 rounded-full transition-all duration-300 cursor-pointer ${
                current === idx
                  ? "w-7 bg-white shadow-sm"
                  : "w-2 bg-white/50 hover:bg-white/80"
              }`}
              aria-label={`Go to slide ${idx + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}


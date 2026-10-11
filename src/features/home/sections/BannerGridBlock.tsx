"use client";

import Image from "next/image";
import Link from "next/link";
import { HomePageSection, BannerSlideItem } from "@/shared/types";
import { ArrowRight } from "lucide-react";
import { cn } from "@/shared/lib/utils";
import {
  getDesktopGridClass,
  getMobileGridClass,
} from "../utils/grid-layout.utils";
import { useHeroSlider } from "../hooks/useHeroSlider";
import { HeroSliderControls } from "./HeroSliderControls";
import { BannerCardItem } from "./BannerCardItem";

interface BannerGridBlockProps {
  section: HomePageSection;
}

interface RawBannerRecord {
  id?: string;
  _id?: string;
  imageUrl?: string;
  headline?: string;
  title?: string;
  subHeadline?: string;
  subtitle?: string;
  linkUrl?: string;
  redirectUrl?: string;
  ctaUrl?: string;
  ctaLabel?: string;
  altText?: string;
}

function normalizeBanners(input: unknown): BannerSlideItem[] {
  if (!Array.isArray(input)) return [];
  return (input as RawBannerRecord[]).map((b, i) => ({
    id: b.id || b._id || `banner-${i}`,
    imageUrl:
      b.imageUrl ||
      "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1200&auto=format&fit=crop&q=80",
    headline: b.headline || b.title || `Special Offer #${i + 1}`,
    subHeadline:
      b.subHeadline ||
      b.subtitle ||
      "Exclusive online discounts available for a limited time.",
    linkUrl: b.linkUrl || b.redirectUrl || b.ctaUrl || "/products",
    ctaLabel: b.ctaLabel || "Discover Now",
    altText: b.altText || b.headline || "Promotional banner",
  }));
}

const FALLBACK_BANNERS: BannerSlideItem[] = [
  {
    id: "banner-1",
    imageUrl:
      "https://images.unsplash.com/photo-1483985988355-763728e1935b?w=800&auto=format&fit=crop&q=80",
    headline: "Seasonal Fashion Drops",
    subHeadline: "Upgrade your wardrobe with handpicked premium apparel.",
    linkUrl: "/products",
    ctaLabel: "Shop Fashion",
  },
  {
    id: "banner-2",
    imageUrl:
      "https://images.unsplash.com/photo-1550009158-9ebf69173e03?w=800&auto=format&fit=crop&q=80",
    headline: "Next-Gen Tech Gadgets",
    subHeadline: "High-performance acoustics and smart lifestyle essentials.",
    linkUrl: "/products",
    ctaLabel: "Explore Gadgets",
  },
];

export function BannerGridBlock({ section }: BannerGridBlockProps) {
  const { config = {}, styles = {}, data } = section;

  const raw =
    Array.isArray(data) && data.length > 0
      ? data
      : Array.isArray(config.banners) && config.banners.length > 0
      ? config.banners
      : null;

  const banners = raw ? normalizeBanners(raw) : FALLBACK_BANNERS;

  const isCarousel =
    config.displayType === "carousel" ||
    config.viewType === "carousel" ||
    config.layout === "carousel" ||
    config.displayType === "slider" ||
    config.viewType === "slider" ||
    config.isCarousel === true;

  const isAutoplay =
    config.autoplay !== false && config.autoPlay !== false;

  const rawInterval = config.autoPlayInterval ?? config.autoplayInterval;
  const parsedInterval =
    typeof rawInterval === "number"
      ? rawInterval
      : typeof rawInterval === "string" && !Number.isNaN(Number(rawInterval))
      ? Number(rawInterval)
      : 4000;

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
    slidesCount: banners.length,
    autoPlayInterval,
  });

  if (banners.length === 0) return null;

  const desktopCols = Number(
    config.columns ||
      styles.columns ||
      (banners.length === 1 ? 1 : banners.length === 2 ? 2 : 3),
  );
  const mobileCols = Number(
    config.mobileColumns || styles.mobileColumns || 1,
  );

  if (isCarousel) {
    return (
      <div
        className="relative w-full h-[240px] sm:h-[320px] md:h-[380px] rounded-3xl overflow-hidden shadow-xs bg-slate-900 group select-none"
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
        {banners.map((banner, idx) => {
          const isCurrent = current === idx;
          const link = banner.linkUrl || "/products";
          const title = banner.headline || banner.title;
          const subtitle = banner.subHeadline || banner.subtitle;
          const cta = banner.ctaLabel || "Shop Now";

          return (
            <div
              key={banner.id || idx}
              className={cn(
                "absolute inset-0 transition-opacity duration-700 ease-in-out",
                isCurrent
                  ? "opacity-100 z-10"
                  : "opacity-0 z-0 pointer-events-none",
              )}
            >
              <Link href={link} className="block w-full h-full relative">
                <Image
                  src={banner.imageUrl}
                  alt={banner.altText || title || "Marketing banner"}
                  fill
                  sizes="100vw"
                  priority={idx === 0}
                  className="object-cover object-center brightness-[0.85]"
                />

                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 to-transparent flex flex-col justify-end p-6 sm:p-10">
                  <div className="text-white space-y-2 max-w-lg">
                    <span className="inline-block px-3 py-0.5 rounded-full bg-white/20 backdrop-blur-md text-[11px] font-bold uppercase tracking-wider text-white border border-white/10">
                      Special Promotion
                    </span>
                    <h3 className="text-xl sm:text-3xl font-black tracking-tight leading-tight text-white">
                      {title}
                    </h3>
                    {subtitle && (
                      <p className="text-xs sm:text-sm text-slate-200 line-clamp-2">
                        {subtitle}
                      </p>
                    )}
                    <div className="pt-2">
                      <span className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold text-white hover:underline">
                        {cta} <ArrowRight className="w-4 h-4" />
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            </div>
          );
        })}

        <HeroSliderControls
          slidesCount={banners.length}
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

  return (
    <div
      className={cn(
        "grid",
        getMobileGridClass(mobileCols),
        getDesktopGridClass(desktopCols),
        "gap-4 sm:gap-6",
      )}
    >
      {banners.map((banner) => (
        <BannerCardItem key={banner.id} banner={banner} />
      ))}
    </div>
  );
}



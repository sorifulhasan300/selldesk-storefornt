"use client";

import Image from "next/image";
import Link from "next/link";
import { HomePageSection, BannerSlideItem } from "@/shared/types";
import { ArrowRight } from "lucide-react";
import {
  getDesktopGridClass,
  getMobileGridClass,
} from "../utils/grid-layout.utils";

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
  if (banners.length === 0) return null;

  const desktopCols = Number(
    config.columns ||
      styles.columns ||
      (banners.length === 1 ? 1 : banners.length === 2 ? 2 : 3),
  );
  const mobileCols = Number(
    config.mobileColumns || styles.mobileColumns || 1,
  );

  return (
    <div
      className={`grid ${getMobileGridClass(mobileCols)} ${getDesktopGridClass(
        desktopCols,
      )} gap-4 sm:gap-6`}
    >
      {banners.map((banner) => {
        const link = banner.linkUrl || "/products";
        const title = banner.headline || banner.title;
        const subtitle = banner.subHeadline || banner.subtitle;
        const cta = banner.ctaLabel || "Shop Now";

        return (
          <Link
            key={banner.id}
            href={link}
            className="group relative h-[220px] sm:h-[280px] md:h-[320px] rounded-3xl overflow-hidden shadow-xs hover:shadow-xl transition-all duration-300 block select-none"
          >
            <Image
              src={banner.imageUrl}
              alt={banner.altText || title || "Marketing banner"}
              fill
              sizes="(max-width: 768px) 100vw, 600px"
              className="object-cover object-center group-hover:scale-105 transition-transform duration-700 brightness-[0.85]"
            />

            <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 to-transparent flex flex-col justify-end p-6 sm:p-8">
              <div className="text-white space-y-2 max-w-md">
                <span className="inline-block px-3 py-0.5 rounded-full bg-white/20 backdrop-blur-md text-[11px] font-bold uppercase tracking-wider text-white border border-white/10">
                  Special Promotion
                </span>
                <h3 className="text-xl sm:text-2xl font-black tracking-tight leading-tight text-white group-hover:text-blue-200 transition-colors">
                  {title}
                </h3>
                {subtitle && (
                  <p className="text-xs sm:text-sm text-slate-200 line-clamp-2">
                    {subtitle}
                  </p>
                )}
                <div className="pt-2">
                  <span className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold text-white group-hover:translate-x-1 transition-transform">
                    {cta} <ArrowRight className="w-4 h-4" />
                  </span>
                </div>
              </div>
            </div>
          </Link>
        );
      })}
    </div>
  );
}


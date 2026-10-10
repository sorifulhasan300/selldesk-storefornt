import Image from "next/image";
import Link from "next/link";
import { BannerSlideItem } from "@/shared/types";

interface HeroSlideItemProps {
  slide: BannerSlideItem;
  isCurrent: boolean;
  priority?: boolean;
  defaultTitle?: string;
  defaultSubtitle?: string;
}

export function HeroSlideItem({
  slide,
  isCurrent,
  priority = false,
  defaultTitle = "Special Collection",
  defaultSubtitle,
}: HeroSlideItemProps) {
  const imageUrl =
    slide.imageUrl ||
    "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1600&auto=format&fit=crop&q=80";

  const title = slide.headline || slide.title || defaultTitle;
  const subtitle = slide.subHeadline || slide.subtitle || defaultSubtitle;
  const link =
    slide.ctaUrl || slide.linkUrl || slide.redirectUrl || "/products";
  const ctaText = slide.ctaLabel || "Shop Collection";

  return (
    <div
      className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${
        isCurrent ? "opacity-100 z-10" : "opacity-0 z-0 pointer-events-none"
      }`}
    >
      <Image
        src={imageUrl}
        alt={title}
        fill
        priority={priority}
        className="object-cover object-center brightness-90"
        sizes="(max-width: 768px) 100vw, 1200px"
      />

      <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent flex items-center px-6 sm:px-12 lg:px-20">
        <div className="max-w-xl text-white space-y-4">
          <span className="inline-block px-3.5 py-1 bg-white/20 backdrop-blur-md rounded-full text-xs font-semibold uppercase tracking-wider text-white border border-white/10">
            Featured Highlight
          </span>
          <h2 className="text-2xl sm:text-4xl lg:text-5xl font-black tracking-tight leading-tight text-white drop-shadow-xs">
            {title}
          </h2>
          {subtitle && (
            <p className="text-xs sm:text-sm md:text-base text-slate-200 line-clamp-2 sm:line-clamp-3">
              {subtitle}
            </p>
          )}
          <div>
            <Link
              href={link}
              className="inline-flex items-center justify-center mt-2 px-6 py-3 bg-white text-slate-900 font-bold text-xs sm:text-sm rounded-xl hover:bg-blue-600 hover:text-white transition-all shadow-md active:scale-95"
            >
              {ctaText}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}


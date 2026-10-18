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
  defaultTitle,
  defaultSubtitle,
}: HeroSlideItemProps) {
  const imageUrl = slide.imageUrl || "";

  const title = slide.headline || slide.title || defaultTitle || "";
  const subtitle = slide.subHeadline || slide.subtitle || defaultSubtitle || "";
  const link = slide.ctaUrl || slide.linkUrl || slide.redirectUrl || "";
  const ctaText = slide.ctaLabel || "";
  const hasTextOverlay = Boolean(title || subtitle || ctaText);

  const imageElement = imageUrl ? (
    <Image
      src={imageUrl}
      alt={slide.altText || title || "Promotional banner"}
      fill
      preload={priority}
      fetchPriority={priority ? "high" : undefined}
      className="object-cover object-center"
      sizes="100vw"
    />
  ) : (
    <div className="absolute inset-0 bg-muted" />
  );

  return (
    <div
      className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${
        isCurrent ? "opacity-100 z-10" : "opacity-0 z-0 pointer-events-none"
      }`}
    >
      {link && !hasTextOverlay ? (
        <Link
          href={link}
          tabIndex={isCurrent ? 0 : -1}
          className="block w-full h-full relative cursor-pointer"
          aria-label={slide.altText || "Promotional banner"}
        >
          {imageElement}
        </Link>
      ) : (
        <div className="relative w-full h-full">{imageElement}</div>
      )}

      {hasTextOverlay && (
        <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent flex items-center px-6 sm:px-12 lg:px-20 pointer-events-none">
          <div className="max-w-xl text-white space-y-4 pointer-events-auto">
            {title && (
              <h2 className="text-2xl sm:text-4xl lg:text-5xl font-black tracking-tight leading-tight text-white drop-shadow-xs">
                {title}
              </h2>
            )}
            {subtitle && (
              <p className="text-xs sm:text-sm md:text-base text-slate-200 line-clamp-2 sm:line-clamp-3">
                {subtitle}
              </p>
            )}
            {link && ctaText && (
              <div>
                <Link
                  href={link}
                  tabIndex={isCurrent ? 0 : -1}
                  className="inline-flex items-center justify-center mt-2 px-6 py-3 bg-primary text-primary-foreground font-bold text-xs sm:text-sm rounded-xl hover:bg-primary/90 transition-all shadow-md active:scale-95"
                >
                  {ctaText}
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

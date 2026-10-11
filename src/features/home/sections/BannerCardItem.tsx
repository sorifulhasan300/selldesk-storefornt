import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { BannerSlideItem } from "@/shared/types";
import { cn } from "@/shared/lib/utils";

interface BannerCardItemProps {
  banner: BannerSlideItem;
  className?: string;
}

export function BannerCardItem({ banner, className }: BannerCardItemProps) {
  const link = banner.linkUrl || "/products";
  const title = banner.headline || banner.title;
  const subtitle = banner.subHeadline || banner.subtitle;
  const cta = banner.ctaLabel || "Shop Now";

  return (
    <Link
      href={link}
      className={cn(
        "group relative h-[220px] sm:h-[280px] md:h-[320px] rounded-3xl overflow-hidden shadow-xs hover:shadow-xl transition-all duration-300 block select-none",
        className,
      )}
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
}


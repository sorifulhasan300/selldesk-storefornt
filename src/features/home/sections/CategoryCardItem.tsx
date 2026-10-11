import Link from "next/link";
import Image from "next/image";
import React from "react";
import { cn } from "@/shared/lib/utils";

export interface NormalizedCategory {
  id: string;
  name: string;
  slug: string;
  imageUrl: string;
  productCount?: number;
}

export interface CategoryCardItemProps {
  category: NormalizedCategory;
  showName?: boolean;
  showCategoryName?: boolean;
  isCarousel?: boolean;
  cardWidth?: number | string;
  cardRadius?: number | string;
  className?: string;
  style?: React.CSSProperties;
}

export function CategoryCardItem({
  category,
  showName = true,
  showCategoryName,
  isCarousel = false,
  cardWidth = 160,
  cardRadius = 16,
  className,
  style,
}: CategoryCardItemProps) {
  const shouldShowName =
    showCategoryName !== undefined ? showCategoryName : showName;

  const resolvedRadius =
    typeof cardRadius === "number" ? `${cardRadius}px` : cardRadius;
  const resolvedWidth =
    typeof cardWidth === "number" ? `${cardWidth}px` : cardWidth;

  const cardStyle: React.CSSProperties = {
    borderRadius: resolvedRadius,
    ...(isCarousel ? { width: resolvedWidth } : {}),
    ...style,
  };

  const containerClasses = cn(
    isCarousel
      ? "group/item flex-none snap-start bg-white border border-slate-200/80 p-4 flex flex-col items-center text-center shadow-2xs hover:shadow-md hover:border-[var(--store-primary)]/50 transition-all duration-300"
      : "group relative w-full bg-white border border-slate-200/80 p-4 flex flex-col items-center text-center shadow-2xs hover:shadow-md hover:border-[var(--store-primary)]/50 transition-all duration-300",
    className,
  );

  return (
    <Link
      href={`/products?categoryId=${category.id}`}
      className={containerClasses}
      style={cardStyle}
    >
      <div
        className="relative w-16 h-16 sm:w-20 sm:h-20 overflow-hidden bg-slate-100 mb-3 group-hover:scale-105 transition-transform duration-300"
        style={{ borderRadius: resolvedRadius }}
      >
        <Image
          src={category.imageUrl}
          alt={category.name}
          fill
          sizes="(max-width: 768px) 33vw, 160px"
          className="object-cover"
        />
      </div>
      {shouldShowName && (
        <h3 className="text-xs sm:text-sm font-bold text-slate-800 group-hover:text-[var(--store-primary)] transition-colors line-clamp-1">
          {category.name}
        </h3>
      )}
      {category.productCount !== undefined && (
        <span className="text-[11px] text-slate-400 mt-0.5">
          {category.productCount} items
        </span>
      )}
    </Link>
  );
}



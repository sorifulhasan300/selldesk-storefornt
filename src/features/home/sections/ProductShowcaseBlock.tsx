"use client";

import { useRef, useCallback } from "react";
import Link from "next/link";
import { HomePageSection, Product } from "@/shared/types";
import { ProductCard } from "@/features/catalog";
import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/shared/lib/utils";
import { normalizeProductList } from "../utils/product-normalizer.utils";
import { parsePx } from "../utils/section-styles.utils";
import {
  getDesktopGridClass,
  getMobileGridClass,
} from "../utils/grid-layout.utils";

interface ProductShowcaseBlockProps {
  section: HomePageSection;
  currency?: string;
  fallbackProducts?: Product[];
}

export function ProductShowcaseBlock({
  section,
  currency = "USD",
  fallbackProducts = [],
}: ProductShowcaseBlockProps) {
  const { config = {}, styles = {}, data } = section;
  const scrollRef = useRef<HTMLDivElement>(null);

  const cardWidth = parsePx(config.cardWidth, 160);
  const cardRadius = parsePx(config.cardRadius ?? styles.borderRadius, 16);
  const cardGap = parsePx(config.cardGap ?? styles.cardGap, 16);

  const scroll = useCallback(
    (direction: "left" | "right") => {
      if (!scrollRef.current) return;
      const containerWidth = scrollRef.current.clientWidth;
      const scrollAmount = Math.max(
        cardWidth + cardGap,
        Math.floor(containerWidth * 0.75),
      );
      scrollRef.current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      });
    },
    [cardWidth, cardGap],
  );

  const raw = Array.isArray(data) && data.length > 0 ? data : config.products;
  const products = normalizeProductList(raw, fallbackProducts);

  if (products.length === 0) return null;

  const viewType =
    config.viewType === "carousel" ||
    config.displayType === "carousel" ||
    config.layout === "carousel"
      ? "carousel"
      : "grid";

  const showViewAll = config.showViewAll !== false;

  const showName =
    config.showName !== undefined
      ? Boolean(config.showName)
      : config.showProductName !== undefined
      ? Boolean(config.showProductName)
      : true;

  const showCategoryName =
    config.showCategoryName !== undefined
      ? Boolean(config.showCategoryName)
      : config.showCategory !== undefined
      ? Boolean(config.showCategory)
      : true;

  const showArrows =
    config.showArrows !== false && config.showNavArrows !== false;

  const desktopCols = Number(
    config.columns || config.productColumns || styles.columns || 4,
  );
  const mobileCols = Number(
    config.mobileColumns || styles.mobileColumns || 2,
  );


  const viewAllLink =
    typeof config.categoryId === "string"
      ? `/products?categoryId=${encodeURIComponent(config.categoryId)}`
      : "/products";

  return (
    <div className="relative">
      {showViewAll && (
        <div className="flex justify-end mb-4 sm:hidden">
          <Link
            href={viewAllLink}
            className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1 hover:underline"
          >
            <span>Explore all</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      )}

      {viewType === "carousel" ? (
        <div className="relative group">
          <div
            ref={scrollRef}
            style={{ gap: `${cardGap}px` }}
            className="flex overflow-x-auto scroll-smooth scrollbar-none pb-4 snap-x snap-mandatory touch-pan-x"
          >
            {products.map((product) => (
              <div
                key={product.id}
                style={{ width: `${cardWidth}px` }}
                className="flex-none snap-start"
              >
                <ProductCard
                  product={product}
                  currency={currency}
                  cardRadius={cardRadius}
                  showName={showName}
                  showCategoryName={showCategoryName}
                />
              </div>
            ))}
          </div>

          {showArrows && (
            <>
              <button
                type="button"
                onClick={() => scroll("left")}
                className="absolute -left-3 sm:-left-4 top-1/2 -translate-y-1/2 w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-white/95 border border-slate-200 shadow-md text-slate-700 hover:text-blue-600 hover:bg-white active:scale-95 transition-all flex items-center justify-center cursor-pointer z-10 touch-manipulation focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                aria-label="Scroll left"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                type="button"
                onClick={() => scroll("right")}
                className="absolute -right-3 sm:-right-4 top-1/2 -translate-y-1/2 w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-white/95 border border-slate-200 shadow-md text-slate-700 hover:text-blue-600 hover:bg-white active:scale-95 transition-all flex items-center justify-center cursor-pointer z-10 touch-manipulation focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                aria-label="Scroll right"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </>
          )}
        </div>
      ) : (
        <div
          className={cn(
            "grid",
            getMobileGridClass(mobileCols),
            getDesktopGridClass(desktopCols),
          )}
          style={{ gap: `${cardGap}px` }}
        >
          {products.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              currency={currency}
              cardRadius={cardRadius}
              showName={showName}
              showCategoryName={showCategoryName}
            />
          ))}
        </div>
      )}
    </div>
  );
}


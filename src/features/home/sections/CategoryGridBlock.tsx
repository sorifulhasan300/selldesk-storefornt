"use client";

import { useRef, useCallback } from "react";
import { HomePageSection } from "@/shared/types";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/shared/lib/utils";
import { CategoryCardItem, NormalizedCategory } from "./CategoryCardItem";
import { parsePx } from "../utils/section-styles.utils";
import {
  getDesktopGridClass,
  getMobileGridClass,
} from "../utils/grid-layout.utils";

interface CategoryGridBlockProps {
  section: HomePageSection;
}

interface RawCategoryRecord {
  id?: string;
  _id?: string;
  name?: string;
  slug?: string;
  imageUrl?: string;
  image?: { large?: string; medium?: string };
  productCount?: number;
}

function normalizeCategories(input: unknown): NormalizedCategory[] {
  if (!Array.isArray(input)) return [];
  return (input as RawCategoryRecord[]).map((cat, index) => {
    const id = String(cat.id || cat._id || `cat-${index}`);
    const name = String(cat.name || "Category");
    const slug = String(cat.slug || id);
    const imageUrl =
      cat.imageUrl ||
      cat.image?.large ||
      cat.image?.medium ||
      "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&auto=format&fit=crop&q=80";
    const productCount =
      typeof cat.productCount === "number" ? cat.productCount : undefined;

    return { id, name, slug, imageUrl, productCount };
  });
}

export function CategoryGridBlock({ section }: CategoryGridBlockProps) {
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

  const raw = Array.isArray(data) ? data : config.categories;
  const categories = normalizeCategories(raw);

  if (categories.length === 0) return null;

  const viewType =
    config.viewType === "carousel" ||
    config.displayType === "carousel" ||
    config.layout === "carousel"
      ? "carousel"
      : "grid";

  const showName =
    config.showName !== undefined
      ? Boolean(config.showName)
      : config.showCategoryName !== undefined
      ? Boolean(config.showCategoryName)
      : true;

  const showArrows =
    config.showArrows !== false && config.showNavArrows !== false;

  const desktopCols = Number(
    config.columns || config.categoryColumns || styles.columns || 6,
  );
  const mobileCols = Number(
    config.mobileColumns || styles.mobileColumns || 2,
  );


  return (
    <div className="relative">
      {viewType === "carousel" ? (
        <div className="relative group">
          <div
            ref={scrollRef}
            style={{ gap: `${cardGap}px` }}
            className="flex overflow-x-auto scroll-smooth scrollbar-none pb-2 snap-x snap-mandatory touch-pan-x"
          >
            {categories.map((cat) => (
              <CategoryCardItem
                key={cat.id}
                category={cat}
                showName={showName}
                isCarousel
                cardWidth={cardWidth}
                cardRadius={cardRadius}
              />
            ))}
          </div>

          {showArrows && (
            <>
              <button
                type="button"
                onClick={() => scroll("left")}
                className="absolute -left-3 sm:-left-4 top-1/2 -translate-y-1/2 w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-white/95 border border-slate-200 shadow-md text-slate-700 hover:text-[var(--store-primary)] hover:bg-white active:scale-95 transition-all flex items-center justify-center cursor-pointer z-10 touch-manipulation focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--store-primary)]"
                aria-label="Scroll left"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                type="button"
                onClick={() => scroll("right")}
                className="absolute -right-3 sm:-right-4 top-1/2 -translate-y-1/2 w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-white/95 border border-slate-200 shadow-md text-slate-700 hover:text-[var(--store-primary)] hover:bg-white active:scale-95 transition-all flex items-center justify-center cursor-pointer z-10 touch-manipulation focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--store-primary)]"
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
          {categories.map((cat) => (
            <CategoryCardItem
              key={cat.id}
              category={cat}
              showName={showName}
              cardRadius={cardRadius}
            />
          ))}
        </div>
      )}
    </div>
  );
}


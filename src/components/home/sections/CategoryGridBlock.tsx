"use client";

import { useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { HomePageSection } from "@/types";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface CategoryGridBlockProps {
  section: HomePageSection;
}

interface NormalizedCategory {
  id: string;
  name: string;
  slug: string;
  imageUrl: string;
  productCount?: number;
}

export function CategoryGridBlock({ section }: CategoryGridBlockProps) {
  const { config = {}, styles = {}, data } = section;
  const scrollRef = useRef<HTMLDivElement>(null);

  // Normalize incoming category objects from various formats
  const rawCategories = Array.isArray(data)
    ? data
    : Array.isArray(config.categories)
    ? config.categories
    : [];

  const categories: NormalizedCategory[] = rawCategories.map(
    (cat: any, index: number) => {
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
    },
  );

  if (categories.length === 0) {
    return null;
  }

  // Configuration options
  const viewType = config.viewType || "grid"; // 'grid' | 'carousel'
  const showName =
    config.showName !== undefined
      ? config.showName
      : config.showCategoryName !== undefined
      ? config.showCategoryName
      : true;

  // Responsive column calculation
  const desktopCols =
    config.columns ||
    config.categoryColumns ||
    styles.columns ||
    styles.categoryColumns ||
    6;
  const mobileCols =
    config.mobileColumns ||
    styles.mobileColumns ||
    2;

  // Resolve desktop grid class
  const getDesktopGridClass = (cols: number) => {
    switch (cols) {
      case 2:
        return "md:grid-cols-2";
      case 3:
        return "md:grid-cols-3";
      case 4:
        return "md:grid-cols-4";
      case 5:
        return "md:grid-cols-5";
      case 8:
        return "md:grid-cols-4 lg:grid-cols-8";
      case 6:
      default:
        return "md:grid-cols-4 lg:grid-cols-6";
    }
  };

  // Resolve mobile grid class
  const getMobileGridClass = (cols: number) => {
    switch (cols) {
      case 1:
        return "grid-cols-1";
      case 3:
        return "grid-cols-3";
      case 4:
        return "grid-cols-4";
      case 2:
      default:
        return "grid-cols-2";
    }
  };

  const scroll = (direction: "left" | "right") => {
    if (!scrollRef.current) return;
    const scrollAmount = 300;
    scrollRef.current.scrollBy({
      left: direction === "left" ? -scrollAmount : scrollAmount,
      behavior: "smooth",
    });
  };

  return (
    <div className="relative">
      {viewType === "carousel" ? (
        <div className="relative group">
          {/* Carousel Scroll Container */}
          <div
            ref={scrollRef}
            className="flex gap-4 overflow-x-auto scroll-smooth scrollbar-none pb-2 snap-x snap-mandatory"
          >
            {categories.map((cat) => (
              <Link
                key={cat.id}
                href={`/products?categoryId=${cat.id}`}
                className="group/item flex-none w-[140px] sm:w-[160px] snap-start bg-white border border-slate-200/80 rounded-2xl p-4 flex flex-col items-center text-center shadow-2xs hover:shadow-md hover:border-blue-400 transition-all duration-300"
              >
                <div className="relative w-18 h-18 sm:w-22 sm:h-22 rounded-2xl overflow-hidden bg-slate-100 mb-3 group-hover/item:scale-105 transition-transform duration-300">
                  <Image
                    src={cat.imageUrl}
                    alt={cat.name}
                    fill
                    sizes="160px"
                    className="object-cover"
                  />
                </div>
                {showName && (
                  <h3 className="text-xs sm:text-sm font-bold text-slate-800 group-hover/item:text-blue-600 transition-colors line-clamp-1">
                    {cat.name}
                  </h3>
                )}
                {cat.productCount !== undefined && (
                  <span className="text-[11px] text-slate-400 mt-0.5">
                    {cat.productCount} items
                  </span>
                )}
              </Link>
            ))}
          </div>

          {/* Carousel Left / Right Buttons */}
          <button
            onClick={() => scroll("left")}
            className="absolute -left-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white border border-slate-200 shadow-md text-slate-700 hover:text-blue-600 transition-all opacity-0 group-hover:opacity-100 hidden sm:flex items-center justify-center cursor-pointer z-10"
            aria-label="Scroll left"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            onClick={() => scroll("right")}
            className="absolute -right-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white border border-slate-200 shadow-md text-slate-700 hover:text-blue-600 transition-all opacity-0 group-hover:opacity-100 hidden sm:flex items-center justify-center cursor-pointer z-10"
            aria-label="Scroll right"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      ) : (
        /* Grid Layout */
        <div
          className={`grid ${getMobileGridClass(mobileCols)} ${getDesktopGridClass(
            desktopCols,
          )} gap-3 sm:gap-4`}
        >
          {categories.map((cat) => (
            <Link
              key={cat.id}
              href={`/products?categoryId=${cat.id}`}
              className="group relative bg-white border border-slate-200/80 rounded-2xl p-4 flex flex-col items-center text-center shadow-2xs hover:shadow-md hover:border-blue-400 transition-all duration-300"
            >
              <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-2xl overflow-hidden bg-slate-100 mb-3 group-hover:scale-105 transition-transform duration-300">
                <Image
                  src={cat.imageUrl}
                  alt={cat.name}
                  fill
                  sizes="(max-width: 768px) 33vw, 150px"
                  className="object-cover"
                />
              </div>
              {showName && (
                <h3 className="text-xs sm:text-sm font-bold text-slate-800 group-hover:text-blue-600 transition-colors line-clamp-1">
                  {cat.name}
                </h3>
              )}
              {cat.productCount !== undefined && (
                <span className="text-[11px] text-slate-400 mt-0.5">
                  {cat.productCount} items
                </span>
              )}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}


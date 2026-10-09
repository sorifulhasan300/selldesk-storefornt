"use client";

import { useRef } from "react";
import { HomePageSection } from "@/types";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { CategoryCardItem, NormalizedCategory } from "./CategoryCardItem";
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

  const raw = Array.isArray(data) ? data : config.categories;
  const categories = normalizeCategories(raw);

  if (categories.length === 0) return null;

  const viewType = config.viewType === "carousel" ? "carousel" : "grid";
  const showName =
    config.showName !== undefined
      ? Boolean(config.showName)
      : config.showCategoryName !== undefined
      ? Boolean(config.showCategoryName)
      : true;

  const desktopCols = Number(
    config.columns || config.categoryColumns || styles.columns || 6,
  );
  const mobileCols = Number(
    config.mobileColumns || styles.mobileColumns || 2,
  );

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
          <div
            ref={scrollRef}
            className="flex gap-4 overflow-x-auto scroll-smooth scrollbar-none pb-2 snap-x snap-mandatory"
          >
            {categories.map((cat) => (
              <CategoryCardItem
                key={cat.id}
                category={cat}
                showName={showName}
                isCarousel
              />
            ))}
          </div>

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
        <div
          className={`grid ${getMobileGridClass(mobileCols)} ${getDesktopGridClass(
            desktopCols,
          )} gap-3 sm:gap-4`}
        >
          {categories.map((cat) => (
            <CategoryCardItem
              key={cat.id}
              category={cat}
              showName={showName}
            />
          ))}
        </div>
      )}
    </div>
  );
}

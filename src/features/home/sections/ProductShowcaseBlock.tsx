"use client";

import { useRef } from "react";
import Link from "next/link";
import { HomePageSection, Product } from "@/shared/types";
import { ProductCard } from "@/features/catalog";
import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
import { normalizeProductList } from "../utils/product-normalizer.utils";
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

  const raw = Array.isArray(data) && data.length > 0 ? data : config.products;
  const products = normalizeProductList(raw, fallbackProducts);

  if (products.length === 0) return null;

  const desktopCols = Number(
    config.columns || config.productColumns || styles.columns || 4,
  );
  const mobileCols = Number(
    config.mobileColumns || styles.mobileColumns || 2,
  );

  const viewType = config.viewType === "carousel" ? "carousel" : "grid";
  const showViewAll = config.showViewAll !== false;

  const scroll = (direction: "left" | "right") => {
    if (!scrollRef.current) return;
    const scrollAmount = 360;
    scrollRef.current.scrollBy({
      left: direction === "left" ? -scrollAmount : scrollAmount,
      behavior: "smooth",
    });
  };

  const viewAllLink =
    typeof config.categoryId === "string"
      ? `/products?categoryId=${config.categoryId}`
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
            className="flex gap-4 overflow-x-auto scroll-smooth scrollbar-none pb-4 snap-x snap-mandatory"
          >
            {products.map((product) => (
              <div
                key={product.id}
                className="flex-none w-[200px] sm:w-[240px] md:w-[280px] snap-start"
              >
                <ProductCard product={product} currency={currency} />
              </div>
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
          )} gap-4 sm:gap-6`}
        >
          {products.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              currency={currency}
            />
          ))}
        </div>
      )}
    </div>
  );
}


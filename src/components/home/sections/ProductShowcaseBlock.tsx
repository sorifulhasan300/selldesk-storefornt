"use client";

import { useRef } from "react";
import Link from "next/link";
import { HomePageSection, Product } from "@/types";
import { ProductCard } from "@/components/catalog/product-card";
import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";

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

  // Normalize incoming product entities into the required Product shape
  const rawProducts = Array.isArray(data) && data.length > 0
    ? data
    : Array.isArray(config.products) && config.products.length > 0
    ? config.products
    : fallbackProducts;

  const products: Product[] = rawProducts.map((p: any, idx: number) => {
    const id = String(p.id || p._id || `prod-${idx}`);
    const name = String(p.name || p.title || "Product");
    const slug = String(p.slug || id);
    const description = String(p.description || "");

    // Price extraction
    let price = 0;
    let salePrice: number | null = null;

    if (p.price && typeof p.price === "object") {
      price = Number(p.price.regular ?? p.price.sale ?? 0);
      salePrice = p.price.hasDiscount ? Number(p.price.sale) : null;
    } else {
      price = Number(p.regularPrice ?? p.price ?? 0);
      salePrice = p.salePrice != null ? Number(p.salePrice) : null;
    }

    // Stock extraction
    let stock = 10;
    if (typeof p.stock === "number") {
      stock = p.stock;
    } else if (p.stock && typeof p.stock === "object") {
      stock = p.stock.inStock !== false ? 10 : 0;
    }

    // Images extraction
    let images: string[] = [];
    if (Array.isArray(p.images) && p.images.length > 0) {
      images = p.images;
    } else if (p.imageUrl) {
      images = [p.imageUrl];
    } else if (p.image?.large || p.image?.medium) {
      images = [p.image.large || p.image.medium];
    } else {
      images = [
        "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&auto=format&fit=crop&q=80",
      ];
    }

    const category =
      p.category ||
      (Array.isArray(p.categories) && p.categories[0]
        ? {
            id: p.categories[0]._id || p.categories[0].id,
            name: p.categories[0].name,
            slug: p.categories[0].slug,
          }
        : null);

    return {
      id,
      name,
      slug,
      description,
      price,
      salePrice,
      stock,
      images,
      category,
      hasVariants: Boolean(p.hasVariants || (p.variants && p.variants.length > 0)),
      variants: Array.isArray(p.variants) ? p.variants : [],
    };
  });

  if (products.length === 0) {
    return null;
  }

  // Column preferences
  const desktopCols =
    config.columns ||
    config.productColumns ||
    styles.columns ||
    styles.productColumns ||
    4;
  const mobileCols =
    config.mobileColumns ||
    styles.mobileColumns ||
    2;

  const viewType = config.viewType || "grid"; // 'grid' | 'carousel'
  const showViewAll = config.showViewAll !== false;

  const getDesktopGridClass = (cols: number) => {
    switch (cols) {
      case 2:
        return "md:grid-cols-2";
      case 3:
        return "md:grid-cols-3";
      case 5:
        return "md:grid-cols-3 lg:grid-cols-5";
      case 6:
        return "md:grid-cols-3 lg:grid-cols-6";
      case 4:
      default:
        return "md:grid-cols-3 lg:grid-cols-4";
    }
  };

  const getMobileGridClass = (cols: number) => {
    switch (cols) {
      case 1:
        return "grid-cols-1";
      case 3:
        return "grid-cols-3";
      case 2:
      default:
        return "grid-cols-2";
    }
  };

  const scroll = (direction: "left" | "right") => {
    if (!scrollRef.current) return;
    const scrollAmount = 360;
    scrollRef.current.scrollBy({
      left: direction === "left" ? -scrollAmount : scrollAmount,
      behavior: "smooth",
    });
  };

  const viewAllLink = config.categoryId
    ? `/products?categoryId=${config.categoryId}`
    : "/products";

  return (
    <div className="relative">
      {/* Optional Top Action Link when inside standalone blocks */}
      {showViewAll && (
        <div className="flex justify-end mb-4 sm:hidden">
          <Link
            href={viewAllLink}
            className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1 hover:underline"
          >
            Explore all <ArrowRight className="w-3.5 h-3.5" />
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


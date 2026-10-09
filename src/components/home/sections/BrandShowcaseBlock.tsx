"use client";

import Image from "next/image";
import Link from "next/link";
import { HomePageSection, BrandItem } from "@/types";
import {
  getDesktopGridClass,
  getMobileGridClass,
} from "../utils/grid-layout.utils";

interface BrandShowcaseBlockProps {
  section: HomePageSection;
}

interface RawBrandRecord {
  _id?: string;
  id?: string;
  name?: string;
  slug?: string;
  logo?: string | null;
  imageUrl?: string | null;
}

const FALLBACK_BRANDS: BrandItem[] = [
  { id: "b1", name: "Apple", slug: "apple" },
  { id: "b2", name: "Sony", slug: "sony" },
  { id: "b3", name: "Samsung", slug: "samsung" },
  { id: "b4", name: "Nike", slug: "nike" },
  { id: "b5", name: "Adidas", slug: "adidas" },
  { id: "b6", name: "Puma", slug: "puma" },
];

function normalizeBrands(input: unknown): BrandItem[] {
  if (!Array.isArray(input)) return [];
  return (input as RawBrandRecord[]).map((b, i) => ({
    _id: b._id || b.id || `brand-${i}`,
    id: b.id || b._id || `brand-${i}`,
    name: b.name || `Brand #${i + 1}`,
    slug: b.slug || b.id || `brand-${i}`,
    logo: b.logo || b.imageUrl || null,
  }));
}

export function BrandShowcaseBlock({ section }: BrandShowcaseBlockProps) {
  const { config = {}, styles = {}, data } = section;

  const raw =
    Array.isArray(data) && data.length > 0
      ? data
      : Array.isArray(config.brands) && config.brands.length > 0
      ? config.brands
      : null;

  const brands = raw ? normalizeBrands(raw) : FALLBACK_BRANDS;
  if (brands.length === 0) return null;

  const desktopCols = Number(
    config.columns || config.brandColumns || styles.columns || 6,
  );
  const mobileCols = Number(
    config.mobileColumns || styles.mobileColumns || 3,
  );

  return (
    <div
      className={`grid ${getMobileGridClass(mobileCols)} ${getDesktopGridClass(
        desktopCols,
      )} gap-3 sm:gap-4`}
    >
      {brands.map((brand) => (
        <Link
          key={brand.id || brand._id}
          href={`/products?brand=${brand.slug || brand.id}`}
          className="group bg-white border border-slate-200/80 rounded-2xl p-4 flex flex-col items-center justify-center text-center shadow-2xs hover:shadow-md hover:border-blue-400 transition-all duration-300 min-h-[90px] sm:min-h-[110px]"
        >
          {brand.logo ? (
            <div className="relative w-16 h-8 sm:w-20 sm:h-10 grayscale group-hover:grayscale-0 transition-all">
              <Image
                src={brand.logo}
                alt={brand.name}
                fill
                sizes="100px"
                className="object-contain"
              />
            </div>
          ) : (
            <div className="flex flex-col items-center gap-1">
              <div className="w-9 h-9 rounded-xl bg-slate-100 group-hover:bg-blue-50 text-slate-700 group-hover:text-blue-600 font-black text-sm flex items-center justify-center transition-colors">
                {brand.name.charAt(0).toUpperCase()}
              </div>
              <span className="text-xs font-bold text-slate-800 group-hover:text-blue-600 transition-colors truncate max-w-[100px]">
                {brand.name}
              </span>
            </div>
          )}
        </Link>
      ))}
    </div>
  );
}

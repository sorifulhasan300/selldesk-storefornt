import Link from "next/link";
import Image from "next/image";

export interface NormalizedCategory {
  id: string;
  name: string;
  slug: string;
  imageUrl: string;
  productCount?: number;
}

interface CategoryCardItemProps {
  category: NormalizedCategory;
  showName?: boolean;
  isCarousel?: boolean;
}

export function CategoryCardItem({
  category,
  showName = true,
  isCarousel = false,
}: CategoryCardItemProps) {
  const containerClasses = isCarousel
    ? "group/item flex-none w-[140px] sm:w-[160px] snap-start bg-white border border-slate-200/80 rounded-2xl p-4 flex flex-col items-center text-center shadow-2xs hover:shadow-md hover:border-blue-400 transition-all duration-300"
    : "group relative bg-white border border-slate-200/80 rounded-2xl p-4 flex flex-col items-center text-center shadow-2xs hover:shadow-md hover:border-blue-400 transition-all duration-300";

  return (
    <Link
      href={`/products?categoryId=${category.id}`}
      className={containerClasses}
    >
      <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-2xl overflow-hidden bg-slate-100 mb-3 group-hover:scale-105 transition-transform duration-300">
        <Image
          src={category.imageUrl}
          alt={category.name}
          fill
          sizes="(max-width: 768px) 33vw, 160px"
          className="object-cover"
        />
      </div>
      {showName && (
        <h3 className="text-xs sm:text-sm font-bold text-slate-800 group-hover:text-blue-600 transition-colors line-clamp-1">
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

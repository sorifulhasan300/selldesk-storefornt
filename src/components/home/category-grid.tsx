import Link from "next/link";
import Image from "next/image";
import { Category } from "@/types";

interface CategoryGridProps {
  categories: Category[];
}

export function CategoryGrid({ categories }: CategoryGridProps) {
  if (!categories || categories.length === 0) return null;

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
      {categories.map((cat) => (
        <Link
          key={cat.id}
          href={`/products?categoryId=${cat.id}`}
          className="group relative bg-white border border-slate-200/80 rounded-2xl p-4 flex flex-col items-center text-center shadow-xs hover:shadow-md hover:border-blue-400 transition-all"
        >
          <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-2xl overflow-hidden bg-slate-100 mb-3 group-hover:scale-105 transition-transform">
            <Image
              src={
                cat.imageUrl ||
                "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=200&auto=format&fit=crop&q=80"
              }
              alt={cat.name}
              fill
              className="object-cover"
            />
          </div>
          <h3 className="text-xs sm:text-sm font-bold text-slate-800 group-hover:text-blue-600 transition-colors line-clamp-1">
            {cat.name}
          </h3>
          {cat.productCount !== undefined && (
            <span className="text-[11px] text-slate-400 mt-0.5">
              {cat.productCount} items
            </span>
          )}
        </Link>
      ))}
    </div>
  );
}

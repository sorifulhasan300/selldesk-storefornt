import React from "react";
import Link from "next/link";
import { ChevronRight, Home } from "lucide-react";
import type { Product } from "@/shared/types";

export interface ProductBreadcrumbProps {
  product: Product;
  showBreadcrumb?: boolean;
}

export function ProductBreadcrumb({
  product,
  showBreadcrumb = true,
}: ProductBreadcrumbProps) {
  if (!showBreadcrumb) return null;

  return (
    <nav
      aria-label="Breadcrumb"
      className="mb-6 flex items-center gap-1.5 text-xs text-slate-500 font-medium overflow-hidden py-1"
    >
      <Link
        href="/"
        className="flex items-center gap-1 hover:text-[var(--store-primary)] transition-colors shrink-0"
      >
        <Home className="w-3.5 h-3.5" />
        <span>Home</span>
      </Link>

      {product.category && (
        <>
          <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          <Link
            href={`/categories/${product.category.slug}`}
            className="hover:text-[var(--store-primary)] transition-colors truncate max-w-[150px] shrink-0"
          >
            {product.category.name}
          </Link>
        </>
      )}

      <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
      <span
        className="text-slate-900 font-semibold truncate max-w-[200px] sm:max-w-[350px] md:max-w-[500px]"
        title={product.name}
      >
        {product.name}
      </span>
    </nav>
  );
}


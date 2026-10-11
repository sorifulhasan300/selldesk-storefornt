import { cache } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getBootstrap } from "@/features/tenant/server";
import {
  getCategoryBySlug,
  getCategoryProducts,
} from "@/features/catalog/server";
import { ProductCard } from "@/features/catalog";
import {
  buildOpenGraph,
  buildTwitter,
  toMetaDescription,
} from "@/shared/seo/metadata";
import { getStoreOrigin } from "@/shared/seo/store-url";

interface CategoryPageProps {
  params: Promise<{ storeSlug: string; slug: string }>;
  searchParams: Promise<{ page?: string }>;
}

const getCachedBootstrap = cache(getBootstrap);
const getCachedCategory = cache(getCategoryBySlug);

function parsePage(value?: string): number {
  const page = Number(value);
  return Number.isInteger(page) && page > 1 ? page : 1;
}

export async function generateMetadata({
  params,
  searchParams,
}: CategoryPageProps): Promise<Metadata> {
  const [{ storeSlug, slug }, query] = await Promise.all([
    params,
    searchParams,
  ]);
  const [category, bootstrap] = await Promise.all([
    getCachedCategory(storeSlug, slug),
    getCachedBootstrap(storeSlug),
  ]);
  if (!category) notFound();

  const origin = getStoreOrigin(bootstrap.store);
  const page = parsePage(query.page);
  const path = `/categories/${encodeURIComponent(category.slug)}${
    page > 1 ? `?page=${page}` : ""
  }`;
  const url = new URL(path, origin).toString();
  const title = toMetaDescription(category.name, "Category", 60);
  const description = toMetaDescription(
    category.description,
    `Shop ${category.name} at ${bootstrap.store.name}.`,
  );

  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: buildOpenGraph({
      store: bootstrap.store,
      title,
      description,
      url,
    }),
    twitter: buildTwitter({ title, description }),
  };
}

export default async function CategoryPage({
  params,
  searchParams,
}: CategoryPageProps) {
  const [{ storeSlug, slug }, query] = await Promise.all([
    params,
    searchParams,
  ]);
  const [category, bootstrap] = await Promise.all([
    getCachedCategory(storeSlug, slug),
    getCachedBootstrap(storeSlug),
  ]);
  if (!category) notFound();

  const page = parsePage(query.page);
  const result = await getCategoryProducts(storeSlug, category, page);

  return (
    <section className="space-y-6">
      <header className="border-b border-slate-200/80 pb-5">
        <h1 className="text-2xl font-black tracking-tight text-slate-900 sm:text-3xl">
          {category.name}
        </h1>
        {category.description && (
          <p className="mt-2 max-w-3xl text-sm leading-relaxed text-slate-600">
            {category.description}
          </p>
        )}
        <p className="mt-2 text-xs text-slate-500">
          {result.total} {result.total === 1 ? "product" : "products"}
        </p>
      </header>

      {result.products.length > 0 ? (
        <div className="grid grid-cols-2 gap-4 sm:gap-6 md:grid-cols-3">
          {result.products.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              currency={bootstrap.store.currency}
            />
          ))}
        </div>
      ) : (
        <p className="rounded-2xl border border-slate-200 bg-white p-8 text-center text-sm text-slate-600">
          No products are currently available in this category.
        </p>
      )}

      {result.totalPages > 1 && (
        <nav
          aria-label="Category product pages"
          className="flex justify-center gap-2 pt-4"
        >
          {Array.from({ length: result.totalPages }, (_, index) => index + 1).map(
            (pageNumber) => (
              <Link
                key={pageNumber}
                href={`/categories/${encodeURIComponent(category.slug)}?page=${pageNumber}`}
                aria-current={pageNumber === page ? "page" : undefined}
                className={`flex h-9 w-9 items-center justify-center rounded-xl text-xs font-bold ${
                  pageNumber === page
                    ? "bg-slate-900 text-white"
                    : "border border-slate-200 bg-white text-slate-700"
                }`}
              >
                {pageNumber}
              </Link>
            ),
          )}
        </nav>
      )}
    </section>
  );
}

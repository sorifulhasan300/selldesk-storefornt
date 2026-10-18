import { cache } from "react";
import { getProductBySlug } from "@/features/product/server";
import { getBootstrap } from "@/features/tenant/server";
import { WishlistToggle } from "@/features/wishlist";
import {
  ProductGallery,
  AddToCartCTA,
  MobileStickyBuyBar,
  ProductPurchaseProvider,
  ProductTrustBadges,
} from "@/features/product";
import { Metadata } from "next";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { JsonLd } from "@/shared/seo/json-ld";
import {
  buildProductBreadcrumbJsonLd,
  buildProductJsonLd,
} from "@/shared/seo/product-json-ld";
import {
  buildOpenGraph,
  buildTwitter,
  toAbsoluteImage,
  toMetaDescription,
} from "@/shared/seo/metadata";
import { getStoreOrigin } from "@/shared/seo/store-url";

interface PDPProps {
  params: Promise<{ storeSlug: string; slug: string }>;
}

const getCachedProductBySlug = cache(getProductBySlug);
const getCachedBootstrap = cache(getBootstrap);

export async function generateMetadata({
  params,
}: PDPProps): Promise<Metadata> {
  const { storeSlug, slug } = await params;
  const [product, bootstrap] = await Promise.all([
    getCachedProductBySlug(storeSlug, slug),
    getCachedBootstrap(storeSlug),
  ]);
  const store = bootstrap.store;
  const origin = getStoreOrigin(store);
  const path = `/products/${encodeURIComponent(product.slug)}`;
  const title = toMetaDescription(product.name, "Product", 60);
  const description = toMetaDescription(product.description, product.name);
  const image =
    toAbsoluteImage(product.images[0], origin) ??
    toAbsoluteImage(store.logoUrl, origin);
  const url = new URL(path, origin).toString();

  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: buildOpenGraph({ store, title, description, url, image }),
    twitter: buildTwitter({ title, description, image }),
  };
}

export default async function ProductDetailPage({ params }: PDPProps) {
  const { storeSlug, slug } = await params;

  const [product, bData] = await Promise.all([
    getCachedProductBySlug(storeSlug, slug),
    getCachedBootstrap(storeSlug),
  ]);
  const currency = bData?.store?.currency || "USD";
  const origin = getStoreOrigin(bData.store);

  return (
    <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6">
      <JsonLd data={buildProductJsonLd({ product, currency, origin })} />
      <JsonLd data={buildProductBreadcrumbJsonLd(product, origin)} />

      {/* Breadcrumbs */}
      <nav className="flex items-center gap-1.5 text-xs text-slate-400 mb-6">
        <Link href="/" className="hover:text-[var(--store-primary)] transition-colors">
          Home
        </Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <Link
          href="/products"
          className="hover:text-[var(--store-primary)] transition-colors"
        >
          Products
        </Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <span className="text-slate-700 font-semibold truncate max-w-[200px]">
          {product.name}
        </span>
      </nav>

      {/* PDP Main Grid */}
      <div className="grid grid-cols-1 gap-10 pb-32 lg:grid-cols-2 lg:gap-14 lg:pb-12">
        <ProductGallery images={product.images} title={product.name} />

        <div className="space-y-6">
          <div>
            {product.category && (
              <span className="text-xs uppercase font-extrabold tracking-wider text-[var(--store-primary)]">
                {product.category.name}
              </span>
            )}
            {product.brand?.name && (
              <p className="text-xs font-semibold text-slate-500">
                {product.brand.name}
              </p>
            )}
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 mt-1">
              {product.name}
            </h1>
          </div>

          <WishlistToggle storeSlug={storeSlug} product={product} />

          <div className="prose prose-slate text-sm text-slate-600 leading-relaxed border-t border-b border-slate-100 py-4">
            <p>{product.description}</p>
          </div>

          <ProductPurchaseProvider product={product} currency={currency}>
            <AddToCartCTA />
            <MobileStickyBuyBar />
          </ProductPurchaseProvider>

          <ProductTrustBadges />
        </div>
      </div>
    </div>
  );
}

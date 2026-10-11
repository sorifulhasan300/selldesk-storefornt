import { cache } from "react";
import { notFound } from "next/navigation";
import { getProductBySlug } from "@/features/product/server";
import { getBootstrap } from "@/features/tenant/server";
import {
  ProductGallery,
  AddToCartCTA,
  MobileStickyBuyBar,
  ProductPurchaseProvider,
} from "@/features/product";
import { Metadata } from "next";
import Link from "next/link";
import { ChevronRight, ShieldCheck, Truck, RefreshCcw } from "lucide-react";
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
  const description = toMetaDescription(
    product.description,
    product.name,
  );
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
    <>
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
        {/* Left: Gallery */}
        <ProductGallery images={product.images} title={product.name} />

        {/* Right: Product Details & Purchase Form */}
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

          {/* Description */}
          <div className="prose prose-slate text-sm text-slate-600 leading-relaxed border-t border-b border-slate-100 py-4">
            <p>{product.description}</p>
          </div>

          {/* Add to Cart & Variant Selection */}
          <ProductPurchaseProvider product={product} currency={currency}>
            <AddToCartCTA />
            <MobileStickyBuyBar />
          </ProductPurchaseProvider>

          {/* Trust Guarantees */}
          <div className="grid grid-cols-3 gap-3 pt-6 border-t border-slate-100 text-center">
            <div className="p-3 rounded-xl bg-white border border-slate-100 flex flex-col items-center">
              <Truck className="w-5 h-5 text-[var(--store-primary)] mb-1" />
              <span className="text-[11px] font-bold text-slate-800">
                Fast Delivery
              </span>
            </div>
            <div className="p-3 rounded-xl bg-white border border-slate-100 flex flex-col items-center">
              <ShieldCheck className="w-5 h-5 text-emerald-600 mb-1" />
              <span className="text-[11px] font-bold text-slate-800">
                Authentic Quality
              </span>
            </div>
            <div className="p-3 rounded-xl bg-white border border-slate-100 flex flex-col items-center">
              <RefreshCcw className="w-5 h-5 text-amber-600 mb-1" />
              <span className="text-[11px] font-bold text-slate-800">
                7 Days Return
              </span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

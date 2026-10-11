import { notFound } from "next/navigation";
import { getProductBySlug } from "@/features/product/server";
import { getBootstrap } from "@/features/tenant/server";
import { ProductGallery, AddToCartCTA } from "@/features/product";
import { Product } from "@/shared/types";
import { Metadata } from "next";
import Link from "next/link";
import { ChevronRight, ShieldCheck, Truck, RefreshCcw } from "lucide-react";

interface PDPProps {
  params: Promise<{ storeSlug: string; slug: string }>;
}

export async function generateMetadata({
  params,
}: PDPProps): Promise<Metadata> {
  const { storeSlug, slug } = await params;
  try {
    const product = await getProductBySlug(storeSlug, slug);
    return {
      title: product.name,
      description: product.description?.slice(0, 160) || product.name,
      openGraph: {
        title: product.name,
        description: product.description?.slice(0, 160),
        images: product.images?.[0] ? [product.images[0]] : [],
      },
    };
  } catch {
    return { title: "Product Details" };
  }
}

export default async function ProductDetailPage({ params }: PDPProps) {
  const { storeSlug, slug } = await params;

  let product: Product;
  let currency = "USD";

  try {
    const [pData, bData] = await Promise.all([
      getProductBySlug(storeSlug, slug),
      getBootstrap(storeSlug),
    ]);
    product = pData;
    currency = bData?.store?.currency || "USD";
  } catch {
    notFound();
  }

  // Schema.org JSON-LD Structured Data
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    image: product.images,
    description: product.description,
    sku: product.sku || product.id,
    offers: {
      "@type": "Offer",
      price: product.salePrice ?? product.price,
      priceCurrency: currency,
      availability:
        product.stock > 0
          ? "https://schema.org/InStock"
          : "https://schema.org/OutOfStock",
    },
  };

  const safeJsonLdString = JSON.stringify(jsonLd).replace(/</g, "\\u003c");

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: safeJsonLdString }}
      />

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
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-14 pb-12">
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
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 mt-1">
              {product.name}
            </h1>
          </div>

          {/* Description */}
          <div className="prose prose-slate text-sm text-slate-600 leading-relaxed border-t border-b border-slate-100 py-4">
            <p>{product.description}</p>
          </div>

          {/* Add to Cart & Variant Selection */}
          <AddToCartCTA product={product} currency={currency} />

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

import { notFound } from "next/navigation";
import { StorefrontService } from "@/services/storefront.service";
import { Product } from "@/types";
import { ProductGallery } from "@/components/product/product-gallery";
import { AddToCartCTA } from "@/components/product/add-to-cart-cta";
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
    const product = await StorefrontService.getProductBySlug(storeSlug, slug);
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
      StorefrontService.getProductBySlug(storeSlug, slug),
      StorefrontService.getBootstrap(storeSlug),
    ]);
    product = pData;
    currency = bData?.store?.currency || "USD";
  } catch (error) {
    // Development fallback mock
    product = {
      id: "mock-product-id",
      name: slug.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()),
      slug,
      description:
        "Engineered with premium materials for longevity and effortless performance. Features high-grade finishing, modern aesthetics, and standard manufacturer warranty.",
      price: 199,
      salePrice: 159,
      stock: 12,
      images: [
        "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&auto=format&fit=crop&q=80",
        "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&auto=format&fit=crop&q=80",
      ],
      hasVariants: true,
      variants: [
        {
          id: "v1",
          sku: "CHRONO-BLK",
          price: 199,
          salePrice: 159,
          stock: 8,
          attributes: { Color: "Matte Black", Size: "Standard" },
        },
        {
          id: "v2",
          sku: "CHRONO-SLV",
          price: 219,
          salePrice: 179,
          stock: 4,
          attributes: { Color: "Brushed Silver", Size: "Standard" },
        },
      ],
      category: { id: "c1", name: "Featured Accessories", slug: "accessories" },
    };
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

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Breadcrumbs */}
      <nav className="flex items-center gap-1.5 text-xs text-slate-400 mb-6">
        <Link href="/" className="hover:text-blue-600 transition-colors">
          Home
        </Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <Link
          href="/products"
          className="hover:text-blue-600 transition-colors"
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
              <span className="text-xs uppercase font-extrabold tracking-wider text-blue-600">
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
              <Truck className="w-5 h-5 text-blue-600 mb-1" />
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

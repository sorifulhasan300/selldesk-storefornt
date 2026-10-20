import { cache } from "react";
import { Metadata } from "next";
import { getProductBySlug } from "@/features/product/server";
import { getBootstrap } from "@/features/tenant/server";
import { getProducts } from "@/features/catalog/server";
import {
  ProductBreadcrumb,
  ProductGallery,
  ProductInfoSummary,
  ProductQuantityAction,
  ProductTabsSection,
  ProductRelatedGrid,
  ProductPurchaseProvider,
  ProductTrustBadges,
  MobileStickyBuyBar,
} from "@/features/product";
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
import type { Product } from "@/shared/types";

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

  // Concurrently fetch product and bootstrap configuration
  const [product, bData] = await Promise.all([
    getCachedProductBySlug(storeSlug, slug),
    getCachedBootstrap(storeSlug),
  ]);

  const currency = bData?.store?.currency || "BDT";
  const origin = getStoreOrigin(bData.store);
  const currentUrl = new URL(
    `/products/${encodeURIComponent(product.slug)}`,
    origin,
  ).toString();

  const productPageConfig = bData?.config?.productPage;

  // Concurrently fetch related products from same category
  let relatedProducts: Product[] = [];
  if (productPageConfig?.showRelatedProducts !== false) {
    try {
      const relData = await getProducts(storeSlug, {
        categoryId: product.category?.id,
        limit: 5,
      });
      relatedProducts = relData.items || [];
    } catch {
      relatedProducts = bData.featuredProducts || [];
    }
  }

  // Contact details resolution
  const contactPhone =
    bData?.config?.contact?.phone || bData?.store?.contactPhone || null;
  const whatsappPhone = bData?.config?.contact?.whatsapp || contactPhone;
  const facebookUrl =
    bData?.config?.contact?.messenger ||
    bData?.store?.facebookUrl ||
    bData?.config?.socialLinks?.facebook ||
    null;

  const hasFreeDelivery = Boolean(
    bData?.deliveryCharge?.freeDelivery?.active ||
    (bData?.deliveryCharge?.freeDeliveryThreshold &&
      bData.deliveryCharge.freeDeliveryThreshold > 0),
  );

  return (
    <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6 space-y-12">
      {/* Search Engine Structured Data */}
      <JsonLd data={buildProductJsonLd({ product, currency, origin })} />
      <JsonLd data={buildProductBreadcrumbJsonLd(product, origin)} />

      {/* Breadcrumb Navigation: Home > Category > Product Name */}
      <ProductBreadcrumb
        product={product}
        showBreadcrumb={productPageConfig?.showBreadcrumb !== false}
      />

      {/* Main PDP Grid: 2-Column on Desktop, Single-Column on Mobile */}
      <div className="grid grid-cols-1 gap-10 lg:grid-cols-2 lg:gap-14 items-start">
        {/* Left Column: High-Res Gallery + Thumbnails + Zoom */}
        <ProductGallery
          images={product.images}
          title={product.name}
          regularPrice={product.price}
          salePrice={product.salePrice}
          layout={productPageConfig?.layout ?? 1}
          imageZoom={productPageConfig?.imageZoom !== false}
          hasFreeDelivery={hasFreeDelivery}
        />

        {/* Right Column: Information, Stepper, Actions & Trust Badges */}
        <div className="space-y-6">
          <ProductPurchaseProvider
            product={product}
            currency={currency}
            defaultVariantSelection={
              productPageConfig?.defaultVariantSelection ?? "first"
            }
          >
            {/* Title, Brand, Rating/Reviews, In-Stock Badge, Dynamic Price */}
            <ProductInfoSummary
              product={product}
              currency={currency}
              showReviews={productPageConfig?.showReviews !== false}
            />

            {/* Stepper, Add to Cart, Buy Now, Social Orders, Wishlist */}
            <ProductQuantityAction
              storeSlug={storeSlug}
              actionsConfig={productPageConfig?.actions}
              sizeGuide={productPageConfig?.sizeGuide}
              contactPhone={contactPhone}
              whatsappPhone={whatsappPhone}
              facebookUrl={facebookUrl}
              currentUrl={currentUrl}
              wishlist={bData?.config?.wishlist || bData?.wishlist}
            />

            {/* Trust and Assurance Badges */}
            <ProductTrustBadges />

            {/* Mobile Fixed Bottom Buy Bar */}
            {productPageConfig?.showStickyBuyButton !== false && (
              <MobileStickyBuyBar />
            )}
          </ProductPurchaseProvider>
        </div>
      </div>

      {/* Section 1: | Description & Section 2: | Specifications */}
      <ProductTabsSection
        product={product}
        tabLayout={productPageConfig?.tabLayout ?? 4}
        tabsConfig={productPageConfig?.tabs}
      />

      {/* Section 3: Related Products Carousel/Grid */}
      <ProductRelatedGrid
        products={relatedProducts}
        currentProductId={product.id}
        currency={currency}
        storeSlug={storeSlug}
        cardConfig={bData?.config?.productCard}
        showRelatedProducts={productPageConfig?.showRelatedProducts !== false}
      />
    </div>
  );
}

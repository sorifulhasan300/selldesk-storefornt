import type { Product } from "@/shared/types";

interface ProductJsonLdOptions {
  product: Product;
  currency: string;
  origin: string;
}

export function buildProductJsonLd({
  product,
  currency,
  origin,
}: ProductJsonLdOptions): Record<string, unknown> {
  const url = new URL(`/products/${encodeURIComponent(product.slug)}`, origin)
    .toString();
  const offers = product.variants.length > 0
    ? product.variants.map((variant) => ({
        "@type": "Offer",
        url,
        price: Number(variant.salePrice ?? variant.price).toFixed(2),
        priceCurrency: currency,
        availability:
          variant.stock > 0
            ? "https://schema.org/InStock"
            : "https://schema.org/OutOfStock",
        itemCondition: "https://schema.org/NewCondition",
      }))
    : product.price > 0
      ? {
        "@type": "Offer",
        url,
        price: Number(product.salePrice ?? product.price).toFixed(2),
        priceCurrency: currency,
        availability:
          product.stock > 0
            ? "https://schema.org/InStock"
            : "https://schema.org/OutOfStock",
        itemCondition: "https://schema.org/NewCondition",
        }
      : undefined;

  const imageUrls = product.images
    .map((image) => {
      try {
        const parsed = new URL(image, origin);
        return parsed.protocol === "https:" ? parsed.toString() : null;
      } catch {
        return null;
      }
    })
    .filter((image): image is string => image !== null);
  const description = (product.description || product.name)
    .replace(/<[^>]*>/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 200);
  const name = product.name
    .replace(/<[^>]*>/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 200);
  const brandName = product.brand?.name
    ?.replace(/<[^>]*>/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 100);

  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name,
    url,
    image: imageUrls,
    description,
    sku: product.sku || product.id,
    ...(brandName
      ? { brand: { "@type": "Brand", name: brandName } }
      : {}),
    ...(offers ? { offers } : {}),
  };
}

export function buildProductBreadcrumbJsonLd(
  product: Product,
  origin: string,
): Record<string, unknown> {
  const item = (position: number, name: string, path: string) => ({
    "@type": "ListItem",
    position,
    name,
    item: new URL(path, origin).toString(),
  });

  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      item(1, "Home", "/"),
      item(2, "Products", "/products"),
      item(3, product.name, `/products/${encodeURIComponent(product.slug)}`),
    ],
  };
}

import { Product, ProductVariant } from "@/shared/types";

export interface RawProductInput {
  id?: string;
  _id?: string;
  name?: string;
  title?: string;
  slug?: string;
  description?: string;
  shortDescription?: string;
  videoUrl?: string;
  price?: number | { regular?: number; sale?: number; hasDiscount?: boolean };
  regularPrice?: number;
  salePrice?: number | null;
  stock?: number | { inStock?: boolean };
  images?: string[];
  imageUrl?: string;
  galleryImages?: string[];
  image?: { large?: string; medium?: string };
  category?: Product["category"];
  categories?: Array<{
    _id?: string;
    id?: string;
    name?: string;
    slug?: string;
    category?: { id?: string; name?: string; slug?: string };
  }>;
  brand?: { name: string } | null;
  hasVariants?: boolean;
  variants?: Product["variants"];
  inventories?: Array<{
    id?: string;
    productId?: string;
    variantName?: string;
    sku?: string;
    sellingPrice?: number | string;
    regularPrice?: number | string;
    stockQuantity?: number;
    status?: string;
    attributeValueIds?: string[];
  }>;
  specifications?: Record<string, any> | Array<{ label: string; value: any }> | null;
  createdAt?: string;
  updatedAt?: string;
}

export function normalizeProductList(
  input: unknown,
  fallback: Product[] = [],
): Product[] {
  if (!Array.isArray(input) || input.length === 0) {
    return fallback;
  }

  return (input as RawProductInput[]).map((p, idx) => {
    const id = String(p.id || p._id || `prod-${idx}`);
    const name = String(p.name || p.title || "Product");
    const slug = (p.slug && String(p.slug).trim()) ? String(p.slug).trim() : id;
    const description = String(p.description || "");

    const firstInv = Array.isArray(p.inventories) ? p.inventories[0] : undefined;

    let price = 0;
    let salePrice: number | null = null;

    if (p.price && typeof p.price === "object") {
      price = Number(p.price.regular ?? p.price.sale ?? 0);
      salePrice = p.price.hasDiscount ? Number(p.price.sale) : null;
    } else if (p.regularPrice != null || p.price != null) {
      price = Number(p.regularPrice ?? p.price ?? 0);
      salePrice = p.salePrice != null ? Number(p.salePrice) : null;
    } else if (firstInv) {
      const reg = Number(firstInv.regularPrice ?? 0);
      const sell = Number(firstInv.sellingPrice ?? reg);
      price = reg > 0 ? reg : sell;
      salePrice = sell < price ? sell : null;
    }

    let stock = 10;
    if (Array.isArray(p.inventories) && p.inventories.length > 0) {
      stock = p.inventories.reduce(
        (total, inv) => total + (Number(inv.stockQuantity) || 0),
        0,
      );
    } else if (typeof p.stock === "number") {
      stock = p.stock;
    } else if (p.stock && typeof p.stock === "object") {
      stock = p.stock.inStock !== false ? 10 : 0;
    }

    let images: string[] = [];
    if (Array.isArray(p.images) && p.images.length > 0) {
      images = p.images;
    } else if (p.imageUrl || (p.galleryImages && p.galleryImages.length > 0)) {
      images = [
        ...(p.imageUrl ? [p.imageUrl] : []),
        ...(p.galleryImages ?? []),
      ];
    } else if (p.image?.large || p.image?.medium) {
      images = [p.image.large || p.image.medium || ""];
    } else {
      images = [];
    }

    let category: Product["category"] = p.category ?? null;
    if (!category && Array.isArray(p.categories) && p.categories[0]) {
      const catEntry = p.categories[0];
      const nested = (catEntry.category || catEntry) as Record<string, unknown>;
      category = {
        id: String(nested.id || nested._id || ""),
        name: String(nested.name || "Category"),
        slug: String(nested.slug || "category"),
      };
    }

    const variants: ProductVariant[] =
      Array.isArray(p.variants) && p.variants.length > 0
        ? p.variants
        : Array.isArray(p.inventories)
          ? p.inventories.map((inv) => {
              const regular = Number(inv.regularPrice ?? 0);
              const selling = Number(inv.sellingPrice ?? regular);
              return {
                id: String(inv.id || id),
                sku: String(inv.sku || ""),
                price: regular > 0 ? regular : selling,
                salePrice: selling < regular ? selling : null,
                stock: Number(inv.stockQuantity) || 0,
                attributes: {},
              };
            })
          : [];

    return {
      id,
      name,
      slug,
      description,
      shortDescription: p.shortDescription ?? null,
      videoUrl: p.videoUrl ?? null,
      specifications: p.specifications ?? null,
      price,
      salePrice,
      stock,
      images,
      category,
      brand: p.brand ?? null,
      hasVariants: Boolean(
        p.hasVariants || variants.length > 1,
      ),
      variants,
    };
  });
}

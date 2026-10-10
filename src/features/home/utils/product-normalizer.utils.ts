import { Product } from "@/shared/types";

interface RawProductInput {
  id?: string;
  _id?: string;
  name?: string;
  title?: string;
  slug?: string;
  description?: string;
  price?: number | { regular?: number; sale?: number; hasDiscount?: boolean };
  regularPrice?: number;
  salePrice?: number | null;
  stock?: number | { inStock?: boolean };
  images?: string[];
  imageUrl?: string;
  image?: { large?: string; medium?: string };
  category?: Product["category"];
  categories?: Array<{ _id?: string; id?: string; name: string; slug: string }>;
  hasVariants?: boolean;
  variants?: Product["variants"];
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
    const slug = String(p.slug || id);
    const description = String(p.description || "");

    let price = 0;
    let salePrice: number | null = null;

    if (p.price && typeof p.price === "object") {
      price = Number(p.price.regular ?? p.price.sale ?? 0);
      salePrice = p.price.hasDiscount ? Number(p.price.sale) : null;
    } else {
      price = Number(p.regularPrice ?? p.price ?? 0);
      salePrice = p.salePrice != null ? Number(p.salePrice) : null;
    }

    let stock = 10;
    if (typeof p.stock === "number") {
      stock = p.stock;
    } else if (p.stock && typeof p.stock === "object") {
      stock = p.stock.inStock !== false ? 10 : 0;
    }

    let images: string[] = [];
    if (Array.isArray(p.images) && p.images.length > 0) {
      images = p.images;
    } else if (p.imageUrl) {
      images = [p.imageUrl];
    } else if (p.image?.large || p.image?.medium) {
      images = [p.image.large || p.image.medium || ""];
    } else {
      images = [
        "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&auto=format&fit=crop&q=80",
      ];
    }

    const category =
      p.category ||
      (Array.isArray(p.categories) && p.categories[0]
        ? {
            id: p.categories[0]._id || p.categories[0].id || "",
            name: p.categories[0].name,
            slug: p.categories[0].slug,
          }
        : null);

    return {
      id,
      name,
      slug,
      description,
      price,
      salePrice,
      stock,
      images,
      category,
      hasVariants: Boolean(
        p.hasVariants || (p.variants && p.variants.length > 0),
      ),
      variants: Array.isArray(p.variants) ? p.variants : [],
    };
  });
}


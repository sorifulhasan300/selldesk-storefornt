import "server-only";
import { serverFetch } from "@/shared/api/server-fetch";
import { tags, REVALIDATE } from "@/shared/api/tags";
import { API_ENDPOINTS } from "@/shared/constants";
import type { Product, ProductVariant } from "@/shared/types";
import { z } from "zod";

const inventorySchema = z.object({
  id: z.string(),
  sku: z.string().nullish().transform((s) => s || ""),
  sellingPrice: z.coerce.number(),
  regularPrice: z.coerce.number(),
  stockQuantity: z.coerce.number(),
  attributeValueIds: z.array(z.string()).optional(),
});

const productResponseSchema = z.object({
  id: z.string(),
  name: z.string(),
  slug: z.string().nullish(),
  description: z.string().nullish(),
  shortDescription: z.string().nullish(),
  videoUrl: z.string().nullish(),
  specifications: z
    .union([
      z.record(z.string(), z.any()),
      z.array(z.any()),
    ])
    .nullish(),
  imageUrl: z.string().nullish(),
  galleryImages: z.array(z.string()).optional(),
  brand: z.object({ name: z.string() }).nullish(),
  categories: z
    .array(
      z.object({
        category: z.object({
          id: z.string(),
          name: z.string(),
          slug: z.string(),
        }),
      }),
    )
    .optional(),
  inventories: z.array(inventorySchema),
  options: z
    .array(
      z.object({
        name: z.string(),
        values: z.array(z.object({ id: z.string(), value: z.string() })),
      }),
    )
    .optional(),
  updatedAt: z.coerce.date().optional(),
});

function normalizeProductResponse(raw: unknown): Product {
  const parsed = productResponseSchema.safeParse(raw);
  if (!parsed.success) {
    throw new Error("Invalid storefront product response");
  }

  const source = parsed.data;
  const optionValues = new Map(
    (source.options ?? []).flatMap((option) =>
      option.values.map((value) => [
        value.id,
        { name: option.name, value: value.value },
      ] as const),
    ),
  );
  const variants: ProductVariant[] = source.inventories.map((inventory) => ({
    id: inventory.id,
    sku: inventory.sku,
    price: inventory.regularPrice,
    salePrice:
      inventory.sellingPrice < inventory.regularPrice
        ? inventory.sellingPrice
        : null,
    stock: inventory.stockQuantity,
    attributes: Object.fromEntries(
      (inventory.attributeValueIds ?? []).flatMap((valueId) => {
        const value = optionValues.get(valueId);
        return value ? [[value.name, value.value]] : [];
      }),
    ),
  }));
  const defaultVariant = variants[0];

  return {
    id: source.id,
    name: source.name,
    slug: (source.slug && source.slug.trim()) || source.id,
    description: source.description ?? "",
    shortDescription: source.shortDescription ?? null,
    videoUrl: source.videoUrl ?? null,
    specifications: source.specifications ?? null,
    price: defaultVariant?.price ?? 0,
    salePrice: defaultVariant?.salePrice ?? null,
    stock: variants.reduce((total, variant) => total + variant.stock, 0),
    images: [
      ...(source.imageUrl ? [source.imageUrl] : []),
      ...(source.galleryImages ?? []),
    ],
    category: source.categories?.[0]
      ? {
          id: source.categories[0].category.id,
          name: source.categories[0].category.name,
          slug: source.categories[0].category.slug,
        }
      : null,
    brand: source.brand ?? null,
    hasVariants: variants.length > 1,
    variants,
    sku: defaultVariant?.sku,
    updatedAt: source.updatedAt?.toISOString(),
  };
}

export const productService = {
  async getBySlug(storeSlug: string, slug: string): Promise<Product> {
    const cleanSlug = decodeURIComponent(slug).trim();
    if (!cleanSlug) {
      throw new Error("Product slug or ID is required");
    }
    const raw = await serverFetch<unknown>(
      API_ENDPOINTS.PRODUCTS.PRODUCT_BY_SLUG(cleanSlug),
      storeSlug,
      {
        revalidate: REVALIDATE.product,
        tags: [tags.product(storeSlug, cleanSlug)],
      },
    );
    return normalizeProductResponse(raw);
  },
  async getProductBySlug(storeSlug: string, slug: string): Promise<Product> {
    return this.getBySlug(storeSlug, slug);
  },
};

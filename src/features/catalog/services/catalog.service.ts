import "server-only";
import { serverFetch } from "@/shared/api/server-fetch";
import { tags, REVALIDATE } from "@/shared/api/tags";
import { API_ENDPOINTS } from "@/shared/constants";
import { ProductListResponse, Category } from "@/shared/types";
import { normalizeProductList } from "@/features/home";
import { z } from "zod";

interface CategoryTreeEntry {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  updatedAt: Date;
  children?: CategoryTreeEntry[];
}

const categoryTreeSchema: z.ZodType<CategoryTreeEntry> = z.lazy(() =>
  z.object({
    id: z.string(),
    name: z.string(),
    slug: z.string().min(1),
    description: z.string().nullish(),
    updatedAt: z.coerce.date(),
    children: z.array(categoryTreeSchema).optional(),
  }),
);

const sitemapProductSchema = z.object({
  slug: z.string().nullish(),
  updatedAt: z.coerce.date(),
});

const sitemapProductsPageSchema = z.object({
  data: z.array(sitemapProductSchema),
  meta: z.object({
    totalPages: z.number().int().min(0),
  }),
});

const inventorySchema = z.object({
  sku: z.string(),
  sellingPrice: z.coerce.number(),
  regularPrice: z.coerce.number(),
  stockQuantity: z.coerce.number(),
});

const sitemapCategorySchema = z.object({
  slug: z.string().min(1),
  updatedAt: z.coerce.date(),
  children: z.array(z.unknown()).optional(),
});

const categoryProductSchema = z.object({
  id: z.string(),
  name: z.string(),
  slug: z.string().nullish(),
  description: z.string().nullish(),
  imageUrl: z.string().nullish(),
  galleryImages: z.array(z.string()).optional(),
  inventories: z.array(inventorySchema),
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
});

const categoryProductsPageSchema = z.object({
  data: z.array(categoryProductSchema),
  meta: z.object({
    total: z.number().int().min(0),
    totalPages: z.number().int().min(0),
  }),
});

export interface SitemapEntryData {
  slug: string;
  updatedAt: Date;
}

export interface CategoryLandingData {
  category: Omit<CategoryTreeEntry, "children">;
  products: ProductListResponse["items"];
  total: number;
  totalPages: number;
}

function flattenCategoryTree(
  categories: CategoryTreeEntry[],
): CategoryTreeEntry[] {
  return categories.flatMap(({ children = [], ...category }) => [
    category,
    ...flattenCategoryTree(children),
  ]);
}

function mapCategoryProduct(
  source: z.infer<typeof categoryProductSchema>,
): ProductListResponse["items"][number] {
  const inventory = source.inventories[0];
  const regularPrice = inventory?.regularPrice ?? 0;
  const sellingPrice = inventory?.sellingPrice ?? regularPrice;

  return {
    id: source.id,
    name: source.name,
    slug: source.slug || source.id,
    description: source.description ?? "",
    price: regularPrice,
    salePrice: sellingPrice < regularPrice ? sellingPrice : null,
    stock: source.inventories.reduce(
      (total, item) => total + item.stockQuantity,
      0,
    ),
    images: [
      ...(source.imageUrl ? [source.imageUrl] : []),
      ...(source.galleryImages ?? []),
    ],
    category: source.categories?.[0]?.category ?? null,
    hasVariants: source.inventories.length > 1,
    variants: [],
  };
}

function flattenSitemapCategories(input: unknown): SitemapEntryData[] {
  const categories = z.array(z.unknown()).safeParse(input);
  if (!categories.success) {
    throw new Error("Invalid storefront sitemap category response");
  }

  return categories.data.flatMap((inputCategory) => {
    const parsed = sitemapCategorySchema.safeParse(inputCategory);
    if (!parsed.success) {
      throw new Error("Invalid storefront sitemap category entry");
    }

    const { slug, updatedAt, children = [] } = parsed.data;
    return [
      { slug, updatedAt },
      ...flattenSitemapCategories(children),
    ];
  });
}

export interface CatalogQueryOptions {
  page?: number;
  limit?: number;
  search?: string;
  categoryId?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export const catalogService = {
  async getCategoryBySlug(
    storeSlug: string,
    slug: string,
  ): Promise<Omit<CategoryTreeEntry, "children"> | null> {
    const raw = await serverFetch<unknown>(
      API_ENDPOINTS.CATALOG.CATEGORIES,
      storeSlug,
      {
        revalidate: REVALIDATE.categories,
        tags: [tags.categories(storeSlug)],
      },
    );
    const response = z
      .object({ data: z.array(categoryTreeSchema) })
      .safeParse(raw);
    if (!response.success) {
      throw new Error("Invalid storefront category response");
    }

    return (
      flattenCategoryTree(response.data.data).find(
        (category) => category.slug === slug,
      ) ?? null
    );
  },

  async getCategoryProducts(
    storeSlug: string,
    category: Omit<CategoryTreeEntry, "children">,
    page: number,
  ): Promise<CategoryLandingData> {
    const searchParams = new URLSearchParams({
      page: String(page),
      limit: "12",
      categoryId: category.id,
    });
    const raw = await serverFetch<unknown>(
      `${API_ENDPOINTS.CATALOG.PRODUCTS}?${searchParams.toString()}`,
      storeSlug,
      {
        revalidate: REVALIDATE.products,
        tags: [tags.products(storeSlug)],
      },
    );
    const response = categoryProductsPageSchema.safeParse(raw);
    if (!response.success) {
      throw new Error("Invalid storefront category products response");
    }

    return {
      category,
      products: response.data.data.map(mapCategoryProduct),
      total: response.data.meta.total,
      totalPages: response.data.meta.totalPages,
    };
  },

  async getSitemapData(
    storeSlug: string,
  ): Promise<{ products: SitemapEntryData[]; categories: SitemapEntryData[] }> {
    const productsPath = (page: number) =>
      `${API_ENDPOINTS.CATALOG.PRODUCTS}?page=${page}&limit=100`;
    const [firstPage, rawCategories] = await Promise.all([
      serverFetch<unknown>(productsPath(1), storeSlug, {
        revalidate: REVALIDATE.products,
        tags: [tags.products(storeSlug)],
      }),
      serverFetch<unknown>(API_ENDPOINTS.CATALOG.CATEGORIES, storeSlug, {
        revalidate: REVALIDATE.categories,
        tags: [tags.categories(storeSlug)],
      }),
    ]);

    const firstPageResult = sitemapProductsPageSchema.safeParse(firstPage);
    if (!firstPageResult.success) {
      throw new Error("Invalid storefront sitemap product response");
    }

    const remainingPages: unknown[] = [];
    for (
      let page = 2;
      page <= firstPageResult.data.meta.totalPages;
      page += 1
    ) {
      remainingPages.push(
        await serverFetch<unknown>(productsPath(page), storeSlug, {
          revalidate: REVALIDATE.products,
          tags: [tags.products(storeSlug)],
        }),
      );
    }

    const products = [
      ...firstPageResult.data.data,
      ...remainingPages.flatMap((response) => {
        const parsed = sitemapProductsPageSchema.safeParse(response);
        if (!parsed.success) {
          throw new Error("Invalid storefront sitemap product page");
        }
        return parsed.data.data;
      }),
    ]
      .filter((product) => typeof product.slug === "string" && product.slug.trim())
      .map((product) => ({
        slug: product.slug!.trim(),
        updatedAt: product.updatedAt,
      }));

    const categoryEnvelope = z
      .object({ data: z.unknown() })
      .safeParse(rawCategories);
    if (!categoryEnvelope.success) {
      throw new Error("Invalid storefront sitemap category response");
    }

    return {
      products,
      categories: flattenSitemapCategories(categoryEnvelope.data.data),
    };
  },

  async getProducts(
    storeSlug: string,
    params: CatalogQueryOptions = {},
  ): Promise<ProductListResponse> {
    const searchParams = new URLSearchParams();
    if (params.page) searchParams.set("page", String(params.page));
    if (params.limit) searchParams.set("limit", String(params.limit));
    if (params.search) searchParams.set("search", params.search);
    if (params.categoryId) searchParams.set("categoryId", params.categoryId);
    if (params.sortBy) searchParams.set("sortBy", params.sortBy);
    if (params.sortOrder) searchParams.set("sortOrder", params.sortOrder);

    const qs = searchParams.toString() ? `?${searchParams.toString()}` : "";
    const raw = await serverFetch<any>(
      `${API_ENDPOINTS.CATALOG.PRODUCTS}${qs}`,
      storeSlug,
      {
        revalidate: REVALIDATE.products,
        tags: [tags.products(storeSlug)],
      },
    );

    const rawList = Array.isArray(raw)
      ? raw
      : (raw?.data || raw?.items || []);
    const items = normalizeProductList(rawList);
    const meta = raw?.meta || {};
    const total = Number(meta.total ?? raw?.total ?? items.length);
    const page = Number(meta.page ?? raw?.page ?? (params.page || 1));
    const limit = Number(
      meta.limit ?? raw?.limit ?? (params.limit || items.length || 12),
    );
    const totalPages = Number(
      meta.totalPages ??
        raw?.totalPages ??
        Math.max(1, Math.ceil(total / (limit || 1))),
    );

    return {
      items,
      total,
      page,
      limit,
      totalPages,
    };
  },

  async getCategories(storeSlug: string): Promise<Category[]> {
    return serverFetch<Category[]>(
      API_ENDPOINTS.CATALOG.CATEGORIES,
      storeSlug,
      {
        revalidate: REVALIDATE.categories,
        tags: [tags.categories(storeSlug)],
      },
    );
  },
};

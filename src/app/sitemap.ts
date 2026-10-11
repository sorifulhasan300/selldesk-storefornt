import type { MetadataRoute } from "next";
import { headers } from "next/headers";
import { getSitemapData } from "@/features/catalog/server";
import { getBootstrap, resolveStoreByHost } from "@/features/tenant/server";
import { getStoreOrigin } from "@/shared/seo/store-url";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const host = (await headers()).get("host");
  if (!host) return [];

  const storeSlug = await resolveStoreByHost(host);
  if (!storeSlug) return [];

  const [bootstrap, data] = await Promise.all([
    getBootstrap(storeSlug),
    getSitemapData(storeSlug),
  ]);
  const origin = getStoreOrigin(bootstrap.store);

  return [
    {
      url: new URL("/", origin).toString(),
      changeFrequency: "daily",
      priority: 1,
    },
    ...data.categories.map((category) => ({
      url: new URL(
        `/categories/${encodeURIComponent(category.slug)}`,
        origin,
      ).toString(),
      lastModified: category.updatedAt,
      changeFrequency: "weekly" as const,
    })),
    ...data.products.map((product) => ({
      url: new URL(
        `/products/${encodeURIComponent(product.slug)}`,
        origin,
      ).toString(),
      lastModified: product.updatedAt,
      changeFrequency: "weekly" as const,
    })),
  ];
}

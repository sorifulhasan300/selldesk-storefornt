import type { MetadataRoute } from "next";
import { headers } from "next/headers";
import { getBootstrap, resolveStoreByHost } from "@/features/tenant/server";
import { getStoreOrigin } from "@/shared/seo/store-url";

export default async function robots(): Promise<MetadataRoute.Robots> {
  const host = (await headers()).get("host");
  const storeSlug = host ? await resolveStoreByHost(host) : null;
  const bootstrap = storeSlug ? await getBootstrap(storeSlug) : null;

  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/cart", "/checkout", "/api", "/orders"],
    },
    ...(bootstrap
      ? { sitemap: `${getStoreOrigin(bootstrap.store)}/sitemap.xml` }
      : {}),
  };
}

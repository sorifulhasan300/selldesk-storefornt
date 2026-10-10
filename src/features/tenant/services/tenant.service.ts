import "server-only";
import { serverFetch } from "@/shared/api/server-fetch";
import { tags, REVALIDATE } from "@/shared/api/tags";
import { StorefrontBootstrap } from "@/shared/types";
import { normalizeBootstrap } from "../utils/normalize-bootstrap";

export const tenantService = {
  async getBootstrap(storeSlug: string): Promise<StorefrontBootstrap> {
    const raw = await serverFetch<unknown>("/storefront/init", storeSlug, {
      revalidate: REVALIDATE.bootstrap,
      tags: [tags.bootstrap(storeSlug)],
    });
    return normalizeBootstrap(raw, storeSlug);
  },

  async resolveStoreByHost(host: string): Promise<string | null> {
    try {
      const res = await serverFetch<{ slug?: string; storeSlug?: string }>(
        `/storefront/resolve-host?host=${encodeURIComponent(host)}`,
        host,
        {
          revalidate: 300,
        },
      );
      return res.slug || res.storeSlug || null;
    } catch {
      return null;
    }
  },
};


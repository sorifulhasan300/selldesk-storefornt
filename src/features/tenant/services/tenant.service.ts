import "server-only";
import { serverFetch } from "@/shared/api/server-fetch";
import { tags, REVALIDATE } from "@/shared/api/tags";
import { StorefrontBootstrap } from "@/shared/types";
import { normalizeBootstrap } from "../utils/normalize-bootstrap";

export const tenantService = {
  /**
   * Fetches the storefront bootstrap data.
   *
   * Caching strategy:
   * - development or preview mode → cache: "no-store" (instant updates, no 1-hour delay)
   * - production public traffic   → revalidate: REVALIDATE.bootstrap (ISR, 1-hour cache)
   */
  async getBootstrap(
    storeSlug: string,
    isPreview = false,
  ): Promise<StorefrontBootstrap> {
    const bypassCache =
      process.env.NODE_ENV === "development" || isPreview === true;

    const raw = await serverFetch<unknown>("/storefront/init", storeSlug,
      bypassCache
        ? { noStore: true }
        : { revalidate: REVALIDATE.bootstrap, tags: [tags.bootstrap(storeSlug)] },
    );
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


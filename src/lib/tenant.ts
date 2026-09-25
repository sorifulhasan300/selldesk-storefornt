import { headers } from "next/headers";

/**
 * Extracts storeSlug from incoming request headers injected by middleware.
 */
export async function getStoreSlugFromHeaders(): Promise<string> {
  const headersList = await headers();
  const slug = headersList.get("x-store-slug");
  if (!slug) {
    throw new Error("Missing x-store-slug header in request context");
  }
  return slug;
}

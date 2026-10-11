import "server-only";
import { serverFetch } from "@/shared/api/server-fetch";
import { tags, REVALIDATE } from "@/shared/api/tags";
import { API_ENDPOINTS } from "@/shared/constants";
import { Product } from "@/shared/types";

export const productService = {
  async getBySlug(storeSlug: string, slug: string): Promise<Product> {
    return serverFetch<Product>(
      API_ENDPOINTS.PRODUCTS.PRODUCT_BY_SLUG(slug),
      storeSlug,
      {
        revalidate: REVALIDATE.product,
        tags: [tags.product(storeSlug, slug)],
      },
    );
  },
};

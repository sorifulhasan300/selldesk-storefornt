import "server-only";
import { notFound } from "next/navigation";
import { productService } from "./services/product.service";
import { isNotFoundError } from "@/shared/api/api-error";
import { sanitizeHtml } from "@/shared/lib/sanitize-html";
import type {
  Product,
  ProductPageConfig,
  SanitizedProductPageConfig,
} from "@/shared/types";

export async function getProductBySlug(
  storeSlug: string,
  slug: string,
): Promise<Product> {
  try {
    return await productService.getBySlug(storeSlug, slug);
  } catch (error) {
    if (isNotFoundError(error)) {
      notFound();
    }
    throw error;
  }
}

export async function getProductOrNotFound(
  storeSlug: string,
  slug: string,
): Promise<Product> {
  return getProductBySlug(storeSlug, slug);
}

/**
 * Sanitizes merchant-authored product tab and size-guide HTML on the server.
 */
export function sanitizeProductPageConfig(
  config: ProductPageConfig | null | undefined,
): SanitizedProductPageConfig | undefined {
  if (!config) return undefined;

  const sizeGuide = config.sizeGuide
    ? {
        ...config.sizeGuide,
        content:
          typeof config.sizeGuide.content === "string"
            ? sanitizeHtml(config.sizeGuide.content)
            : null,
      }
    : config.sizeGuide;

  const tabs = Array.isArray(config.tabs)
    ? config.tabs.map((tab) => ({
        ...tab,
        content:
          typeof tab.content === "string" ? sanitizeHtml(tab.content) : null,
      }))
    : undefined;

  return {
    ...config,
    sizeGuide,
    tabs,
  };
}

export { productService };


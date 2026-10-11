import "server-only";
import { notFound } from "next/navigation";
import {
  catalogService,
  type CatalogQueryOptions,
} from "./services/catalog.service";
import { isNotFoundError } from "@/shared/api/api-error";
import type { ProductListResponse, Category } from "@/shared/types";

export async function getProducts(
  storeSlug: string,
  params: CatalogQueryOptions = {},
): Promise<ProductListResponse> {
  try {
    return await catalogService.getProducts(storeSlug, params);
  } catch (error) {
    if (isNotFoundError(error)) {
      notFound();
    }
    throw error;
  }
}

export async function getCategories(storeSlug: string): Promise<Category[]> {
  try {
    return await catalogService.getCategories(storeSlug);
  } catch (error) {
    if (isNotFoundError(error)) {
      notFound();
    }
    throw error;
  }
}

export async function getSitemapData(storeSlug: string) {
  return catalogService.getSitemapData(storeSlug);
}

export async function getCategoryBySlug(storeSlug: string, slug: string) {
  return catalogService.getCategoryBySlug(storeSlug, slug);
}

export async function getCategoryProducts(
  storeSlug: string,
  category: Parameters<typeof catalogService.getCategoryProducts>[1],
  page: number,
) {
  return catalogService.getCategoryProducts(storeSlug, category, page);
}

export { catalogService };
export type { CatalogQueryOptions };

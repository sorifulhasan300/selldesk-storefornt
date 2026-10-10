import "server-only";
import { notFound } from "next/navigation";
import { productService } from "./services/product.service";
import { isNotFoundError } from "@/shared/api/api-error";
import type { Product } from "@/shared/types";

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

export { productService };


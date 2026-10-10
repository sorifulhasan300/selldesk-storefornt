import "server-only";
import { notFound } from "next/navigation";
import { tenantService } from "./services/tenant.service";
import { isNotFoundError } from "@/shared/api/api-error";
import type { StorefrontBootstrap } from "@/shared/types";

export async function getBootstrap(storeSlug: string): Promise<StorefrontBootstrap> {
  try {
    return await tenantService.getBootstrap(storeSlug);
  } catch (error) {
    if (isNotFoundError(error)) {
      notFound();
    }
    throw error;
  }
}

export async function resolveStoreByHost(host: string): Promise<string | null> {
  return tenantService.resolveStoreByHost(host);
}

export { tenantService };


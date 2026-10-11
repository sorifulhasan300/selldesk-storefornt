import "server-only";
import { notFound } from "next/navigation";
import { homeService } from "./services/home.service";
import { isNotFoundError } from "@/shared/api/api-error";
import type { HomePageSection } from "@/shared/types";

export async function getHomePageSections(
  storeSlug: string,
): Promise<HomePageSection[]> {
  try {
    return await homeService.getSections(storeSlug);
  } catch (error) {
    if (isNotFoundError(error)) {
      notFound();
    }
    throw error;
  }
}

export { homeService };


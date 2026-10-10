import "server-only";
import { homeService } from "./services/home.service";
import type { HomePageSection } from "@/shared/types";

export async function getHomePageSections(
  storeSlug: string,
): Promise<HomePageSection[]> {
  try {
    return await homeService.getSections(storeSlug);
  } catch {
    return [];
  }
}

export { homeService };


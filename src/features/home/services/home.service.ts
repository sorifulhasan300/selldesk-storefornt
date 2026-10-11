import "server-only";
import { serverFetch } from "@/shared/api/server-fetch";
import { tags, REVALIDATE } from "@/shared/api/tags";
import { API_ENDPOINTS } from "@/shared/constants";
import { HomePageSection } from "@/shared/types";

export const homeService = {
  async getSections(storeSlug: string): Promise<HomePageSection[]> {
    return serverFetch<HomePageSection[]>(
      API_ENDPOINTS.HOME.SECTIONS,
      storeSlug,
      {
        revalidate: REVALIDATE.sections,
        tags: [tags.sections(storeSlug)],
      },
    );
  },
};

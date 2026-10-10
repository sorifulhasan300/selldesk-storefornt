import "server-only";
import { serverFetch } from "@/shared/api/server-fetch";
import { tags, REVALIDATE } from "@/shared/api/tags";
import { HomePageSection } from "@/shared/types";

export const homeService = {
  async getSections(storeSlug: string): Promise<HomePageSection[]> {
    return serverFetch<HomePageSection[]>("/storefront/sections", storeSlug, {
      revalidate: REVALIDATE.sections,
      tags: [tags.sections(storeSlug)],
    });
  },
};


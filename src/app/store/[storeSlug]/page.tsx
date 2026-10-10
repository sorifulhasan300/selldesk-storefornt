import { getBootstrap } from "@/features/tenant/server";
import { getProducts } from "@/features/catalog/server";
import {
  StoreHomePageClient,
  getDefaultHomePageSections,
} from "@/features/home";
import type { HomePageSection } from "@/shared/types";

export const dynamicParams = true;
export function generateStaticParams() {
  return [];
}

interface StoreHomePageProps {
  params: Promise<{ storeSlug: string }>;
  searchParams?: Promise<{
    preview?: string;
    [key: string]: string | string[] | undefined;
  }>;
}

export default async function StoreHomePage({
  params,
  searchParams,
}: StoreHomePageProps) {
  const { storeSlug } = await params;
  const resolvedSearchParams = searchParams ? await searchParams : {};
  const isPreview = resolvedSearchParams.preview === "true";

  const [bootstrap, pData] = await Promise.all([
    getBootstrap(storeSlug),
    getProducts(storeSlug, { limit: 8 }),
  ]);

  const store = bootstrap.store;
  const products = pData.items || [];
  const sliders = bootstrap.sliders || [];
  const categories = bootstrap.categories || [];

  const rawSections: HomePageSection[] =
    bootstrap.config?.homePage?.sections ||
    bootstrap.homePage?.sections ||
    bootstrap.sections ||
    [];

  const initialSections: HomePageSection[] =
    rawSections.length > 0
      ? rawSections
      : getDefaultHomePageSections(sliders, categories, products);

  return (
    <StoreHomePageClient
      initialSections={initialSections}
      store={store}
      currency={store?.currency || "USD"}
      products={products}
      categories={categories}
      sliders={sliders}
      isPreview={isPreview}
    />
  );
}

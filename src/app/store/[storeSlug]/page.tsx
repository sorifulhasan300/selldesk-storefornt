import { StorefrontService } from "@/services/storefront.service";
import { Product, StorefrontBootstrap, HomePageSection } from "@/types";
import { StoreHomePageClient } from "@/components/home/StoreHomePageClient";
import {
  getMockBootstrap,
  MOCK_FALLBACK_PRODUCTS,
  getDefaultHomePageSections,
} from "@/constants/mock-storefront.constants";

interface StoreHomePageProps {
  params: Promise<{ storeSlug: string }>;
  searchParams?: Promise<{ preview?: string; [key: string]: string | string[] | undefined }>;
}

export default async function StoreHomePage({
  params,
  searchParams,
}: StoreHomePageProps) {
  const { storeSlug } = await params;
  const resolvedSearchParams = searchParams ? await searchParams : {};
  const isPreview = resolvedSearchParams.preview === "true";

  let bootstrap: StorefrontBootstrap;
  let products: Product[] = [];

  try {
    const [bData, pData] = await Promise.all([
      StorefrontService.getBootstrap(storeSlug),
      StorefrontService.getProducts(storeSlug, { limit: 8 }),
    ]);
    bootstrap = bData;
    products = pData.items || [];
  } catch {
    bootstrap = getMockBootstrap(storeSlug);
    products = MOCK_FALLBACK_PRODUCTS;
  }

  const fallbackStore = {
    id: "mock-store-id",
    name: storeSlug
      .replace(/-/g, " ")
      .replace(/\b\w/g, (c: string) => c.toUpperCase()),
    subDomain: storeSlug,
    currency: "USD",
    themeColor: "#2563eb",
    description: "Official customer storefront powered by SellDesk.",
  };

  const store = bootstrap?.store || fallbackStore;
  const sliders = bootstrap?.sliders || [];
  const categories = bootstrap?.categories || [];

  // Extract server-fetched sections from bootstrap response
  const rawSections: HomePageSection[] =
    bootstrap?.config?.homePage?.sections ||
    bootstrap?.homePage?.sections ||
    bootstrap?.sections ||
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

import { serverFetch, createApiClient } from "./api-client";
import {
  StorefrontBootstrap,
  StoreConfig,
  Product,
  ProductListResponse,
  Category,
  CheckoutDto,
  CheckoutResponse,
  CouponDiscount,
} from "@/types";

export function normalizeBootstrap(
  raw: any,
  storeSlug: string,
): StorefrontBootstrap {
  if (!raw) {
    return {
      store: {
        id: "mock-store-id",
        name: storeSlug,
        subDomain: storeSlug,
        currency: "USD",
        themeColor: "#2563eb",
      },
    };
  }

  const business = raw.business || {};
  const config = raw.config || {};
  const color = config.color || {};
  const contact = config.contact || {};
  const header = config.header || {};
  const footer = config.footer || {};
  const socialLinks = footer.socialLinks || {};

  const cleanName =
    business.name ||
    raw.store?.name ||
    storeSlug
      .replace(/-/g, " ")
      .replace(/\b\w/g, (c: string) => c.toUpperCase());

  const store: StoreConfig = {
    id: raw.store?.id || business.id || "mock-store-id",
    name: cleanName,
    subDomain:
      raw.store?.subDomain ||
      (business.domain ? business.domain.split(".")[0] : storeSlug),
    currency:
      raw.store?.currency || business.currencyCode || business.currency || "USD",
    logoUrl: raw.store?.logoUrl || business.logo || header.logo || null,
    bannerUrl: raw.store?.bannerUrl || business.bannerUrl || null,
    contactEmail:
      raw.store?.contactEmail || contact.email || raw.user?.email || null,
    contactPhone:
      raw.store?.contactPhone || contact.phone || raw.user?.phone || null,
    themeColor:
      raw.store?.themeColor || color.primary || color.theme || "#2563eb",
    description:
      raw.store?.description ||
      config.seo?.metaDescription ||
      `Official store for ${cleanName}`,
    facebookUrl: raw.store?.facebookUrl || socialLinks.facebook || null,
    instagramUrl: raw.store?.instagramUrl || socialLinks.instagram || null,
  };

  const homePageSections = config.homePage?.sections || raw.sections || [];
  const bannerSection = homePageSections.find(
    (s: any) => s.type === "banners" || s.type === "heroSlider",
  );
  const categorySection = homePageSections.find(
    (s: any) => s.type === "categories" || s.type === "category",
  );

  const sliders =
    raw.sliders ||
    (bannerSection?.data
      ? bannerSection.data.map((item: any) => ({
          id: item.id || `s-${item.sortOrder || 1}`,
          title: item.title || "",
          subtitle: item.subtitle || null,
          imageUrl: item.imageUrl || "",
          linkUrl: item.redirectUrl || item.linkUrl || "/products",
          order: item.sortOrder ?? 0,
        }))
      : []);

  const categories =
    raw.categories ||
    (categorySection?.data
      ? categorySection.data.map((item: any) => ({
          id: item.id || item._id,
          name: item.name,
          slug: item.slug,
          imageUrl: item.imageUrl || null,
          productCount: item.productCount,
        }))
      : []);

  return {
    ...raw,
    store,
    sliders,
    categories,
    deliveryCharge: raw.deliveryCharge || config.deliveryCharge,
    homePage: raw.homePage || config.homePage,
    sections: raw.sections || homePageSections,
    config,
    business,
  };
}

export const StorefrontService = {
  // --- Server-side Data Fetching (RSC / ISR) ---

  async getBootstrap(storeSlug: string): Promise<StorefrontBootstrap> {
    const raw = await serverFetch<any>("/storefront/init", storeSlug, {
      revalidate: 3600,
      tags: [`store:${storeSlug}:bootstrap`],
    });
    return normalizeBootstrap(raw, storeSlug);
  },

  async getProducts(
    storeSlug: string,
    params: {
      page?: number;
      limit?: number;
      search?: string;
      categoryId?: string;
      sortBy?: string;
      sortOrder?: "asc" | "desc";
    } = {},
  ): Promise<ProductListResponse> {
    const searchParams = new URLSearchParams();
    if (params.page) searchParams.set("page", String(params.page));
    if (params.limit) searchParams.set("limit", String(params.limit));
    if (params.search) searchParams.set("search", params.search);
    if (params.categoryId) searchParams.set("categoryId", params.categoryId);
    if (params.sortBy) searchParams.set("sortBy", params.sortBy);
    if (params.sortOrder) searchParams.set("sortOrder", params.sortOrder);

    const qs = searchParams.toString() ? `?${searchParams.toString()}` : "";
    return serverFetch<ProductListResponse>(
      `/storefront/products${qs}`,
      storeSlug,
      {
        revalidate: 120,
        tags: [`store:${storeSlug}:products`],
      },
    );
  },

  async getProductBySlug(storeSlug: string, slug: string): Promise<Product> {
    return serverFetch<Product>(`/storefront/products/${slug}`, storeSlug, {
      revalidate: 300,
      tags: [`store:${storeSlug}:product:${slug}`],
    });
  },

  async getCategories(storeSlug: string): Promise<Category[]> {
    return serverFetch<Category[]>("/storefront/categories", storeSlug, {
      revalidate: 1800,
      tags: [`store:${storeSlug}:categories`],
    });
  },

  // --- Client-side Mutations & Actions ---

  async validateCoupon(
    storeSlug: string,
    code: string,
    cartTotal: number,
  ): Promise<CouponDiscount> {
    const client = createApiClient(storeSlug);
    const res = await client.post("/storefront/cart/validate-coupon", {
      code,
      cartTotal,
    });
    return (res as any).data ?? res;
  },

  async checkout(
    storeSlug: string,
    dto: CheckoutDto,
  ): Promise<CheckoutResponse> {
    const client = createApiClient(storeSlug);
    const res = await client.post("/orders/checkout", dto);
    return (res as any).data ?? res;
  },
};

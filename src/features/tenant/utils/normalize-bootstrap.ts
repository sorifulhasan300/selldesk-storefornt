import { StorefrontBootstrap, StoreConfig } from "@/shared/types";

const COLOR_REGEX =
  /^(#[0-9a-f]{3,8}|rgba?\([\d\s.,%]+\)|hsla?\([\d\s.,%]+\)|transparent)$/i;

function safeColor(v: unknown, fallback: string = "#0f172a"): string {
  if (typeof v === "string" && COLOR_REGEX.test(v.trim())) {
    return v.trim();
  }
  return fallback;
}

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
        themeColor: "#0f172a",
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
    themeColor: safeColor(
      raw.store?.themeColor || color.primary || color.theme,
      "#0f172a",
    ),
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


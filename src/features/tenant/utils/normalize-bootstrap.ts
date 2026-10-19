import {
  StorefrontBootstrap,
  StorefrontSliderConfig,
  StorefrontPopupConfig,
  StorefrontProductCardConfig,
  StorefrontProductPageConfig,
  HomePageSection,
} from "@/shared/types";
import { normalizeBootstrapSliders } from "./normalize-slider";
import {
  buildStoreConfig,
  extractHeaderLogo,
  extractSocialLinks,
} from "./normalize-store";

function isLegacyHeroSliderSection(section: HomePageSection): boolean {
  const normalize = (value: string | undefined) =>
    value?.trim().toLowerCase().replace(/[-_]/g, "");

  return (
    normalize(section.type) === "heroslider" ||
    normalize(section.key) === "heroslider" ||
    section.id?.trim().toLowerCase() === "sec-hero-slider" ||
    section.id?.trim().toLowerCase() === "sec-hero-default"
  );
}

export function normalizeBootstrap(
  rawInput: unknown,
  storeSlug: string,
): StorefrontBootstrap {
  if (!rawInput || typeof rawInput !== "object") {
    return {
      store: {
        id: "",
        name: storeSlug,
        subDomain: storeSlug,
        currency: "USD",
        themeColor: "#2563eb",
        description: null,
      },
    };
  }

  const raw = rawInput as Record<string, unknown>;
  const business = (raw.business || {}) as Record<string, unknown>;
  const rawConfig = (raw.config && typeof raw.config === "object"
    ? raw.config
    : {}) as Record<string, unknown>;
  const config = { ...rawConfig };
  const header = (config.header || {}) as Record<string, unknown>;
  const footer = (config.footer || {}) as Record<string, unknown>;
  const headerLogo = extractHeaderLogo(header);
  const rawSocial = config.socialLinks || footer.socialLinks || raw.socialLinks;
  const socialLinks = extractSocialLinks(rawSocial);
  config.socialLinks = socialLinks;
  footer.socialLinks = socialLinks;

  const store = buildStoreConfig(raw, storeSlug, headerLogo, socialLinks);

  const rawHome = (raw.homePage || config.homePage || rawConfig.homePage || {}) as Record<string, unknown>;
  const rawSectionsList: HomePageSection[] =
    (rawHome.sections as HomePageSection[]) ||
    (raw.sections as HomePageSection[]) ||
    (rawConfig.sections as HomePageSection[]) ||
    [];

  const legacyHeroSection = rawSectionsList.find(isLegacyHeroSliderSection);

  const categorySection = rawSectionsList.find(
    (s) => s.type === "categories" || s.type === "category",
  );

  const sliderConfig = (config.slider || rawConfig.slider) as
    | StorefrontSliderConfig
    | undefined;

  const popupConfig = (config.popup || rawConfig.popup || raw.popup) as
    | StorefrontPopupConfig
    | undefined;

  const rawTheme = (raw.theme || {}) as Record<string, unknown>;
  const productCard = (config.productCard ||
    rawConfig.productCard ||
    raw.productCard ||
    rawTheme.productCard) as StorefrontProductCardConfig | undefined;

  const rawProductPage = (config.productPage ||
    rawConfig.productPage ||
    raw.productPage) as Partial<StorefrontProductPageConfig> | undefined;

  const productPage: StorefrontProductPageConfig | undefined = rawProductPage
    ? {
        layout: (Number(rawProductPage.layout) || 1) as StorefrontProductPageConfig["layout"],
        tabLayout: (Number(rawProductPage.tabLayout) || 4) as StorefrontProductPageConfig["tabLayout"],
        imageZoom: rawProductPage.imageZoom ?? true,
        showBreadcrumb: rawProductPage.showBreadcrumb ?? true,
        showRelatedProducts: rawProductPage.showRelatedProducts ?? true,
        showReviews: rawProductPage.showReviews ?? true,
        showStickyBuyButton: rawProductPage.showStickyBuyButton ?? true,
        showStockCounter: rawProductPage.showStockCounter ?? true,
        sizeGuide: rawProductPage.sizeGuide || null,
        defaultVariantSelection: rawProductPage.defaultVariantSelection ?? "first",
        actions:
          Array.isArray(rawProductPage.actions) && rawProductPage.actions.length > 0
            ? rawProductPage.actions
            : [
                { key: "addToCart", enabled: true, label: "Add to Cart", display: "both", width: "half" },
                { key: "buyNow", enabled: true, label: "Buy Now", display: "both", width: "half" },
                { key: "whatsapp", enabled: true, label: "WhatsApp Order", display: "both", width: "half" },
                { key: "messenger", enabled: false, label: "Messenger", display: "both", width: "half" },
                { key: "call", enabled: true, label: "Call Hotline", display: "both", width: "half" },
                { key: "wishlist", enabled: true, label: "Add to Wishlist", display: "both", width: "full" },
              ],
        tabs:
          Array.isArray(rawProductPage.tabs) && rawProductPage.tabs.length > 0
            ? rawProductPage.tabs
            : [
                { key: "description", type: "builtin", label: "Description", content: null },
                { key: "specifications", type: "builtin", label: "Specifications", content: null },
              ],
      }
    : undefined;

  const { sliders, isSliderActive } = normalizeBootstrapSliders(
    sliderConfig,
    raw.sliders,
    legacyHeroSection?.data,
  );

  const homePageSections: HomePageSection[] = rawSectionsList.map((sec) => {
    if (isLegacyHeroSliderSection(sec)) {
      return {
        ...sec,
        isActive: sliderConfig ? sliderConfig.active !== false : isSliderActive && sec.isActive !== false,
        data: sliders.length > 0 ? sliders : sec.data,
        config: {
          ...(sec.config || {}),
          ...(sliderConfig || {}),
          ...(sliders.length > 0 ? { items: sliders } : {}),
        },
      };
    }
    return sec;
  });

  const categories =
    raw.categories ||
    (categorySection?.data
      ? (categorySection.data as Record<string, unknown>[]).map((item) => ({
          id: (item.id || item._id) as string,
          name: (item.name || "") as string,
          slug: (item.slug || "") as string,
          imageUrl: (item.imageUrl || null) as string | null,
          productCount: item.productCount as number | undefined,
        }))
      : []);

  return {
    ...raw,
    store,
    sliders,
    categories: categories as StorefrontBootstrap["categories"],
    deliveryCharge:
      (raw.deliveryCharge as StorefrontBootstrap["deliveryCharge"]) ||
      (config.deliveryCharge as StorefrontBootstrap["deliveryCharge"]),
    homePage: {
      ...rawHome,
      sections: homePageSections,
    },
    sections: homePageSections,
    config: {
      ...config,
      ...(sliderConfig ? { slider: sliderConfig } : {}),
      ...(popupConfig ? { popup: popupConfig } : {}),
      ...(productCard ? { productCard } : {}),
      ...(productPage ? { productPage } : {}),
      homePage: {
        ...(config.homePage as Record<string, unknown> | undefined),
        sections: homePageSections,
      },
    },
    business,
  };
}

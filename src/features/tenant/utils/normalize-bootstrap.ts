import {
  StorefrontBootstrap,
  StorefrontSliderConfig,
  StorefrontPopupConfig,
  StorefrontProductCardConfig,
  StorefrontProductPageConfig,
  StorefrontCheckoutConfig,
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

export const DEFAULT_CHECKOUT_CONFIG: StorefrontCheckoutConfig = {
  deliveryInfoLabel: "Shipping & Customer Details",
  nameLabel: "Full Name",
  phoneLabel: "Phone Number",
  districtLabel: "District",
  addressLabel: "Full Shipping Address",
  showCoupon: true,
  couponLabel: "Promo Code",
  orderSummaryLabel: "Order Summary",
  subtotalLabel: "Subtotal",
  deliveryChargeLabel: "Delivery Fee",
  totalLabel: "Total Amount",
  placeOrderLabel: "Confirm Order",
  showAgreement: true,
};

export function normalizeCheckoutConfig(
  raw?: unknown,
): StorefrontCheckoutConfig {
  if (!raw || typeof raw !== "object") {
    return { ...DEFAULT_CHECKOUT_CONFIG };
  }

  const data = raw as Record<string, unknown>;

  return {
    deliveryInfoLabel:
      typeof data.deliveryInfoLabel === "string" && data.deliveryInfoLabel.trim() !== ""
        ? data.deliveryInfoLabel
        : DEFAULT_CHECKOUT_CONFIG.deliveryInfoLabel,
    nameLabel:
      typeof data.nameLabel === "string" && data.nameLabel.trim() !== ""
        ? data.nameLabel
        : DEFAULT_CHECKOUT_CONFIG.nameLabel,
    phoneLabel:
      typeof data.phoneLabel === "string" && data.phoneLabel.trim() !== ""
        ? data.phoneLabel
        : DEFAULT_CHECKOUT_CONFIG.phoneLabel,
    districtLabel:
      typeof data.districtLabel === "string" && data.districtLabel.trim() !== ""
        ? data.districtLabel
        : DEFAULT_CHECKOUT_CONFIG.districtLabel,
    addressLabel:
      typeof data.addressLabel === "string" && data.addressLabel.trim() !== ""
        ? data.addressLabel
        : DEFAULT_CHECKOUT_CONFIG.addressLabel,
    showCoupon:
      typeof data.showCoupon === "boolean"
        ? data.showCoupon
        : DEFAULT_CHECKOUT_CONFIG.showCoupon,
    couponLabel:
      typeof data.couponLabel === "string" && data.couponLabel.trim() !== ""
        ? data.couponLabel
        : DEFAULT_CHECKOUT_CONFIG.couponLabel,
    orderSummaryLabel:
      typeof data.orderSummaryLabel === "string" && data.orderSummaryLabel.trim() !== ""
        ? data.orderSummaryLabel
        : DEFAULT_CHECKOUT_CONFIG.orderSummaryLabel,
    subtotalLabel:
      typeof data.subtotalLabel === "string" && data.subtotalLabel.trim() !== ""
        ? data.subtotalLabel
        : DEFAULT_CHECKOUT_CONFIG.subtotalLabel,
    deliveryChargeLabel:
      typeof data.deliveryChargeLabel === "string" && data.deliveryChargeLabel.trim() !== ""
        ? data.deliveryChargeLabel
        : DEFAULT_CHECKOUT_CONFIG.deliveryChargeLabel,
    totalLabel:
      typeof data.totalLabel === "string" && data.totalLabel.trim() !== ""
        ? data.totalLabel
        : DEFAULT_CHECKOUT_CONFIG.totalLabel,
    placeOrderLabel:
      typeof data.placeOrderLabel === "string" && data.placeOrderLabel.trim() !== ""
        ? data.placeOrderLabel
        : DEFAULT_CHECKOUT_CONFIG.placeOrderLabel,
    showAgreement:
      typeof data.showAgreement === "boolean"
        ? data.showAgreement
        : DEFAULT_CHECKOUT_CONFIG.showAgreement,
  };
}

function normalizeWishlistConfig(rawWishlist: unknown): { active: boolean } {
  if (
    rawWishlist &&
    typeof rawWishlist === "object" &&
    "active" in rawWishlist &&
    typeof (rawWishlist as { active: unknown }).active === "boolean"
  ) {
    return { active: (rawWishlist as { active: boolean }).active };
  }
  return { active: true };
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
      checkout: { ...DEFAULT_CHECKOUT_CONFIG },
      wishlist: { active: true },
      config: {
        wishlist: { active: true },
        checkout: { ...DEFAULT_CHECKOUT_CONFIG },
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

  const rawCheckout =
    raw.checkout ||
    config.checkout ||
    rawConfig.checkout ||
    raw.checkoutConfig ||
    config.checkoutConfig;
  const checkout = normalizeCheckoutConfig(rawCheckout);

  const rawWishlist =
    raw.wishlist ??
    config.wishlist ??
    rawConfig.wishlist;
  const wishlist = normalizeWishlistConfig(rawWishlist);

  return {
    ...raw,
    store,
    sliders,
    categories: categories as StorefrontBootstrap["categories"],
    deliveryCharge:
      (raw.deliveryCharge as StorefrontBootstrap["deliveryCharge"]) ||
      (config.deliveryCharge as StorefrontBootstrap["deliveryCharge"]),
    checkout,
    wishlist,
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
      checkout,
      wishlist,
      homePage: {
        ...(config.homePage as Record<string, unknown> | undefined),
        sections: homePageSections,
      },
    },
    business,
  };
}

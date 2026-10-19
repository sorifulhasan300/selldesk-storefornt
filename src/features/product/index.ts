export { ProductBreadcrumb } from "./components/ProductBreadcrumb";
export { ProductGallery } from "./components/ProductGallery";
export { ProductInfoSummary } from "./components/ProductInfoSummary";
export { ProductQuantityAction } from "./components/ProductQuantityAction";
export { ProductSocialOrderBar } from "./components/ProductSocialOrderBar";
export { ProductSpecifications } from "./components/ProductSpecifications";
export { ProductTabsSection } from "./components/ProductTabsSection";
export { ProductRelatedGrid } from "./components/ProductRelatedGrid";
export {
  ProductPurchaseProvider,
  useProductPurchase,
  useOptionalProductPurchase,
} from "./components/product-purchase-provider";
export { MobileStickyBuyBar } from "./components/mobile-sticky-buy-bar";
export { ProductTrustBadges } from "./components/product-trust-badges";
export { AddToCartCTA } from "./components/add-to-cart-cta";

export {
  resolveProductSlug,
  buildProductPath,
  buildProductAbsoluteUrl,
  buildWhatsAppOrderUrl,
  buildMessengerOrderUrl,
  buildHotlineTelUrl,
  sanitizePhoneNumber,
} from "./utils/product-url.utils";

export type * from "@/shared/types/product";

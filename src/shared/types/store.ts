import { HomePageSection } from "./section";
import { Product } from "./product";

export interface StoreConfig {
  id: string;
  name: string;
  subDomain: string;
  domain?: string | null;
  currency: string;
  logoUrl?: string | null;
  bannerUrl?: string | null;
  contactEmail?: string | null;
  contactPhone?: string | null;
  themeColor?: string | null;
  description?: string | null;
  facebookUrl?: string | null;
  instagramUrl?: string | null;
}

export interface StoreSlider {
  id: string;
  title: string;
  subtitle?: string | null;
  imageUrl: string;
  linkUrl?: string | null;
  order?: number;
}

export interface DeliveryZone {
  id?: string;
  name: string;
  charge: number;
  districts?: string[];
}

export interface FreeDeliveryConfig {
  active: boolean;
  minOrderAmount: number;
}

export interface StoreDeliveryCharge {
  chargeMode?: "district" | "city" | "flat" | string;
  freeDelivery?: FreeDeliveryConfig | null;
  zones?: DeliveryZone[] | null;
  insideCity?: number;
  outsideCity?: number;
  subAreaCharge?: number;
  freeDeliveryThreshold?: number | null;
  isActive?: boolean;
}

export interface StorefrontColorConfig {
  bg?: string;
  primary?: string;
  text?: string;
}

export interface StorefrontTopbarConfig {
  isActive?: boolean;
  announcementText?: string;
  showSocialLinks?: boolean;
  phone?: string;
  showPhone?: boolean;
  bgColor?: string;
  textColor?: string;
}

export interface HeaderActionItem {
  type: string;
  showOnDesktop?: boolean;
  showOnMobile?: boolean;
  label?: string;
  order?: number;
}

export interface HeaderLogoThumbs {
  large?: string;
  medium?: string;
  url?: string;
}

export interface HeaderLogoObject {
  thumbs?: HeaderLogoThumbs;
  _id?: string;
}

export interface StorefrontHeaderConfig {
  logo?: string | HeaderLogoObject | null;
  searchEnabled?: boolean;
  cartEnabled?: boolean;
  wishListEnabled?: boolean;
  stickyHeader?: boolean;
  height?: number;
  layout?: number | string;
  actions?: HeaderActionItem[];
  actionFontSize?: number;
  actionIconSize?: number;
  actionStyle?: number | string;
  searchStyle?: number | string;
  bgColor?: string;
  textColor?: string;
  bgColorMode?: "theme" | "custom";
  textColorMode?: "theme" | "custom";
  hideDeveloperCredit?: boolean;
}

export interface StorefrontNavbarLinkConfig {
  title: string;
  url: string;
  order?: number;
}

export interface StorefrontNavbarMenuItemConfig {
  refType?: "custom" | "category" | "page" | string;
  refId?: string | null;
  label?: string;
  link?: string;
  children?: StorefrontNavbarMenuItemConfig[];
}

export interface StorefrontNavbarConfig {
  active?: boolean;
  layout?: number;
  height?: number;
  fontSize?: number;
  bgColor?: string;
  textColor?: string;
  megaCategory?: {
    active?: boolean;
    label?: string;
    icon?: string;
  };
  menuItems?: StorefrontNavbarMenuItemConfig[];
  style?: "default" | "pill" | "underline" | "bordered";
  links?: StorefrontNavbarLinkConfig[];
}

export interface StorefrontFooterLinkConfig {
  title: string;
  url: string;
}

export interface StorefrontFooterColumnConfig {
  title: string;
  items?: Array<{
    label: string;
    link: string;
  }>;
  links?: StorefrontFooterLinkConfig[];
}

export interface StorefrontFooterConfig {
  layout?: number;
  collapsibleOnMobile?: boolean;
  logo?: string | HeaderLogoObject | null;
  about?: string;
  copyright?: string;
  socialLinks?: Record<string, string>;
  socialIconStyle?: {
    shape?: "circle" | "rounded" | "square" | "icon";
    size?: number;
    gap?: number;
    mode?: "brand" | "custom";
    color?: string;
  };
  columns?: StorefrontFooterColumnConfig[];
  bottomBar?: {
    enabled?: boolean;
    copyright?: string;
    showDeveloperCredit?: boolean;
    paymentIcons?: string[];
  };
  style?: {
    backgroundMode?: "solid" | "gradient";
    bgColor?: string;
    gradientStartColor?: string;
    gradientEndColor?: string;
    textColor?: string;
    headingColor?: string;
    fontSize?: number;
    headingFontSize?: number;
    borderTopColor?: string;
    borderTopSize?: number;
    paddingTop?: number;
    paddingBottom?: number;
  };
}

export type BottomNavItemKey =
  | "category"
  | "search"
  | "home"
  | "cart"
  | "track"
  | "wishlist"
  | "account";

export type BottomNavIconName =
  | "home"
  | "grid"
  | "grid-2x2"
  | "layout-grid"
  | "shopping-bag"
  | "shopping-cart"
  | "user"
  | "heart"
  | "search"
  | "tag"
  | "package"
  | "star";

export interface StorefrontBottomNavItemConfig {
  /** Display label shown below the icon */
  label: string;
  /** Lucide icon name (kebab-case) */
  iconName: BottomNavIconName;
  /** Navigation URL; omit or set to "cart" to open the cart drawer instead */
  href?: string;
  /** When true this item opens the cart drawer rather than navigating */
  openCart?: boolean;
}

export interface LegacyStorefrontBottomNavItemConfig {
  label?: string;
  icon?: string;
  iconName?: string;
  path?: string;
  href?: string;
  openCart?: boolean;
}

export interface StorefrontBottomNavConfig {
  active?: boolean;
  layout?: 1 | 2;
  showLabels?: boolean;
  bgColor?: string;
  iconColor?: string;
  activeColor?: string;
  homeIcon?: string | null;
  items?: Array<BottomNavItemKey | LegacyStorefrontBottomNavItemConfig>;
}

export interface StorefrontSliderItemConfig {
  id?: string;
  _id?: string;
  active?: boolean;
  link?: string | null;
  linkUrl?: string | null;
  redirectUrl?: string | null;
  title?: string;
  subtitle?: string | null;
  imageUrl?: string;
  url?: string;
  image?:
    | {
        id?: string;
        _id?: string;
        url?: string;
        thumbs?: {
          large?: string;
          medium?: string;
          url?: string;
        };
      }
    | string
    | null;
  order?: number;
  sortOrder?: number;
}

export interface StorefrontSliderConfig {
  active?: boolean;
  layout?: 1 | 2 | 3;
  autoplay?: boolean;
  autoplayInterval?: number;
  showArrows?: boolean;
  showDots?: boolean;
  marginTop?: number;
  marginBottom?: number;
  borderRadius?: number;
  cornerRadius?: number;
  backgroundColor?: string | null;
  backgroundGradient?: string | null;
  items?: StorefrontSliderItemConfig[];
  [key: string]: unknown;
}

export interface StorefrontProductCardConfig {
  style?: number | string;
  showAddToCart?: boolean;
  showBuyNow?: boolean;
  showBrand?: boolean;
  showDiscountBadge?: boolean;
  showStockBadge?: boolean;
  showBoxShadow?: boolean;
  showQuickView?: boolean;
  addToCartLabel?: string;
  buyNowLabel?: string;
  preOrderLabel?: string;
  imgHeight?: number;
  borderRadius?: number;
  titleLines?: number;
}

export interface StorefrontConfig {
  seo?: {
    metaTitle?: string;
    metaDescription?: string;
    ogImage?: string;
    keywords?: string[];
  };
  currency?: {
    code?: string;
    symbol?: string;
    position?: "prefix" | "suffix";
  };
  contact?: {
    phone?: string;
    whatsapp?: string;
    messenger?: string;
    email?: string;
    address?: string;
  };
  color?: StorefrontColorConfig;
  header?: StorefrontHeaderConfig;
  navbar?: StorefrontNavbarConfig;
  topbar?: StorefrontTopbarConfig;
  footer?: StorefrontFooterConfig;
  socialLinks?: Record<string, string>;
  bottomNav?: StorefrontBottomNavConfig;
  slider?: StorefrontSliderConfig;
  productCard?: StorefrontProductCardConfig;
  productPage?: ProductPageConfig;
  homePage?: {
    sections: HomePageSection[];
  };
  font?: {
    family?: string;
    size?: string;
  };
  popup?: StorefrontPopupConfig;
  [key: string]: unknown;
}

export type ProductPageLayout = 1 | 2 | 3;
export type ProductTabLayout = 1 | 2 | 3 | 4;
export type ActionButtonDisplay = "both" | "icon" | "label";
export type ActionButtonWidth = "half" | "full";
export type ActionButtonKey =
  | "addToCart"
  | "buyNow"
  | "whatsapp"
  | "messenger"
  | "call"
  | "wishlist";

export interface ProductActionButtonItem {
  key: ActionButtonKey;
  enabled: boolean;
  label: string;
  display: ActionButtonDisplay;
  width: ActionButtonWidth;
}

export interface ProductTabItem {
  key: string;
  type: "builtin" | "custom";
  label: string;
  content?: string | null;
}

export interface ProductPageSizeGuide {
  enabled?: boolean;
  title?: string;
  content?: string | null;
}

export interface ProductPageConfig {
  layout?: ProductPageLayout;
  tabLayout?: ProductTabLayout;
  showBreadcrumb?: boolean;
  imageZoom?: boolean;
  showRelatedProducts?: boolean;
  showReviews?: boolean;
  showStickyBuyButton?: boolean;
  showStockCounter?: boolean;
  sizeGuide?: ProductPageSizeGuide | null;
  defaultVariantSelection?: "first" | "none";
  actions?: ProductActionButtonItem[];
  tabs?: ProductTabItem[];
  [key: string]: unknown;
}

export type StorefrontProductPageConfig = ProductPageConfig;

export interface StorefrontPopupImageThumbs {
  large?: string;
  medium?: string;
  url?: string;
}

export interface StorefrontPopupImage {
  id?: string;
  _id?: string;
  type?: string;
  url: string;
  thumbs?: StorefrontPopupImageThumbs;
}

export interface StorefrontPopupConfig {
  active?: boolean;
  intervalMinutes?: number;
  link?: string | null;
  image?: StorefrontPopupImage | null;
  [key: string]: unknown;
}

export interface StorefrontBootstrap {
  store: StoreConfig;
  sliders?: StoreSlider[];
  categories?: Array<{
    id: string;
    name: string;
    slug: string;
    imageUrl?: string | null;
    productCount?: number;
  }>;
  featuredProducts?: Product[];
  deliveryCharge?: StoreDeliveryCharge;
  homePage?: {
    sections: HomePageSection[];
  };
  sections?: HomePageSection[];
  config?: StorefrontConfig;
  business?: unknown;
}

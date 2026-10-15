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

export interface StorefrontHeaderConfig {
  logo?: string | null;
  searchEnabled?: boolean;
  cartEnabled?: boolean;
  wishListEnabled?: boolean;
}

export interface StorefrontNavbarLinkConfig {
  title: string;
  url: string;
  order?: number;
}

export interface StorefrontNavbarConfig {
  links?: StorefrontNavbarLinkConfig[];
}

export interface StorefrontFooterLinkConfig {
  title: string;
  url: string;
}

export interface StorefrontFooterColumnConfig {
  title: string;
  links: StorefrontFooterLinkConfig[];
}

export interface StorefrontFooterConfig {
  copyright?: string;
  socialLinks?: Record<string, string>;
  columns?: StorefrontFooterColumnConfig[];
}

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

export interface StorefrontBottomNavConfig {
  items: StorefrontBottomNavItemConfig[];
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
  homePage?: {
    sections: HomePageSection[];
  };
  font?: {
    family?: string;
    size?: string;
  };
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

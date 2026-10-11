import { HomePageSection } from "./section";
import { Product } from "./product";

export interface StoreConfig {
  id: string;
  name: string;
  subDomain: string;
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

export interface StoreDeliveryCharge {
  insideCity: number;
  outsideCity: number;
  subAreaCharge?: number;
  freeDeliveryThreshold?: number | null;
}

export interface StorefrontColorConfig {
  bg?: string;
  primary?: string;
  text?: string;
}

export interface StorefrontTopbarConfig {
  announcementText?: string;
  showSocialLinks?: boolean;
  phone?: string;
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



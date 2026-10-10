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
  config?: {
    homePage?: {
      sections: HomePageSection[];
    };
    [key: string]: unknown;
  };
  business?: unknown;
}


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

import { HomePageSection } from "./section";

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
  }>;
  featuredProducts?: Array<any>;
  deliveryCharge?: StoreDeliveryCharge;
  homePage?: {
    sections: HomePageSection[];
  };
  sections?: HomePageSection[];
  config?: {
    homePage?: {
      sections: HomePageSection[];
    };
    [key: string]: any;
  };
  business?: any;
}

import type { ReactNode } from "react";
import type { HomePageSection, Product } from "@/shared/types";
import {
  BannerGridBlock,
  BrandShowcaseBlock,
  CategoryGridBlock,
  CustomerReviewsBlock,
  ProductShowcaseBlock,
  VideoReelsBlock,
} from "../sections";

interface ResolveSectionBlockOptions {
  section: HomePageSection;
  currency: string;
  fallbackProducts: Product[];
  isPreview: boolean;
}

export function resolveSectionBlock({
  section,
  currency,
  fallbackProducts,
  isPreview,
}: ResolveSectionBlockOptions): ReactNode {
  const rawType = (section.type || section.key || "")
    .trim()
    .toLowerCase()
    .replace(/[-_]/g, "");

  switch (rawType) {
    case "banners":
    case "banner":
      return <BannerGridBlock section={section} isPreview={isPreview} />;
    case "category":
    case "categories":
      return <CategoryGridBlock section={section} isPreview={isPreview} />;
    case "products":
    case "product":
      return (
        <ProductShowcaseBlock
          section={section}
          currency={currency}
          fallbackProducts={fallbackProducts}
          isPreview={isPreview}
        />
      );
    case "videos":
    case "video":
      return <VideoReelsBlock section={section} isPreview={isPreview} />;
    case "customerreviews":
    case "customerreview":
    case "reviews":
    case "testimonials":
      return <CustomerReviewsBlock section={section} isPreview={isPreview} />;
    case "brands":
    case "brand":
      return <BrandShowcaseBlock section={section} isPreview={isPreview} />;
    default:
      return null;
  }
}

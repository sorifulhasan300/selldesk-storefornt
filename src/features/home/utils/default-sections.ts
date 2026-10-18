import {
  HomePageSection,
  Product,
  StorefrontSliderConfig,
} from "@/shared/types";

export function getDefaultHomePageSections(
  _sliders: unknown[] = [],
  _categories: unknown[] = [],
  _products: Product[] = [],
  _sliderConfig?: StorefrontSliderConfig | null,
): HomePageSection[] {
  return [];
}

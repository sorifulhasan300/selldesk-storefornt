import {
  HomePageSection,
  Product,
  StorefrontSliderConfig,
} from "@/shared/types";

export function getDefaultHomePageSections(
  _sliders: unknown[] = [],
  categories: unknown[] = [],
  products: Product[] = [],
  _sliderConfig?: StorefrontSliderConfig | null,
): HomePageSection[] {
  return [
    {
      id: "sec-category-default",
      type: "category",
      title: "Shop By Category",
      subtitle: "Browse our curated departments",
      isActive: true,
      data: categories,
      config: {
        columns: 6,
        mobileColumns: 2,
        showName: true,
        viewType: "grid",
      },
    },
    {
      id: "sec-products-default",
      type: "products",
      title: "Trending Now",
      subtitle: "Most popular selections this week",
      isActive: true,
      data: products,
      config: {
        columns: 4,
        mobileColumns: 2,
        showViewAll: true,
        viewType: "grid",
      },
    },
  ];
}

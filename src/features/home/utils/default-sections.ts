import { HomePageSection, Product } from "@/shared/types";

export function getDefaultHomePageSections(
  sliders: unknown[] = [],
  categories: unknown[] = [],
  products: Product[] = [],
): HomePageSection[] {
  return [
    {
      id: "sec-hero-default",
      type: "heroSlider",
      title: "Elevate Your Shopping Experience",
      subtitle:
        "Explore curated collections delivered directly to your doorstep.",
      isActive: true,
      data: sliders,
    },
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


import { StorefrontBootstrap, Product, HomePageSection } from "@/types";

export const MOCK_FALLBACK_PRODUCTS: Product[] = [
  {
    id: "p1",
    name: "Minimalist Chrono Watch",
    slug: "minimalist-chrono-watch",
    description: "Matte black stainless steel with sapphire crystal glass.",
    price: 199,
    salePrice: 159,
    stock: 14,
    images: ["https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&auto=format&fit=crop&q=80"],
    hasVariants: false,
    variants: [],
  },
  {
    id: "p2",
    name: "Wireless ANC Over-Ear Headphones",
    slug: "wireless-anc-headphones",
    description: "Studio-grade sound with 40-hour continuous battery life.",
    price: 299,
    salePrice: null,
    stock: 9,
    images: ["https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&auto=format&fit=crop&q=80"],
    hasVariants: false,
    variants: [],
  },
  {
    id: "p3",
    name: "Velocity Nitro Running Shoes",
    slug: "velocity-nitro-running-shoes",
    description: "Engineered mesh upper with responsive carbon plate cushioning.",
    price: 149,
    salePrice: 129,
    stock: 22,
    images: ["https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&auto=format&fit=crop&q=80"],
    hasVariants: true,
    variants: [],
  },
  {
    id: "p4",
    name: "Classic Leather Backpack",
    slug: "classic-leather-backpack",
    description: "Handcrafted full-grain leather with dedicated 16-inch laptop sleeve.",
    price: 180,
    salePrice: null,
    stock: 5,
    images: ["https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=600&auto=format&fit=crop&q=80"],
    hasVariants: false,
    variants: [],
  },
];

export function getMockBootstrap(storeSlug: string): StorefrontBootstrap {
  return {
    store: {
      id: "mock-store-id",
      name: storeSlug.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()),
      subDomain: storeSlug,
      currency: "USD",
      themeColor: "#2563eb",
      description: "Official customer storefront powered by SellDesk.",
    },
    sliders: [
      {
        id: "s1",
        title: "Elevate Your Shopping Experience",
        subtitle: "Explore curated collections delivered directly to your doorstep.",
        imageUrl: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1600&auto=format&fit=crop&q=80",
        linkUrl: "/products",
      },
    ],
    categories: [
      {
        id: "c1",
        name: "Smart Watches",
        slug: "smart-watches",
        imageUrl: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&auto=format&fit=crop&q=80",
        productCount: 12,
      },
      {
        id: "c2",
        name: "Audio & Headphones",
        slug: "audio",
        imageUrl: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&auto=format&fit=crop&q=80",
        productCount: 8,
      },
      {
        id: "c3",
        name: "Footwear & Sneakers",
        slug: "sneakers",
        imageUrl: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&auto=format&fit=crop&q=80",
        productCount: 15,
      },
    ],
    featuredProducts: [],
    deliveryCharge: { insideCity: 60, outsideCity: 120 },
  };
}

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
      subtitle: "Explore curated collections delivered directly to your doorstep.",
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
      config: { columns: 6, mobileColumns: 2, showName: true, viewType: "grid" },
    },
    {
      id: "sec-products-default",
      type: "products",
      title: "Trending Now",
      subtitle: "Most popular selections this week",
      isActive: true,
      data: products,
      config: { columns: 4, mobileColumns: 2, showViewAll: true, viewType: "grid" },
    },
  ];
}

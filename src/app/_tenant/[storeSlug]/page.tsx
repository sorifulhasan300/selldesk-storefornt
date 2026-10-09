import { StorefrontService } from "@/services/storefront.service";
import { Product, HomePageSection } from "@/types";
import { StoreHomePageClient } from "@/components/home/StoreHomePageClient";

interface StoreHomePageProps {
  params: Promise<{ storeSlug: string }>;
  searchParams?: Promise<{ preview?: string; [key: string]: string | string[] | undefined }>;
}

export default async function StoreHomePage({
  params,
  searchParams,
}: StoreHomePageProps) {
  const { storeSlug } = await params;
  const resolvedSearchParams = searchParams ? await searchParams : {};
  const isPreview = resolvedSearchParams.preview === "true";

  let bootstrap: any;
  let products: Product[] = [];

  try {
    const [bData, pData] = await Promise.all([
      StorefrontService.getBootstrap(storeSlug),
      StorefrontService.getProducts(storeSlug, { limit: 8 }),
    ]);
    bootstrap = bData;
    products = pData.items || [];
  } catch (error) {
    bootstrap = {
      store: {
        id: "mock-store-id",
        name: storeSlug
          .replace(/-/g, " ")
          .replace(/\b\w/g, (c) => c.toUpperCase()),
        currency: "USD",
        themeColor: "#2563eb",
      },
      sliders: [
        {
          id: "s1",
          title: "Elevate Your Shopping Experience",
          subtitle:
            "Explore curated collections delivered directly to your doorstep.",
          imageUrl:
            "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1600&auto=format&fit=crop&q=80",
          linkUrl: "/products",
        },
      ],
      categories: [
        {
          id: "c1",
          name: "Smart Watches",
          slug: "smart-watches",
          imageUrl:
            "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&auto=format&fit=crop&q=80",
          productCount: 12,
        },
        {
          id: "c2",
          name: "Audio & Headphones",
          slug: "audio",
          imageUrl:
            "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&auto=format&fit=crop&q=80",
          productCount: 8,
        },
        {
          id: "c3",
          name: "Footwear & Sneakers",
          slug: "sneakers",
          imageUrl:
            "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&auto=format&fit=crop&q=80",
          productCount: 15,
        },
      ],
      featuredProducts: [],
      deliveryCharge: { insideCity: 60, outsideCity: 120 },
    };

    products = [
      {
        id: "p1",
        name: "Minimalist Chrono Watch",
        slug: "minimalist-chrono-watch",
        description: "Matte black stainless steel with sapphire crystal glass.",
        price: 199,
        salePrice: 159,
        stock: 14,
        images: [
          "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&auto=format&fit=crop&q=80",
        ],
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
        images: [
          "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&auto=format&fit=crop&q=80",
        ],
        hasVariants: false,
        variants: [],
      },
      {
        id: "p3",
        name: "Velocity Nitro Running Shoes",
        slug: "velocity-nitro-running-shoes",
        description:
          "Engineered mesh upper with responsive carbon plate cushioning.",
        price: 149,
        salePrice: 129,
        stock: 22,
        images: [
          "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&auto=format&fit=crop&q=80",
        ],
        hasVariants: true,
        variants: [],
      },
      {
        id: "p4",
        name: "Classic Leather Backpack",
        slug: "classic-leather-backpack",
        description:
          "Handcrafted full-grain leather with dedicated 16-inch laptop sleeve.",
        price: 180,
        salePrice: null,
        stock: 5,
        images: [
          "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=600&auto=format&fit=crop&q=80",
        ],
        hasVariants: false,
        variants: [],
      },
    ];
  }

  const { store, sliders = [], categories = [] } = bootstrap;

  // Extract server-fetched sections from bootstrap response
  const rawSections: HomePageSection[] =
    bootstrap.config?.homePage?.sections ||
    bootstrap.homePage?.sections ||
    bootstrap.sections ||
    [];

  // Fallback scaffold sections if store has not configured dynamic sections yet
  const initialSections: HomePageSection[] =
    rawSections.length > 0
      ? rawSections
      : [
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

  return (
    <StoreHomePageClient
      initialSections={initialSections}
      store={store}
      currency={store.currency || "USD"}
      products={products}
      categories={categories}
      sliders={sliders}
      isPreview={isPreview}
    />
  );
}

import Link from "next/link";
import { StorefrontService } from "@/services/storefront.service";
import { Product } from "@/types";
import { HeroSlider } from "@/components/home/hero-slider";
import { CategoryGrid } from "@/components/home/category-grid";
import { ProductCard } from "@/components/catalog/product-card";
import { ArrowRight, Sparkles } from "lucide-react";

interface StoreHomePageProps {
  params: Promise<{ storeSlug: string }>;
}

export default async function StoreHomePage({ params }: StoreHomePageProps) {
  const { storeSlug } = await params;

  let bootstrap;
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

  const { sliders, categories, store } = bootstrap;

  return (
    <div className="space-y-14">
      {/* 1. Dynamic Hero Banner Slider */}
      {sliders?.length > 0 && <HeroSlider sliders={sliders} />}

      {/* 2. Featured Categories */}
      {categories?.length > 0 && (
        <section>
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                Shop By Category
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                Browse our curated departments
              </p>
            </div>
            <Link
              href="/products"
              className="text-xs sm:text-sm font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1 hover:underline"
            >
              All Categories <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <CategoryGrid categories={categories} />
        </section>
      )}

      {/* 3. Trending Products Grid */}
      <section>
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-amber-100 text-amber-700 rounded-xl">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                Trending Now
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                Most popular selections this week
              </p>
            </div>
          </div>
          <Link
            href="/products"
            className="text-xs sm:text-sm font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1 hover:underline"
          >
            Explore Catalog <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          {products.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              currency={store.currency}
            />
          ))}
        </div>
      </section>
    </div>
  );
}

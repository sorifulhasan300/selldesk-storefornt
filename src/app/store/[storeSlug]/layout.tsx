import { ReactNode } from "react";
import { notFound } from "next/navigation";
import { StorefrontService } from "@/services/storefront.service";
import { StorefrontBootstrap } from "@/types";
import { StoreHeader } from "@/components/layout/store-header";
import { StoreFooter } from "@/components/layout/store-footer";
import { CartDrawer } from "@/components/layout/cart-drawer";
import { Metadata } from "next";

interface TenantLayoutProps {
  children: ReactNode;
  params: Promise<any>;
}

export async function generateMetadata({
  params,
}: TenantLayoutProps): Promise<Metadata> {
  const { storeSlug } = await params;
  try {
    const data = await StorefrontService.getBootstrap(storeSlug);
    const store = data?.store;
    const storeName = store?.name || storeSlug;
    return {
      title: {
        template: `%s | ${storeName}`,
        default: storeName,
      },
      description: store?.description || `Welcome to ${storeName}`,
      openGraph: {
        title: storeName,
        description:
          store?.description || `Official store for ${storeName}`,
        images: store?.logoUrl ? [store.logoUrl] : [],
      },
    };
  } catch {
    return {
      title: `${storeSlug} | Storefront`,
    };
  }
}

export default async function TenantLayout({
  children,
  params,
}: TenantLayoutProps) {
  const { storeSlug } = await params;

  let bootstrap: StorefrontBootstrap;
  try {
    bootstrap = await StorefrontService.getBootstrap(storeSlug);
  } catch (error) {
    // If backend returns 404 or connection fails in development, provide fallback scaffold
    bootstrap = {
      store: {
        id: "mock-store-id",
        name: storeSlug
          .replace(/-/g, " ")
          .replace(/\b\w/g, (c: string) => c.toUpperCase()),
        subDomain: storeSlug,
        currency: "USD",
        themeColor: "#2563eb",
        description: "Official customer storefront powered by SellDesk.",
      },
      sliders: [
        {
          id: "s1",
          title: "New Season Arrivals",
          subtitle:
            "Explore our handpicked curation of premium products with fast delivery.",
          imageUrl:
            "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1600&auto=format&fit=crop&q=80",
          linkUrl: "/products",
        },
      ],
      categories: [
        { id: "c1", name: "Electronics", slug: "electronics" },
        { id: "c2", name: "Fashion", slug: "fashion" },
        { id: "c3", name: "Home & Living", slug: "home-living" },
      ],
      featuredProducts: [],
      deliveryCharge: { insideCity: 60, outsideCity: 120 },
    };
  }

  const fallbackStore = {
    id: "mock-store-id",
    name: storeSlug
      .replace(/-/g, " ")
      .replace(/\b\w/g, (c: string) => c.toUpperCase()),
    subDomain: storeSlug,
    currency: "USD",
    themeColor: "#2563eb",
    description: "Official customer storefront powered by SellDesk.",
  };

  const store = bootstrap?.store || fallbackStore;

  return (
    <div
      className="min-h-screen flex flex-col bg-slate-50 text-slate-900 selection:bg-blue-500 selection:text-white"
      style={
        {
          "--primary-brand": store?.themeColor || "#2563eb",
        } as React.CSSProperties
      }
    >
      <StoreHeader store={store} categories={bootstrap?.categories} />
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6">
        {children}
      </main>
      <StoreFooter store={store} />
      <CartDrawer currency={store?.currency || "USD"} />
    </div>
  );
}

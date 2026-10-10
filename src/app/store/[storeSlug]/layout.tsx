import { ReactNode } from "react";
import { Metadata } from "next";
import { getBootstrap } from "@/features/tenant/server";
import { StoreHeader, StoreFooter } from "@/features/shell";
import { CartDrawer } from "@/features/cart";

interface TenantLayoutProps {
  children: ReactNode;
  params: Promise<{ storeSlug: string }>;
}

export async function generateMetadata({
  params,
}: TenantLayoutProps): Promise<Metadata> {
  const { storeSlug } = await params;
  try {
    const data = await getBootstrap(storeSlug);
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
  const bootstrap = await getBootstrap(storeSlug);
  const store = bootstrap.store;

  return (
    <div
      className="min-h-screen flex flex-col bg-slate-50 text-slate-900 selection:bg-blue-500 selection:text-white"
      style={
        {
          "--primary-brand": store?.themeColor || "#2563eb",
        } as React.CSSProperties
      }
    >
      <StoreHeader store={store} categories={bootstrap.categories} />
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6">
        {children}
      </main>
      <StoreFooter store={store} />
      <CartDrawer currency={store?.currency || "USD"} />
    </div>
  );
}

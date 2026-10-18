import { ReactNode } from "react";
import React from "react";
import { Metadata } from "next";
import { getBootstrap } from "@/features/tenant/server";
import { buildThemeVariables } from "@/features/tenant";
import {
  StoreHeader,
  StoreFooter,
  AnnouncementBar,
  BottomNavigation,
  PromotionalPopup,
} from "@/features/shell";
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
        description: store?.description || `Official store for ${storeName}`,
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
  const config = bootstrap.config;

  const topbarConfig = config?.topbar;
  const headerConfig = config?.header;
  const navbarConfig = config?.navbar;
  const footerConfig = config?.footer;
  const bottomNavConfig = config?.bottomNav;

  const themeVariables = buildThemeVariables(bootstrap);

  return (
    <div
      className="min-h-screen flex flex-col bg-[var(--store-bg,#ffffff)] text-[var(--store-text,#0f172a)] selection:bg-[var(--store-primary)] selection:text-white"
      style={themeVariables}
    >
      <AnnouncementBar
        announcementText={topbarConfig?.announcementText}
        phone={topbarConfig?.phone}
        topbar={topbarConfig}
        socialLinks={config?.socialLinks || config?.footer?.socialLinks}
      />
      <StoreHeader
        store={store}
        categories={bootstrap.categories}
        header={headerConfig}
        navbar={navbarConfig}
        contactPhone={config?.contact?.phone ?? store.contactPhone ?? undefined}
      />
      <main
        className={`flex-1 w-full ${
          bottomNavConfig?.active === false ? "" : "pb-16 lg:pb-0"
        }`}
      >
        {children}
      </main>
      <StoreFooter
        store={store}
        footer={footerConfig}
        config={{
          footer: config?.footer,
          socialLinks: config?.socialLinks || config?.footer?.socialLinks,
          contact: config?.contact
            ? {
                phone: config.contact.phone,
                email: config.contact.email,
                address: config.contact.address,
              }
            : undefined,
        }}
      />
      <CartDrawer currency={store?.currency || "USD"} storeSlug={storeSlug} />
      <BottomNavigation config={bottomNavConfig} storeSlug={storeSlug} />
      <PromotionalPopup popup={config?.popup} />
    </div>
  );
}

import { ReactNode } from "react";
import React from "react";
import { Metadata } from "next";
import { getBootstrap } from "@/features/tenant/server";
import {
  StoreHeader,
  StoreFooter,
  AnnouncementBar,
  BottomNavigation,
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

const COLOR_REGEX =
  /^(#[0-9a-f]{3,8}|rgba?\([\d\s.,%]+\)|hsla?\([\d\s.,%]+\)|transparent)$/i;

function safeColor(v: unknown, fallback: string): string {
  if (typeof v === "string" && COLOR_REGEX.test(v.trim())) {
    return v.trim();
  }
  return fallback;
}

function safeFont(v: unknown, fallback: string = "inherit"): string {
  if (typeof v === "string" && /^[a-zA-Z0-9\s, '"-]+$/.test(v.trim())) {
    return v.trim();
  }
  return fallback;
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
  const colorConfig = config?.color;


  const rawConfig =
    bootstrap?.config && typeof bootstrap.config === "object"
      ? (bootstrap.config as Record<string, unknown>)
      : {};
  const rawTheme =
    typeof rawConfig.theme === "object" && rawConfig.theme !== null
      ? (rawConfig.theme as Record<string, unknown>)
      : {};
  const storeRecord =
    store && typeof store === "object"
      ? (store as unknown as Record<string, unknown>)
      : {};

  const primaryCandidate =
    colorConfig?.primary ||
    store?.themeColor ||
    "#2563eb";
  const storePrimary = safeColor(primaryCandidate, "#2563eb");

  const bgCandidate =
    colorConfig?.bg ||
    (colorConfig as Record<string, unknown> | undefined)?.background as string ||
    (storeRecord.bgColor as string) ||
    "#ffffff";
  const storeBg = safeColor(bgCandidate, "#ffffff");

  const textCandidate =
    colorConfig?.text ||
    (storeRecord.textColor as string) ||
    "#0f172a";
  const storeText = safeColor(textCandidate, "#0f172a");

  const storeFont = safeFont(
    storeRecord.fontFamily || storeRecord.font || rawTheme.font || rawConfig.font,
    "inherit",
  );

  return (
    <div
      className="min-h-screen flex flex-col bg-[var(--store-bg,#ffffff)] text-[var(--store-text,#0f172a)] selection:bg-[var(--store-primary)] selection:text-white"
      style={
        {
          "--store-primary": storePrimary,
          "--store-bg": storeBg,
          "--store-text": storeText,
          "--store-font": storeFont,
          "--primary-brand": storePrimary,
        } as React.CSSProperties
      }
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
        className={`flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6 ${
          bottomNavConfig?.active === false ? "pb-6" : "pb-20 lg:pb-6"
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
    </div>

  );
}

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

  const rawConfig =
    bootstrap?.config && typeof bootstrap.config === "object"
      ? (bootstrap.config as Record<string, unknown>)
      : {};
  const rawColor =
    typeof rawConfig.color === "object" && rawConfig.color !== null
      ? (rawConfig.color as Record<string, unknown>)
      : {};
  const rawTheme =
    typeof rawConfig.theme === "object" && rawConfig.theme !== null
      ? (rawConfig.theme as Record<string, unknown>)
      : {};
  const storeRecord =
    store && typeof store === "object"
      ? (store as unknown as Record<string, unknown>)
      : {};

  const storePrimary = safeColor(store?.themeColor, "#0f172a");
  const storeBg = safeColor(
    storeRecord.bgColor || rawColor.background || rawColor.bg,
    "#ffffff",
  );
  const storeText = safeColor(
    storeRecord.textColor || rawColor.text,
    "#0f172a",
  );
  const storeFont = safeFont(
    storeRecord.fontFamily || storeRecord.font || rawTheme.font || rawConfig.font,
    "inherit",
  );

  return (
    <div
      className="min-h-screen flex flex-col bg-slate-50 text-slate-900 selection:bg-[var(--store-primary)] selection:text-white"
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
      <StoreHeader store={store} categories={bootstrap.categories} />
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6">
        {children}
      </main>
      <StoreFooter store={store} />
      <CartDrawer currency={store?.currency || "USD"} />
    </div>
  );
}

"use client";

import type { CSSProperties } from "react";
import type { StoreConfig, StorefrontFooterConfig } from "@/shared/types";
import type { SocialNetwork } from "./store-footer-social";
import type { StoreFooterContactConfig } from "./store-footer-contact";
import { FooterBottomBar } from "./store-footer-bottom-bar";
import { FooterLayout3 } from "./store-footer-layout-3";
import { FooterLayoutStandard } from "./store-footer-layout-standard";
import { FooterColumnsGrid } from "./store-footer-columns-grid";
import { resolveFooterColumns } from "./store-footer.utils";

export type { StoreFooterContactConfig };

export interface StoreFooterProps {
  store: StoreConfig;
  footer?: StorefrontFooterConfig;
  config?: {
    footer?: StorefrontFooterConfig;
    contact?: StoreFooterContactConfig;
    socialLinks?: Record<string, string>;
  };
}

export function StoreFooter({ store, footer, config }: StoreFooterProps) {
  const effectiveFooter = config?.footer ?? footer;
  const columns = resolveFooterColumns(effectiveFooter?.columns);
  const layout =
    effectiveFooter?.layout === 2 || effectiveFooter?.layout === 3
      ? effectiveFooter.layout
      : 1;

  const contactPhone =
    config?.contact?.phone ?? store.contactPhone ?? undefined;
  const contactEmail =
    config?.contact?.email ?? store.contactEmail ?? undefined;
  const contactAddress = config?.contact?.address;
  const about =
    effectiveFooter?.about ||
    store.description ||
    "Your one-stop destination for quality products with exceptional customer service.";
  const socialLinks = {
    ...config?.socialLinks,
    ...effectiveFooter?.socialLinks,
  };
  const availableSocialLinks: Partial<Record<SocialNetwork, string>> = {
    facebook: socialLinks.facebook || store.facebookUrl || undefined,
    instagram: socialLinks.instagram || store.instagramUrl || undefined,
    youtube: socialLinks.youtube || undefined,
    tiktok: socialLinks.tiktok || undefined,
    whatsapp: socialLinks.whatsapp || undefined,
    messenger: socialLinks.messenger || undefined,
    x: socialLinks.x || undefined,
    linkedin: socialLinks.linkedin || undefined,
    telegram: socialLinks.telegram || undefined,
  };

  const style = effectiveFooter?.style;
  const backgroundColor = style?.bgColor ?? "#ffffff";
  const textColor = style?.textColor ?? "#475569";
  const headingColor = style?.headingColor ?? "#0f172a";
  const fontSize = style?.fontSize ?? 14;
  const headingFontSize = style?.headingFontSize ?? 14;

  const footerStyle: CSSProperties = {
    backgroundColor,
    backgroundImage:
      style?.backgroundMode === "gradient"
        ? `linear-gradient(to right, ${style.gradientStartColor ?? backgroundColor}, ${style.gradientEndColor ?? backgroundColor})`
        : undefined,
    color: textColor,
    borderTop: `${style?.borderTopSize ?? 1}px solid ${style?.borderTopColor ?? "#e2e8f0"}`,
    fontSize: `${fontSize}px`,
    marginTop: "auto",
  };

  const contentStyle: CSSProperties = {
    paddingTop: `${style?.paddingTop ?? 40}px`,
    paddingBottom: `${style?.paddingBottom ?? 24}px`,
  };

  const bottomCopyright =
    effectiveFooter?.bottomBar?.copyright ||
    effectiveFooter?.copyright ||
    `© ${new Date().getFullYear()} ${store.name}`;
  const showBottomBar = effectiveFooter?.bottomBar?.enabled !== false;
  const showDeveloperCredit =
    effectiveFooter?.bottomBar?.showDeveloperCredit !== false;
  const rawPaymentIcons =
    effectiveFooter?.bottomBar?.paymentIcons ??
    (effectiveFooter as Record<string, unknown> | undefined)?.paymentIcons;
  const paymentIcons = Array.isArray(rawPaymentIcons)
    ? (rawPaymentIcons as string[]).filter(Boolean)
    : [];

  const columnsContent = (
    <FooterColumnsGrid
      columns={columns}
      collapsibleOnMobile={effectiveFooter?.collapsibleOnMobile === true}
      headingColor={headingColor}
      headingFontSize={headingFontSize}
      textColor={textColor}
      fontSize={fontSize}
    />
  );

  return (
    <footer style={footerStyle}>
      {layout === 3 ? (
        <FooterLayout3
          store={store}
          effectiveFooter={effectiveFooter}
          about={about}
          columns={columns}
          availableSocialLinks={availableSocialLinks}
          contentStyle={contentStyle}
        />
      ) : (
        <FooterLayoutStandard
          layout={layout}
          store={store}
          effectiveFooter={effectiveFooter}
          about={about}
          contactPhone={contactPhone}
          contactEmail={contactEmail}
          contactAddress={contactAddress}
          availableSocialLinks={availableSocialLinks}
          contentStyle={contentStyle}
          columnsContent={columnsContent}
        />
      )}

      {showBottomBar && (
        <FooterBottomBar
          layout={layout}
          bottomCopyright={bottomCopyright}
          showDeveloperCredit={showDeveloperCredit}
          paymentIcons={paymentIcons}
        />
      )}
    </footer>
  );
}

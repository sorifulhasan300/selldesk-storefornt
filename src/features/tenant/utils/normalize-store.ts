import { StoreConfig } from "@/shared/types";

const COLOR_REGEX =
  /^(#[0-9a-f]{3,8}|rgba?\([\d\s.,%]+\)|hsla?\([\d\s.,%]+\)|transparent)$/i;

export function safeThemeColor(v: unknown, fallback = "#2563eb"): string {
  if (typeof v === "string" && COLOR_REGEX.test(v.trim())) {
    return v.trim();
  }
  return fallback;
}

export function extractHeaderLogo(header: Record<string, unknown>): string | null {
  if (typeof header.logo === "string") return header.logo;
  const logoObj =
    typeof header.logo === "object" && header.logo !== null
      ? (header.logo as Record<string, unknown>)
      : null;
  const thumbs = logoObj?.thumbs as Record<string, unknown> | null;
  return (
    (thumbs?.large as string) ||
    (thumbs?.url as string) ||
    (thumbs?.medium as string) ||
    null
  );
}

export function extractSocialLinks(
  rawSocial: unknown,
): Record<string, string> {
  if (!rawSocial || typeof rawSocial !== "object") return {};
  return Object.entries(rawSocial as Record<string, unknown>).reduce<
    Record<string, string>
  >((links, [platform, value]) => {
    if (typeof value === "string" && value.trim()) {
      links[platform] = value.trim();
    }
    return links;
  }, {});
}

export function buildStoreConfig(
  raw: Record<string, unknown>,
  storeSlug: string,
  headerLogo: string | null,
  socialLinks: Record<string, string>,
): StoreConfig {
  const business = (raw.business || {}) as Record<string, unknown>;
  const config = (raw.config || {}) as Record<string, unknown>;
  const color = (config.color || {}) as Record<string, unknown>;
  const contact = (config.contact || {}) as Record<string, unknown>;
  const rawStore = (raw.store || {}) as Record<string, unknown>;
  const rawUser = (raw.user || {}) as Record<string, unknown>;

  const cleanName =
    (business.name as string) ||
    (rawStore.name as string) ||
    storeSlug
      .replace(/-/g, " ")
      .replace(/\b\w/g, (c: string) => c.toUpperCase());

  return {
    id: (rawStore.id as string) || (business.id as string) || "",
    name: cleanName,
    subDomain:
      (rawStore.subDomain as string) ||
      (business.domain ? (business.domain as string).split(".")[0] : storeSlug),
    domain: (rawStore.domain as string) || (business.domain as string) || null,
    currency:
      (rawStore.currency as string) ||
      (business.currencyCode as string) ||
      (business.currency as string) ||
      "USD",
    logoUrl:
      headerLogo ||
      (rawStore.logoUrl as string) ||
      (business.logo as string) ||
      null,
    bannerUrl:
      (rawStore.bannerUrl as string) ||
      (business.bannerUrl as string) ||
      null,
    contactEmail:
      (rawStore.contactEmail as string) ||
      (contact.email as string) ||
      (rawUser.email as string) ||
      null,
    contactPhone:
      (rawStore.contactPhone as string) ||
      (contact.phone as string) ||
      (rawUser.phone as string) ||
      null,
    themeColor: safeThemeColor(
      rawStore.themeColor || color.primary || color.theme,
      "#2563eb",
    ),
    description:
      (rawStore.description as string) ||
      ((config.seo as Record<string, unknown>)?.metaDescription as string) ||
      null,
    facebookUrl: (rawStore.facebookUrl as string) || socialLinks.facebook || null,
    instagramUrl: (rawStore.instagramUrl as string) || socialLinks.instagram || null,
  };
}


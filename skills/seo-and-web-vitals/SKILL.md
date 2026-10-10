Standards for SellDesk storefront SEO and performance - multi-tenant canonical URLs, generateMetadata, OpenGraph/Twitter cards, indexing control (robots, sitemap, noindex rules, real 404s), safe JSON-LD structured data, next/image optimization (remotePatterns, sizes, LCP preload), fonts, third-party scripts, and Core Web Vitals (LCP, CLS, INP). MUST be used whenever building or modifying any public storefront page (home, category, product detail, search, cart, checkout, order pages), metadata, structured data, sitemap/robots, images, fonts, tracking pixels, or media components in selldesk-storefront. Use it even for small changes (swapping an image, adding a script, editing a title), because SEO and CLS regressions are silent.

SEO & Web Vitals

Public storefronts live on organic search and social sharing. Wrong canonicals, indexed checkout pages, broken structured data or layout shift directly cost rankings, merchant credibility and conversions.

How to use this skill (for AI agents): read Section 0 first (hard rules), then the sections your task touches. Run the Definition of Done (Section 9) before finishing. If a request conflicts with a hard rule, explain why and propose a safe alternative.

0. Hard Rules (non-negotiable)

# Rule

S1 Server-rendered only. Metadata and JSON-LD come from generateMetadata and Server Components. Never set title/meta/JSON-LD from useEffect, document.title or client state.
S2 JSON-LD goes through the JsonLd helper (Section 5), which escapes <. Merchant text is untrusted; raw JSON.stringify inside dangerouslySetInnerHTML allows </script> injection (stored XSS).
S3 Every indexable page sets its own absolute canonical on the store's primary public origin. Never put alternates.canonical in a shared layout (children would inherit it). The internal /store/[storeSlug] route prefix never appears in public URLs.
S4 Metadata objects replace, they do not deep-merge. A page that exports openGraph or twitter replaces the layout's object entirely. Build them with shared helpers so siteName, image fallback and url are never lost.
S5 Missing resource = real 404 (notFound()). Backend failure = throw (500). Never return a 200 page with placeholder metadata.
S6 Private, transactional and duplicate pages are noindex (matrix in Section 4.1).
S7 Structured data must match visible content. Never fabricate ratings, reviews, stock or prices.
S8 Sanitize merchant strings before they reach metadata or schema: strip HTML, collapse whitespace, clamp length; image URLs must be absolute https:.
S9 Use next/image for content images, with an explicit remotePatterns allowlist. No wildcard hosts.
S10 Every fill image has a sized parent and an accurate sizes.
S11 Exactly one preloaded (LCP) image per page, everything else lazy. On Next.js 16 use preload; priority is deprecated.
S12 Reserve space for anything that loads late (images, banners, embeds, price/stock widgets, fonts).
S13 Third-party scripts only through next/script with a non-blocking strategy.
S14 robots.txt and sitemap.xml are tenant-aware (resolved by host) and list only public, active content.

1. File Map
   Concern Location
   Tenant layout metadata + org schema src/app/store/[storeSlug]/layout.tsx
   PDP metadata + product schema src/app/store/[storeSlug]/products/[slug]/page.tsx
   Listing/category/search metadata corresponding page.tsx files
   Robots / sitemap src/app/robots.ts, src/app/sitemap.ts
   SEO helpers src/lib/seo/ (store-url.ts, metadata.ts, json-ld.tsx, fetchers.ts)
   Image config next.config.ts
2. Shared Helpers
   2.1 Public origin (multi-tenant canonical base)

A store can be reached on {sub}.selldesk.com and on a custom domain. The canonical origin is the custom domain when it is verified, otherwise the subdomain. Do not hardcode the root domain. Field names below are assumptions; match your StoreConfig.

typescript
// src/lib/seo/store-url.ts
export function getStoreOrigin(store: {
subDomain: string; customDomain?: string | null; customDomainVerified?: boolean;
}): string {
if (store.customDomain && store.customDomainVerified) return `https://${store.customDomain}`;
return `https://${store.subDomain}.${process.env.NEXT_PUBLIC_ROOT_DOMAIN}`;
}
2.2 Request-scoped data fetchers (no duplicate API calls)

generateMetadata and the page both need the same data. Without memoization the API is called twice per request.

typescript
// src/lib/seo/fetchers.ts
import { cache } from "react";
import { notFound } from "next/navigation";

export const getBootstrap = cache((storeSlug: string) => StorefrontService.getBootstrap(storeSlug));

export const getProductOrNotFound = cache(async (storeSlug: string, slug: string) => {
try {
return await StorefrontService.getProductBySlug(storeSlug, slug);
} catch (e) {
if (isNotFoundError(e)) notFound(); // real 404 (S5)
throw e; // backend failure -> 500, not a fake page
}
});

cache() dedupes within one request only. Cross-request caching is separate (Section 7.5).

2.3 Sanitizers
typescript
// src/lib/seo/metadata.ts
export function toMetaDescription(raw?: string | null, fallback = "", max = 155): string {
const text = (raw ?? "")
.replace(/<[^>]\*>/g, " ").replace(/&nbsp;/g, " ").replace(/\s+/g, " ").trim();
if (!text) return fallback;
if (text.length <= max) return text;
const cut = text.slice(0, max);
const at = cut.lastIndexOf(" ");
return `${cut.slice(0, at > 80 ? at : max).trimEnd()}…`;
}

export function toAbsoluteImage(u: unknown, origin: string): string | undefined {
if (typeof u !== "string" || !u.trim()) return undefined;
try {
const url = new URL(u, origin);
return url.protocol === "https:" ? url.toString() : undefined;
} catch { return undefined; }
}
2.4 OpenGraph / Twitter builders (S4)
typescript
export function buildOpenGraph(o: {
store: { name: string; locale?: string }; title: string; description: string; path: string; image?: string;
}): NonNullable<Metadata["openGraph"]> {
return {
type: "website", // "article" is wrong for products; see note below
siteName: o.store.name,
title: o.title, description: o.description,
url: o.path, // resolved against metadataBase
locale: o.store.locale ?? "en_US",
images: o.image ? [{ url: o.image, alt: o.title }] : [],
};
}

export function buildTwitter(o: { title: string; description: string; image?: string; wideImage: boolean }) {
return {
card: o.image && o.wideImage ? "summary_large_image" : "summary", // square logos look bad as large cards
title: o.title, description: o.description, images: o.image ? [o.image] : [],
} as const;
}

Note on og:type: Next's typing has no product type and the original used article, which describes the wrong thing. Use website. Add Facebook-catalog product:\* tags through other only if the merchant needs them, and confirm in view-source that og:type is not duplicated.

3. Metadata (generateMetadata)

Public pages whose content depends on data MUST export generateMetadata. Truly static pages (for example /cart) may use a static metadata export, but they still set robots correctly.

Length targets: title up to about 60 characters, description up to about 155.

3.1 Tenant layout

Sets metadataBase, the title template and defaults. It does not set canonical (S3).

typescript
export async function generateMetadata({ params }: TenantLayoutProps): Promise<Metadata> {
const { storeSlug } = await params;
const data = await getBootstrap(storeSlug).catch(() => null);
const store = data?.store;

if (!store) {
return { title: "Store not found", robots: { index: false, follow: false } };
}

const origin = getStoreOrigin(store);
const description = toMetaDescription(store.description, `Shop online at ${store.name}`);
const logo = toAbsoluteImage(store.logoUrl, origin);
const indexable = store.isActive !== false && store.isPublished !== false;

return {
metadataBase: new URL(origin),
applicationName: store.name,
title: { template: `%s | ${store.name}`, default: store.name },
description,
robots: indexable ? undefined : { index: false, follow: false },
openGraph: buildOpenGraph({ store, title: store.name, description, path: "/", image: logo }),
twitter: buildTwitter({ title: store.name, description, image: logo, wideImage: false }),
};
}

Also render <html lang> from the store locale and set per-store icons (favicon) when available.

3.2 Product detail page
typescript
export async function generateMetadata({ params }: PdpProps): Promise<Metadata> {
const { storeSlug, slug } = await params;
const product = await getProductOrNotFound(storeSlug, slug); // 404 handled (S5)
const { store } = await getBootstrap(storeSlug);
const origin = getStoreOrigin(store);

const title = product.name;
const description = toMetaDescription(product.description, product.name);
const productImage = toAbsoluteImage(product.images?.[0], origin);
const image = productImage ?? toAbsoluteImage(store.logoUrl, origin);
const path = `/products/${product.slug}`;

return {
title, description,
alternates: { canonical: path },
robots: product.isActive === false ? { index: false, follow: false } : undefined,
openGraph: buildOpenGraph({ store, title, description, path, image }),
twitter: buildTwitter({ title, description, image, wideImage: !!productImage }),
};
}

The page component calls the same getProductOrNotFound so a missing product returns a true 404 status.

3.3 Listing, category and search pages
Self-canonical to the clean path. For ?page=n (n > 1) the canonical is that page's own URL; never canonicalize every page to page 1.
Sort, filter, price and search-query parameters: canonical to the base path and robots: { index: false, follow: true }.
Pagination must be reachable through real <a href> links (next/link), not click handlers or infinite scroll alone.
typescript
const FILTER_KEYS = ["sort", "q", "min", "max", "filter"];
const sp = await searchParams;
const hasFilters = FILTER_KEYS.some((k) => k in sp);
const page = Number(sp.page) > 1 ? Number(sp.page) : 1;
return {
title: page > 1 ? `${category.name} - Page ${page}` : category.name,
alternates: { canonical: page > 1 ? `${path}?page=${page}` : path },
robots: hasFilters ? { index: false, follow: true } : undefined,
// openGraph/twitter via builders
}; 4. Indexing Control
4.1 Noindex matrix
Page Index? How
Home, category, product, CMS pages Yes self canonical
Cart, checkout No robots: { index: false, follow: false }
Order confirmation / order lookup No noindex and Cache-Control: private, no-store (contains PII)
Account, login No noindex
Search results (?q=) No index: false, follow: true
Sort/filter combinations No noindex, canonical to base
Preview mode (?preview=true) No noindex
Inactive/unpublished store or product No noindex (or 404 if removed permanently)
Out-of-stock product Yes keep indexed, schema OutOfStock; 404/410 only if discontinued

Meta noindex only works if crawlers can fetch the page. Do not also Disallow a URL in robots.txt that you need de-indexed.

4.2 Tenant-aware robots and sitemap
typescript
// src/app/robots.ts
export default async function robots(): Promise<MetadataRoute.Robots> {
const store = await resolveStoreByHost((await headers()).get("host"));
const origin = store ? getStoreOrigin(store) : null;
return {
rules: [{ userAgent: "\*", allow: "/", disallow: ["/api/", "/cart", "/checkout"] }],
...(origin && { sitemap: `${origin}/sitemap.xml` }),
};
}
typescript
// src/app/sitemap.ts (use generateSitemaps when a store exceeds 50,000 URLs)
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
const store = await resolveStoreByHost((await headers()).get("host"));
if (!store) return [];
const origin = getStoreOrigin(store);
const { products, categories } = await StorefrontService.getSitemapData(store.slug); // active + published only
return [
{ url: origin, changeFrequency: "daily", priority: 1 },
...categories.map((c) => ({ url: `${origin}/categories/${c.slug}`, lastModified: c.updatedAt })),
...products.map((p) => ({ url: `${origin}/products/${p.slug}`, lastModified: p.updatedAt })),
];
}

Sitemap URLs must equal the canonical URLs exactly (same origin, no internal prefix, no tracking params).

5. Structured Data (JSON-LD)
   5.1 Safe renderer (S2)

This is the only place dangerouslySetInnerHTML is allowed for schema, and only through this helper.

tsx
// src/lib/seo/json-ld.tsx
export function JsonLd({ data }: { data: Record<string, unknown> }) {
const json = JSON.stringify(data)
.replace(/</g, "\\u003c")
.replace(/\u2028/g, "\\u2028")
.replace(/\u2029/g, "\\u2029");
return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: json }} />;
}
5.2 Product schema

Rules: data must match the visible page (S7); image URLs absolute; price is the current selling price as a plain decimal (not a formatted string such as "৳1,200"); description is plain text.

tsx
export function buildProductJsonLd({ product, currency, origin }: Args) {
const url = `${origin}/products/${product.slug}`;
const price = Number(product.salePrice ?? product.price).toFixed(2);
const inStock = (product.stock ?? 1) > 0;
const images = (product.images ?? []).map((i) => toAbsoluteImage(i, origin)).filter(Boolean);
const variants = product.variants ?? [];

const offers = variants.length > 1
? {
"@type": "AggregateOffer",
priceCurrency: currency,
lowPrice: Math.min(...variants.map((v) => Number(v.salePrice ?? v.price))).toFixed(2),
highPrice: Math.max(...variants.map((v) => Number(v.salePrice ?? v.price))).toFixed(2),
offerCount: variants.length,
availability: availability(inStock),
}
: {
"@type": "Offer",
url, priceCurrency: currency, price,
availability: availability(inStock),
itemCondition: "https://schema.org/NewCondition",
};

return {
"@context": "https://schema.org",
"@type": "Product",
name: product.name,
image: images,
description: toMetaDescription(product.description, product.name, 200),
sku: product.sku || product.id,
brand: product.brand?.name ? { "@type": "Brand", name: product.brand.name } : undefined,
offers,
// Only when real, visible reviews exist (S7):
...(product.reviewCount > 0 && {
aggregateRating: { "@type": "AggregateRating", ratingValue: product.ratingAverage, reviewCount: product.reviewCount },
}),
};
}
const availability = (inStock: boolean) =>
inStock ? "https://schema.org/InStock" : "https://schema.org/OutOfStock";

Usage: <JsonLd data={buildProductJsonLd({ product, currency, origin })} /> inside the Server Component page.

5.3 Store (organization) schema

Use getStoreOrigin(store) for url, never a hardcoded domain. Include contactPoint only for a public phone the merchant configured for customers. Add sameAs for social profile URLs when configured. Type: OnlineStore.

5.4 Breadcrumbs

Render BreadcrumbList on category and product pages only when a breadcrumb trail is also visible in the UI. Items use absolute canonical URLs.

5.5 Validation

Check with Google's Rich Results Test and the Schema Markup Validator. Missing required fields must be fixed, not suppressed.

6. Images
   6.1 Allowlist (S9)

next/image refuses unlisted hosts, and a wildcard hosts pattern lets anyone use your image optimizer (cost and abuse). All merchant uploads should be served from the SellDesk media CDN/bucket so one pattern covers them.

typescript
// next.config.ts
images: {
formats: ["image/avif", "image/webp"],
remotePatterns: [
{ protocol: "https", hostname: "cdn.selldesk.com", pathname: "/\*\*" }, // your real media host
],
// dangerouslyAllowSVG stays off
},

Merchant-entered external image URLs must be validated and either re-hosted to the CDN or rendered with unoptimized plus explicit width/height.

6.2 Component rules
Content images use next/image; no raw <img> (tracking pixels and inline SVG are exceptions).
Provide width/height, or fill with a parent that has relative plus a fixed aspect-\* or height (S10). Unbounded fill images are forbidden.
Always set sizes on fill images. Without it Next.js generates a limited srcset and mobile devices download oversized files.
alt is required: product images use the product name (plus variant/color when relevant), the logo uses the store name, and purely decorative images use alt="". Never use filenames or "image", and do not keyword-stuff.
tsx

<div className="relative aspect-square w-full overflow-hidden rounded-2xl bg-slate-100">
  <Image
    src={product.images[0]} alt={product.name} fill
    sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 320px"
    className="object-cover"
  />
</div>
6.3 sizes values

sizes must mirror the real layout. Cap at a pixel width once the container stops growing (the boxed container is max-w-7xl, 1280px), otherwise large screens download images far bigger than displayed. If you change grid classes (see the homepage section skill's getGridClasses), update sizes too.

Component Required sizes
Hero slider banner (full width) 100vw
Product card, 4-column grid (max-width: 640px) 50vw, (max-width: 1024px) 33vw, 320px
Category card (fixed thumb) (max-width: 768px) 33vw, 160px
Video reel thumbnail (9:16) (max-width: 768px) 50vw, 220px
PDP main image (max-width: 1024px) 100vw, 600px
6.4 LCP image (S11)
Next.js 16 deprecated priority in favor of preload. Use <Image preload ... />; on older versions keep priority.
Preload exactly one image: the first hero slide on the homepage, the main image on a PDP. Never preload card lists or below-the-fold images.
Render the LCP image in server HTML. A client-only carousel that mounts after hydration delays LCP, so the first slide must be in the initial markup.
Hero carousel: slides after the first stay lazy.
Below-the-fold images keep default lazy loading. 7. Core Web Vitals
7.1 Targets

Google's "good" thresholds are measured on field data at the 75th percentile: LCP up to 2.5s, INP up to 200ms, CLS up to 0.1. SellDesk uses stricter internal budgets.

Metric Google "good" SellDesk budget Main techniques
LCP 2.5s < 2.0s Server-rendered LCP image with preload, AVIF/WebP, CDN, ISR, fast TTFB
CLS 0.1 < 0.05 Reserved space everywhere (7.2), font fallback metrics
INP 200ms < 150ms Small client islands, granular store selectors, transitions, debounced inputs
TTFB 0.8s < 0.6s Cached/ISR pages, no per-request dynamic APIs where avoidable

FID is retired as a Core Web Vital (replaced by INP). Do not track it.

Measure on mobile with throttled network and CPU (mid-range device profile), because Lighthouse lab numbers alone are not enough. Report real-user metrics with useReportWebVitals to analytics when available.

7.2 CLS rules
Every image/media slot has intrinsic dimensions or a fixed aspect ratio.
Skeletons match final size. Late-loaded content (price/stock widgets, reviews count, embeds, banners, announcement bars) reserves its height.
Never insert content above existing content after load. Cookie banners, toasts and the cart drawer are fixed/overlay, not in-flow.
Fixed header height; no height change on scroll.
Fonts: use next/font with display: "swap". If the storefront renders Bengali, include only the needed subsets (for example ["latin", "bengali"]) to keep font files small.
7.3 INP rules
Keep "use client" at interactive leaves; Server Components for everything else.
Zustand: subscribe with selectors, never to the whole store.
Wrap non-urgent updates (filters, tab switches) in startTransition; debounce search/filter inputs (about 250-300ms).
No heavy synchronous work in click handlers (add-to-cart should update state first, then do side effects).
Virtualize or paginate very long lists.
7.4 Third-party scripts (S13)

Merchant pixels (Meta, Google, TikTok) and chat widgets are the biggest INP/LCP risk.

Load through next/script: afterInteractive for analytics/pixels, lazyOnload for chat and non-essential widgets. Never paste a blocking <script> into the document head.
Respect consent requirements for the store's region.
Verify the Lighthouse impact after adding any script.
7.5 Rendering and caching
Primary content (title, price, images, description) is rendered on the server, never fetched client-side after load.
Use the project's caching model (fetch revalidate with tags, or use cache if cache components are enabled), and call revalidateTag when a merchant updates a product or store settings.
Avoid cookies()/headers() inside product and category rendering, since reading them forces dynamic rendering and slows TTFB. Resolve the tenant from the route/host once, high in the tree.
7.6 On-page basics

One <h1> per page (product name on a PDP); logical heading order; descriptive internal link text via next/link; clean readable slugs; <html lang> set from the store locale. Add hreflang alternates only if separate language versions exist.

8. Anti-Patterns
   Do not Do instead
   document.title = ... / useEffect for meta generateMetadata
   dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} <JsonLd data={...} /> (escapes <)
   Canonical in a shared layout Each page sets its own canonical
   Page openGraph without siteName/image fallback buildOpenGraph() helper
   catch { return { title: "Product Details" } } notFound() for 404, rethrow other errors
   Fetch the same product separately in metadata and page cache() fetchers
   Hardcoded https://${sub}.selldesk.com getStoreOrigin(store)
   og:type = "article" for products website
   Slice raw HTML description at 160 chars toMetaDescription()
   Indexable cart/checkout/order pages noindex per matrix
   hostname: "\*\*" in remotePatterns Specific CDN host
   priority on Next.js 16 preload on the single LCP image
   Preload every hero slide or card One LCP image only
   sizes="25vw" on a capped container Mirror the layout and cap in px
   FID in the dashboard INP
   Raw <script> pixel in head next/script
   Fake aggregateRating Only real, visible reviews
   alt="" on informative images, or alt="image" Meaningful alt; empty only for decoration
9. Definition of Done
   Title, description, canonical, OG and Twitter are in the initial HTML (verify with view-source or curl -A "Googlebot").
   Canonical is absolute, on the store's primary origin, with no /store/[slug] prefix, and set per page.
   Page-level openGraph/twitter use the shared builders (siteName, image fallback, url).
   Missing product/category returns a real 404; backend errors do not produce a 200 placeholder.
   Cart, checkout, orders, account, search, filters and preview are noindex; order pages are no-store.
   robots.txt and sitemap.xml resolve per host and match canonical URLs.
   JSON-LD rendered via JsonLd; passes Rich Results Test; matches visible content; no fabricated data.
   Images: remotePatterns specific, sizes accurate, parents sized, alt meaningful, exactly one preload image, LCP image in server HTML.
   No new layout shift: skeletons/reserved space, next/font, no in-flow late inserts.
   Third-party scripts via next/script with a non-blocking strategy.
   Lighthouse mobile run (throttled) meets the internal budgets: LCP < 2.0s, CLS < 0.05, INP < 150ms.
   Spot-check sharing previews (Facebook/WhatsApp/X debuggers) and a PDP in Search Console's URL Inspection after deploy.

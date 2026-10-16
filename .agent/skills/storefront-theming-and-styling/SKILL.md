Architecture standards for selldesk-storefront - feature-first folder structure (src/app, src/features, src/shared), dependency direction and public-API rules, multi-tenant resolution in proxy.ts (host-only tenant, header spoofing protection), params-based tenant access that keeps ISR working, server/client API layer (serverFetch, ApiError, axios client), cache tag registry, secure on-demand revalidation webhook, env and server-only boundaries, and migration from the old layer-first layout. MUST be used whenever adding, moving or refactoring storefront routes, features, components, hooks, stores, services, proxy/middleware, API clients, caching or env config. Use it even for "small" additions (a new component, a util, one API call) because that is where files end up in the wrong place and layers get tangled.

Storefront Architecture Standards

This skill defines where code lives, what may import what, how a request is resolved to a tenant, and how data flows from the API to the UI in selldesk-storefront (Next.js 16 App Router, TypeScript, Tailwind v4, Zustand).

How to use this skill (for AI agents): read Section 0 (hard rules) and Section 1 (structure) first, then the sections your task touches. Before creating any file, decide its home with the decision table in Section 2.3. Run the Definition of Done (Section 11) before finishing. If a request conflicts with a hard rule, explain why and propose a compliant alternative.

0. Hard Rules (non-negotiable)

# Rule

A1 The tenant comes from the host only. The proxy derives the store from the request host. A slug supplied in the URL path (/store/x/...) or in a client-sent header is never trusted. In production, direct /store/\* requests are rejected.
A2 The proxy overwrites tenant headers on every request it handles (x-store-slug, x-tenant-host). Never read tenant headers on paths the proxy matcher excludes.
A3 Pages and layouts read the tenant from params.storeSlug, not from headers(). Reading headers() forces dynamic rendering and defeats ISR.
A4 Feature-first. Code lives in the feature that owns it. src/app is thin: routing, data loading and composition only.
A5 Dependency direction is app -> features -> shared. shared never imports from features. Cross-feature imports follow the matrix in Section 2.2 and use public APIs only. No import cycles.
A6 No deep imports into another feature. Import @/features/cart, never @/features/cart/components/cart-drawer. Inside a feature, use relative imports. ESLint enforces this.
A7 Presentation never does HTTP. Components call hooks or services of their own feature. Services call shared/api.
A8 Server-only code is marked import "server-only". Server and client API clients live in separate files. Secrets never use NEXT*PUBLIC*.
A9 One error type. Server and client both throw ApiError (status, code, safe message). Server pages map 404 to notFound() and rethrow everything else.
A10 One registry for cache tags and revalidate times. No ad-hoc tag strings in services.
A11 User-specific or PII data is never cached (cache: "no-store"): orders, coupons per customer, anything tied to a token.
A12 The revalidation webhook fails closed: secret required, timing-safe compare, validated body, tenant-scoped tags, no arbitrary tags from the request.
A13 Mocks are never a production fallback. Fake data on API failure ships fake stores, prices and SEO content.
A14 src/shared/types is pure. No runtime code, no enums, no React. Runtime schemas (zod) live in a feature's schemas/ folder.
A15 Barrels are public APIs, not folder indexes. One index.ts (client-safe) and one server.ts (server-only) per feature, no nested barrels.

1. Folder Structure (feature-first)

Each feature is a self-contained vertical slice with its own components, hooks, services, store, schemas and utils. Shared code is limited to things that have no business knowledge.

selldesk-storefront/
├── src/
│ ├── proxy.ts # Tenant resolution (named middleware.ts on Next.js 15 and older)
│ │
│ ├── app/ # ROUTING ONLY: thin pages, layouts, metadata, route handlers
│ │ ├── layout.tsx # Root HTML wrapper, fonts, global providers
│ │ ├── globals.css # Tailwind v4 + design tokens
│ │ ├── not-found.tsx
│ │ ├── global-error.tsx
│ │ ├── robots.ts # Host-resolved (see SEO skill)
│ │ ├── sitemap.ts # Host-resolved (see SEO skill)
│ │ ├── api/revalidate/route.ts # On-demand revalidation webhook
│ │ └── store/[storeSlug]/
│ │ ├── layout.tsx # Tenant layout: validates store, theme vars, shell
│ │ ├── loading.tsx
│ │ ├── error.tsx
│ │ ├── not-found.tsx
│ │ ├── page.tsx # Home
│ │ ├── cart/page.tsx
│ │ ├── checkout/page.tsx
│ │ ├── orders/[orderNumber]/page.tsx
│ │ └── products/
│ │ ├── page.tsx # Catalog / search
│ │ └── [slug]/page.tsx # PDP
│ │
│ ├── features/ # BUSINESS FEATURES (vertical slices)
│ │ ├── tenant/ # Store config, bootstrap loader, host resolution, theme
│ │ │ ├── components/ # store-theme-provider.tsx
│ │ │ ├── services/ # tenant.service.ts
│ │ │ ├── schemas/
│ │ │ ├── server.ts # getBootstrap(), resolveStoreByHost() [server-only]
│ │ │ └── index.ts
│ │ │
│ │ ├── shell/ # Chrome around pages
│ │ │ ├── components/ # store-header.tsx, store-footer.tsx, announcement-bar.tsx
│ │ │ └── index.ts
│ │ │
│ │ ├── home/ # Dynamic homepage section engine
│ │ │ ├── components/ # dynamic-section-renderer.tsx, -block.tsx, -header.tsx
│ │ │ ├── sections/ # hero-slider-block.tsx, category-grid-block.tsx, ...
│ │ │ ├── preview/ # use-live-preview-sync.ts, section-preview-toolbar.tsx (builder iframe only)
│ │ │ ├── schemas/ # section.schema.ts
│ │ │ ├── utils/ # section-styles.utils.ts, grid-layout.utils.ts
│ │ │ ├── services/ # home.service.ts
│ │ │ ├── server.ts
│ │ │ └── index.ts
│ │ │
│ │ ├── catalog/ # Listing, search, filters, product card
│ │ │ ├── components/ # product-card.tsx, filter-sidebar.tsx, product-grid.tsx
│ │ │ ├── hooks/
│ │ │ ├── services/ # catalog.service.ts
│ │ │ ├── utils/
│ │ │ ├── server.ts
│ │ │ └── index.ts
│ │ │
│ │ ├── product/ # Product detail page
│ │ │ ├── components/ # product-gallery.tsx, variant-picker.tsx, add-to-cart-button.tsx
│ │ │ ├── services/ # product.service.ts
│ │ │ ├── server.ts # getProductOrNotFound(), buildProductMetadata(), JSON-LD builder
│ │ │ └── index.ts
│ │ │
│ │ ├── cart/ # Cart state + drawer + cart page UI
│ │ │ ├── components/ # cart-drawer.tsx, cart-line-item.tsx, cart-icon-button.tsx
│ │ │ ├── hooks/ # use-cart.ts
│ │ │ ├── store/ # use-cart-store.ts
│ │ │ ├── utils/ # cart-math.ts (display totals)
│ │ │ └── index.ts
│ │ │
│ │ ├── checkout/ # Checkout form, summary, coupon, order placement
│ │ │ ├── components/ # checkout-form.tsx, order-summary.tsx, coupon-input.tsx
│ │ │ ├── hooks/ # use-checkout-submit.ts
│ │ │ ├── schemas/ # checkout.schema.ts (shared client/server validation rules)
│ │ │ ├── services/ # checkout.service.ts
│ │ │ └── index.ts
│ │ │
│ │ └── orders/ # Confirmation + status tracking
│ │ ├── components/
│ │ ├── services/ # orders.service.ts (no-store)
│ │ ├── server.ts
│ │ └── index.ts
│ │
│ ├── shared/ # BUSINESS-AGNOSTIC building blocks
│ │ ├── api/
│ │ │ ├── server-fetch.ts # import "server-only"; ISR fetch + ApiError
│ │ │ ├── client.ts # axios factory for browser calls
│ │ │ ├── api-error.ts # ApiError + isNotFoundError()
│ │ │ └── tags.ts # cache tag + revalidate registry
│ │ ├── ui/ # Button, Skeleton, Modal, Toaster (no business logic, no fetching)
│ │ ├── hooks/ # use-debounce.ts, use-media-query.ts (generic only)
│ │ ├── lib/ # utils.ts (cn, formatCurrency), safe-url.ts
│ │ ├── seo/ # json-ld.tsx, metadata helpers (take plain types, import no feature)
│ │ ├── config/ # env.ts (validated env), constants.ts
│ │ └── types/ # product.ts, store.ts, api.ts (types used by 2+ features)
│ │
│ └── mocks/ # Dev-only fixtures (never imported by production code paths)

Only create the subfolders a feature actually needs. An empty hooks/ folder is noise.

2. Dependency Rules
   2.1 Direction
   app -> features -> shared
   app/ composes features and loads data. It contains no business logic and no styling beyond layout wiring.
   Inside a feature: components -> hooks -> services -> shared/api, plus schemas, utils, types available to all of them. Components never import services' HTTP internals directly except through their feature's hooks or props from the server.
   shared/ui has no knowledge of stores, carts or products.
   2.2 Cross-feature matrix

A feature may import only the features listed, and only via their public API (index.ts / server.ts).

Feature May import
tenant shared
shell tenant, cart, shared
cart tenant, shared
catalog tenant, cart, shared
product tenant, cart, catalog, shared
home tenant, catalog, cart, shared
checkout tenant, cart, shared
orders tenant, shared

This graph has no cycles. If you need an import that is not listed, do not add it silently: either move the shared piece down (to shared), pass it in as a prop/composition from app/, or propose a matrix change.

2.3 Where does this file go? (decision table)
What you are adding Home
A page, layout, route handler src/app/... (thin)
UI used by one feature features/<f>/components/
UI used by 2+ features, no business knowledge shared/ui/
UI used by 2+ features, with business knowledge Belongs to the lower feature, exported via its index.ts
API calls for a domain features/<f>/services/<f>.service.ts
Server data loader (cached, notFound() mapping) features/<f>/server.ts
Client state features/<f>/store/
Validation rules features/<f>/schemas/
A type used by one feature features/<f>/types.ts
A type used by 2+ features (rule of two) shared/types/
Pure helper used by one feature features/<f>/utils/
Generic helper (no domain words in it) shared/lib/
Env var, constant used everywhere shared/config/
2.4 Public APIs and barrels (A15)
index.ts: exports only what other features/pages may use, and is safe to import from client code.
server.ts: starts with import "server-only"; data loaders, metadata builders. Client code can never import it (build error).
No index.ts in components/, utils/, etc. Barrels in every folder cause circular imports and larger dev compiles and defeat tree-shaking.
Types: a feature's index.ts may export type { ... }; type exports are erased and safe.
2.5 Enforcement (ESLint flat config)
js
// eslint.config.mjs (excerpt)
export default [
{
files: ["src/**/*.{ts,tsx}"],
rules: {
"no-restricted-imports": ["error", {
patterns: [{
group: ["@/features/*/*", "!@/features/*/server"],
message: "Import features through their public API (@/features/<name> or @/features/<name>/server).",
}],
}],
},
},
{
files: ["src/shared/**/*.{ts,tsx}"],
rules: {
"no-restricted-imports": ["error", {
patterns: [{ group: ["@/features/*", "@/app/*"], message: "shared must not import features or app." }],
}],
},
},
];

Use relative imports inside a feature. For the cross-feature matrix and cycle detection, add eslint-plugin-boundaries or dependency-cruiser in CI. Adopt the rules in warn mode first during migration (Section 10).

3. Server vs Client Boundaries
   Concern Rule
   Default Server Components. Add "use client" only at interactive leaves (forms, drawers, carousels, stores).
   Props across the boundary Serializable only (no functions, class instances, Dates as objects).
   Server-only modules import "server-only" at top (server-fetch.ts, every server.ts).
   Browser-only modules import "client-only" where it would break on the server.
   Env Private vars read only in server files via shared/config/env.ts. Public vars always NEXT*PUBLIC*\*.
   Providers Small, near the leaf. A client provider at the root makes every child client-rendered unless passed as children.
   3.1 Env validation (shared/config/env.ts)

Validate once with zod and fail fast on boot. There are two API URLs on purpose: the browser needs a public one, the server can use an internal one.

typescript
const serverSchema = z.object({
SERVER_API_URL: z.string().url(), // internal/private, used by serverFetch
REVALIDATE_SECRET: z.string().min(32),
});
const clientSchema = z.object({
NEXT_PUBLIC_API_URL: z.string().url(), // used by the axios client in the browser
NEXT_PUBLIC_ROOT_DOMAIN: z.string().min(3),
});

The original code used a single API*BASE_URL for both clients. A non-NEXT_PUBLIC* variable is undefined in the browser, so the axios client would break.

4. Multi-Tenant Resolution (src/proxy.ts)

Next.js 16 renamed middleware.ts to proxy.ts (export proxy). Verify against your installed version.

4.1 Flow
Request
|
v
Normalize host (lowercase, strip port, strip trailing dot, validate charset)
|-- invalid -> 404
v
Is path under /store/\* ? (internal route prefix)
|-- YES and production -> 404 (A1: tenant never comes from the path)
v
Resolve slug from HOST ONLY:

1. {label}.{ROOT_DOMAIN}: exactly one label, matches SLUG_RE, not RESERVED -> slug
2. {label}.localhost: only when NODE_ENV !== "production" -> slug
3. otherwise: custom-domain lookup (host -> real slug), cached, fail closed -> slug | null
   |-- null -> 404 (noindex)
   v
   Strip incoming x-store-slug / x-tenant-host, set trusted values (A2)
   Rewrite to /store/{slug}{pathname}, keep the query string

The original flow had three problems: (1) a request starting with /store/ was trusted first, so on tenant A's domain someone could open /store/B/... (cross-tenant access plus duplicate content); (2) tenant headers from the client were not stripped, and Server Components trust them; (3) for custom domains it set storeSlug = host, so one header carried either a slug or a domain. Always resolve a custom domain to the real slug.

4.2 Implementation sketch
typescript
// src/proxy.ts
import { NextResponse, type NextRequest } from "next/server";

const ROOT = process.env.NEXT_PUBLIC_ROOT_DOMAIN!;
const IS_PROD = process.env.NODE_ENV === "production";
const SLUG_RE = /^[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?$/;
const RESERVED = new Set(["www", "api", "admin", "app", "dashboard", "mail", "cdn", "static", "assets", "store"]);

const notFound = () =>
new NextResponse("Store not found", { status: 404, headers: { "x-robots-tag": "noindex" } });

function normalizeHost(raw: string | null): string | null {
if (!raw) return null;
const h = raw.toLowerCase().split(":")[0].replace(/\.$/, "");
  return /^[a-z0-9.-]+$/.test(h) ? h : null;
}

export async function proxy(req: NextRequest) {
const host = normalizeHost(req.headers.get("host"));
if (!host) return notFound();
if (IS_PROD && req.nextUrl.pathname.startsWith("/store/")) return notFound();

let slug: string | null = null;
if (host.endsWith(`.${ROOT}`)) {
const label = host.slice(0, -(ROOT.length + 1));
if (!label.includes(".") && SLUG_RE.test(label) && !RESERVED.has(label)) slug = label;
} else if (!IS_PROD && host.endsWith(".localhost")) {
const label = host.slice(0, -".localhost".length);
if (SLUG_RE.test(label)) slug = label;
} else {
slug = await resolveCustomDomain(host); // cached lookup, returns null on miss or error
}
if (!slug) return notFound();

const headers = new Headers(req.headers);
headers.delete("x-store-slug");
headers.delete("x-tenant-host");
headers.set("x-store-slug", slug);
headers.set("x-tenant-host", host);

const url = req.nextUrl.clone();
url.pathname = `/store/${slug}${url.pathname === "/" ? "" : url.pathname}`;
return NextResponse.rewrite(url, { request: { headers } });
}

export const config = {
// Excluded: API routes (webhook), Next internals, and file-like paths (robots.txt, sitemap.xml, images)
matcher: ["/((?!api/|_next/|.*\\..*).*)"],
};
resolveCustomDomain uses a short-TTL cache (in-memory LRU or KV) and fails closed (returns null on any error).
robots.ts and sitemap.ts run outside the proxy, so they resolve the tenant from the host header through resolveStoreByHost() (in features/tenant/server.ts), never from x-store-slug.
/api/revalidate must stay excluded from the matcher; otherwise the backend's webhook gets rewritten to a tenant path and breaks.
/store is reserved so no merchant page or subdomain can collide with the internal prefix.
4.3 Reading the tenant in the app (A3)

Because the proxy rewrites to /store/[storeSlug]/..., the slug is already in params:

tsx
// src/app/store/[storeSlug]/page.tsx
export const dynamicParams = true;
export function generateStaticParams() { return []; } // generate on first request, then cache (verify with `next build` output)

export default async function Page({ params }: { params: Promise<{ storeSlug: string }> }) {
const { storeSlug } = await params;
const { store } = await getBootstrap(storeSlug); // notFound() inside when the store does not exist
...
}

The original getStoreSlugFromHeaders() called headers() from pages. That opts the whole route into dynamic rendering, so you lose ISR even though the fetches are tagged. Remove it from pages and layouts. The tenant layout validates params.storeSlug with SLUG_RE and calls notFound() for an unknown store.

5. API Layer (shared/api)
   5.1 One error type
   typescript
   // shared/api/api-error.ts
   export class ApiError extends Error {
   constructor(
   public readonly status: number,
   message: string,
   public readonly code?: string,
   public readonly details?: unknown,
   ) { super(message); this.name = "ApiError"; }
   }
   export const isNotFoundError = (e: unknown) => e instanceof ApiError && e.status === 404;

The original flattened every failure into new Error(message), which loses the status. Without it, pages cannot tell a missing product (404) from an outage (500), and checkout cannot react to codes like OUT_OF_STOCK or PRICE_CHANGED.

5.2 Tag and revalidate registry (A10)
typescript
// shared/api/tags.ts
export const tags = {
tenant: (s: string) => `store:${s}`, // umbrella: attached to every fetch
bootstrap: (s: string) => `store:${s}:bootstrap`,
sections: (s: string) => `store:${s}:sections`,
products: (s: string) => `store:${s}:products`,
product: (s: string, slug: string) => `store:${s}:product:${slug}`,
categories: (s: string) => `store:${s}:categories`,
} as const;

export const REVALIDATE = { bootstrap: 3600, sections: 300, products: 120, product: 300, categories: 1800 } as const;

The original strategy table was never wired into code. The default fetch used tenant:${slug}, which nothing revalidated, and the webhook revalidated only bootstrap and products, leaving categories, product pages and homepage sections stale. Every fetch now carries the umbrella tag plus its specific tag, so "revalidate the whole store" is one call.

5.3 serverFetch (server only)
typescript
// shared/api/server-fetch.ts
import "server-only";
import { env } from "@/shared/config/env";
import { ApiError } from "./api-error";
import { tags as tagReg } from "./tags";

type Opts = { revalidate?: number | false; tags?: string[]; noStore?: boolean; timeoutMs?: number };

export async function serverFetch<T>(endpoint: string, storeSlug: string, opts: Opts = {}): Promise<T> {
const url = `${env.SERVER_API_URL}${endpoint.startsWith("/") ? endpoint : `/${endpoint}`}`;
const res = await fetch(url, {
headers: { "Content-Type": "application/json", "x-store-slug": storeSlug.trim() },
signal: AbortSignal.timeout(opts.timeoutMs ?? 8000), // a hung API must not hang rendering
...(opts.noStore
? { cache: "no-store" as const } // A11: PII and user-specific data
: { next: { revalidate: opts.revalidate ?? 60, tags: [tagReg.tenant(storeSlug), ...(opts.tags ?? [])] } }),
});

if (!res.ok) {
const body = await res.json().catch(() => null);
throw new ApiError(res.status, body?.message ?? "Request failed", body?.code, body?.details);
}
const json = await res.json();
return (json && typeof json === "object" && "data" in json && "success" in json ? json.data : json) as T;
}

Rules: GET only; the envelope is detected explicitly instead of json.data ?? json (which misfires when a payload has its own data field); orders, coupons and any token-bound response use noStore: true; endpoints are called only from feature services.

5.4 Browser client (shared/api/client.ts)
typescript
export function createApiClient(storeSlug?: string): AxiosInstance {
const client = axios.create({
baseURL: env.NEXT_PUBLIC_API_URL,
timeout: 15000,
headers: { "Content-Type": "application/json", Accept: "application/json",
...(storeSlug ? { "x-store-slug": storeSlug.trim() } : {}) },
});
client.interceptors.response.use(
(r) => r.data,
(error) => {
const status = error.response?.status ?? 0;
const data = error.response?.data;
// Show server messages only for 4xx; never leak 5xx internals to the UI
const message = status >= 400 && status < 500 ? data?.message ?? "Request failed"
: "Something went wrong. Please try again.";
return Promise.reject(new ApiError(status, message, data?.code, data?.details));
},
);
return client;
}

The x-store-slug the browser sends is a hint, not authorization. The API must scope every mutation (checkout, coupon) to the tenant it derives itself and validate the rest.

5.5 Feature services

Each feature owns a small service, not one global facade. A single StorefrontService that holds every endpoint (coupons, products, orders, reviews...) becomes a god object and couples all features.

typescript
// features/product/services/product.service.ts
import "server-only"; // only if this file is server-only; client calls live in a separate client service
export const productService = {
getBySlug: (storeSlug: string, slug: string) =>
serverFetch<Product>(`/products/${encodeURIComponent(slug)}`, storeSlug, {
revalidate: REVALIDATE.product, tags: [tags.product(storeSlug, slug)],
}),
};

Keep server calls (cached serverFetch) and browser calls (axios) in separate service files or separate exports guarded by the server/client rule in Section 3.

6. Revalidation Webhook (app/api/revalidate/route.ts)
   typescript
   import { createHash, timingSafeEqual } from "node:crypto";
   import { revalidateTag } from "next/cache";
   import { NextRequest, NextResponse } from "next/server";
   import { z } from "zod";

const Body = z.object({
storeSlug: z.string().regex(/^[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?$/),
scope: z.enum(["all", "bootstrap", "sections", "products", "categories", "product"]).default("all"),
productSlug: z.string().max(200).optional(),
});

const safeEqual = (a: string, b: string) =>
timingSafeEqual(createHash("sha256").update(a).digest(), createHash("sha256").update(b).digest());

export async function POST(req: NextRequest) {
const expected = process.env.REVALIDATE_SECRET;
if (!expected) return NextResponse.json({ message: "Server misconfigured" }, { status: 500 }); // fail closed
if (!safeEqual(req.headers.get("x-revalidate-secret") ?? "", expected)) {
return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
}

const parsed = Body.safeParse(await req.json().catch(() => null));
if (!parsed.success) return NextResponse.json({ message: "Invalid body" }, { status: 400 });
const { storeSlug, scope, productSlug } = parsed.data;

const tag =
scope === "all" ? tags.tenant(storeSlug)
: scope === "product" && productSlug ? tags.product(storeSlug, productSlug)
: scope !== "product" ? tags[scope](storeSlug)
: null;
if (!tag) return NextResponse.json({ message: "productSlug required" }, { status: 400 });

revalidateTag(tag, "max"); // Next.js 16 signature (profile argument); older versions take only the tag
return NextResponse.json({ revalidated: true, tag });
}

Fixes over the original: the secret check passed if both sides were empty strings and was not timing-safe; the request could name any tag (cache-busting abuse or cross-tenant mistakes); malformed JSON caused a 500; the mismatch between tag names and fetch tags is gone because both use tags.ts. Backends send scope instead of raw tags.

7. Mocks (A13)
   Mock data lives in src/mocks/, imported only by tests, Storybook and an explicit dev switch (NEXT_PUBLIC_USE_MOCKS === "true" and NODE_ENV === "development").
   API failure in production means notFound() (404) or an error page, never fixtures. Fixtures would produce fake products, fake prices, and indexable fake pages.
8. Types and Schemas (A14)
   shared/types/ holds only types used by two or more features (Product, StoreConfig, API envelope). Everything else is co-located in features/<f>/types.ts (rule of two).
   Use string-literal unions instead of enum (enums emit runtime code and block erasableSyntaxOnly).
   Runtime validation (zod) lives in features/<f>/schemas/, with z.infer types exported next to it. This replaces the old "types and schemas" folder that contradicted its own rule about importing no libraries.
9. Conventions
   File names: kebab-case (checkout-form.tsx, use-cart-store.ts); exported components PascalCase; hooks useX. One component per file.
   Import aliases: @/features/_, @/shared/_, @/app/\*. Relative imports inside a feature.
   Route files stay thin (about 50 lines): fetch, notFound() mapping, metadata, render the feature's component.
   DOM access (document.querySelector, scroll) is allowed only inside preview/builder hooks and event handlers. Presentation components never mutate DOM or el.style; dynamic styling flows through props and CSS variables.
   Every route segment with data has loading.tsx, error.tsx, and not-found.tsx where a 404 is possible.
10. Migration from the Old Layer-First Layout

Do it incrementally; the app must build after every step.

Add shared/api (api-error, tags, server-fetch, client) and shared/config/env.ts; point the old api-client.ts at them.
Switch the proxy to the host-only flow; remove getStoreSlugFromHeaders() from pages and use params.
Add ESLint rules in warn mode.
Move one feature per PR in this order: tenant, cart, catalog, product, checkout, orders, home, shell.
src/store/use-cart-store.ts to features/cart/store/; src/hooks/use-cart.ts to features/cart/hooks/.
src/components/checkout/_ to features/checkout/components/.
src/components/home/_ to features/home/ (hooks/ and sections/, utils/); use-live-preview-sync.ts to features/home/preview/.
Split StorefrontService into per-feature services; keep a thin deprecated re-export until the last caller moves.
src/types/\* to shared/types (cross-feature) or feature types.ts.
constants/mock-storefront.constants.ts to src/mocks/.
Delete the empty old folders, switch ESLint to error.

Sibling skills reference old paths. After migration, update them: use-cart-store.ts and use-cart.ts (cart skill), checkout-form.tsx (cart skill), DynamicSection*, useLivePreviewSync (homepage skill), src/lib/seo/* (SEO skill, now shared/seo plus features/\*/server.ts).

11. Anti-Patterns
    Do not Do instead
    Trust /store/<slug> from the URL or a client header Host-only tenant; proxy overwrites headers; block /store/_ in production
    headers() in pages to get the tenant params.storeSlug
    Put everything in src/components/_ by type Feature slices in src/features/\*
    Import @/features/cart/components/... from another feature @/features/cart public API
    shared importing a feature Move the code down, or compose from app/
    One StorefrontService with every endpoint Per-feature services
    One file holding serverFetch and the axios client Separate server-fetch.ts and client.ts
    One API*BASE_URL for server and browser SERVER_API_URL and NEXT_PUBLIC_API_URL
    throw new Error(message) from the API layer ApiError with status and code
    Ad-hoc tag strings in services tags.ts registry
    Cache order or coupon responses noStore: true
    Webhook accepting arbitrary tags or comparing secrets with !== Scoped enum, timing-safe compare, fail closed
    catch { return mockStore } in production notFound() or error page
    enum and zod schemas inside types/ Literal unions; schemas in features/<f>/schemas/
    index.ts in every folder One index.ts and one server.ts per feature
    fetch/axios inside a component Feature hook or server loader
    fetch('/api/v1/...') from UI Feature service through shared/api
    NEXT_PUBLIC* on any secret Server-only env, validated in env.ts
12. Definition of Done
    New code lives in the right feature (Section 2.3) and app/ files stay thin.
    No deep imports across features; no shared -> features import; ESLint passes; no new cycles.
    Cross-feature imports respect the Section 2.2 matrix.
    Tenant is read from params; headers() is not used in pages/layouts; the proxy still strips and sets tenant headers.
    Direct /store/\* is rejected in production; /api/revalidate, robots, sitemap, assets are excluded from the proxy matcher.
    Server-only files start with import "server-only"; no secret has a NEXT*PUBLIC* prefix.
    API errors are ApiError; 404 maps to notFound(), other errors rethrow.
    Every fetch uses tags from tags.ts and times from REVALIDATE; PII fetches use noStore.
    Revalidation webhook is fail-closed, timing-safe, and scoped.
    No mock data reachable from production paths.
    next build output confirms tenant pages are cached/ISR as intended (not all dynamic).
    Sibling-skill file paths updated if files were moved.

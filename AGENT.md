SellDesk Storefront: AI Agent Governance & Architecture Rulebook

Status: Active & Authoritative Last reviewed: 2026-10-10 Applies to: selldesk-storefront (Next.js 16 App Router, React 19, TypeScript 5, Tailwind CSS v4, Zustand) Audience: AI agents, architects, frontend engineers, CI tooling

This is the top-level rulebook for all code generation, refactoring and component design in selldesk-storefront. Domain details live in the skills under skills/ (Section 10). This file holds the global rules; skills hold the domain rules. If the two ever conflict, stop and ask the user. Security rules (Section 3) win over convenience in every case.

0. Agent Workflow (read this first)
   Read before you write. Open the relevant skill(s) from the index in Section 10 before editing. Most storefront bugs come from skipping this.
   Place files correctly. Use the feature-first structure (Section 2). Decide where a file lives before creating it.
   Keep diffs minimal. Change only what the task needs. Do not refactor, rename or reformat unrelated code.
   Do not invent contracts. If an API field, endpoint, env var or backend behavior is unknown, say so and ask. Never guess a security-relevant behavior.
   Verify. Run the CI gates (Section 9) and the Definition of Done of each skill you used.
   Report honestly. Say what you changed, what you assumed, and what you could not verify.

If a request conflicts with a rule here or in a skill, do not silently comply. Explain the risk and propose a compliant alternative.

1. Architectural Identity
   1.1 White-Labeled Presentation Engine

selldesk-storefront is the public, high-traffic storefront for all SellDesk merchants. Unlike selldesk-store-admin (an authenticated management portal), the storefront is:

Public: exposed to crawlers, social bots and anonymous shoppers. Treat all merchant-provided content as untrusted input.
White-labeled: branding, colors, typography, header and homepage layout come entirely from tenant configuration delivered by the API.
Conversion-critical: latency, layout shift and broken flows directly cost merchant revenue.
1.2 Performance Budgets

Internal budgets (stricter than Google's "good" thresholds of LCP 2.5s, INP 200ms, CLS 0.1):

Metric Budget
LCP < 2.0s on simulated mobile 4G
CLS < 0.05
INP < 150ms (cart drawer, variant selectors, filters)
FCP < 1.2s
TTFB < 0.6s

Verify on mobile with throttling, and prefer field data (real users) over lab scores where available. FID is retired; do not track it. Details: seo-and-web-vitals.

1.3 Administrative Isolation

The storefront repository must never contain:

Admin credentials, dashboard layouts or store-owner management panels.
Direct mutations of store configuration or billing data.
Debug endpoints, or administrative JWT decoding logic.
Hardcoded tenant domains, API URLs, ports or secrets. All of these come from validated env (shared/config/env.ts). 2. Project Structure (feature-first)
src/
├── proxy.ts # tenant resolution (middleware.ts on Next.js 15 and older)
├── app/ # routing ONLY: thin pages, layouts, metadata, route handlers
├── features/ # business slices: tenant, shell, home, catalog, product, cart, checkout, orders
│ └── <feature>/ # components/ hooks/ services/ store/ schemas/ utils/ types.ts server.ts index.ts
├── shared/ # business-agnostic: api/, ui/, hooks/, lib/, seo/, config/, types/
└── mocks/ # dev-only fixtures

Rules (full detail and the cross-feature import matrix in storefront-architecture-standards):

Dependency direction is app -> features -> shared. shared never imports features.
A feature is imported only through its public API: @/features/<name> (client-safe) or @/features/<name>/server (server-only). No deep imports into another feature. Use relative imports inside a feature.
Cross-feature imports must follow the allowed matrix. No import cycles.
A type used by two or more features lives in shared/types. Everything else is co-located with its feature.
Files are kebab-case, one component per file, exported components PascalCase.
No barrel index.ts in every folder. One index.ts and one server.ts per feature. 3. Security Baseline (applies to every change)

# Rule

SEC1 Never trust the client for money. Prices, discounts, delivery fees, totals and stock shown in the UI are display estimates. The server recomputes everything. The client sends IDs and quantities only. (cart-and-checkout-lifecycle)
SEC2 The tenant comes from the host only. Never trust a slug from the URL path or a client-sent header. Direct /store/_ is rejected in production. Pages read the tenant from params.storeSlug, not headers(). (storefront-architecture-standards)
SEC3 No dangerouslySetInnerHTML except the shared JsonLd helper, which escapes <. Merchant text renders only as React text.
SEC4 Validate all external data with a schema (zod): API responses, postMessage payloads, merchant config and styles. Unknown fields are stripped.
SEC5 Validate URLs and styles. Links go through safeHref(); embeds through a host allowlist; colors and sizes through whitelist/clamp helpers. Never interpolate raw merchant strings into CSS or class names.
SEC6 postMessage is authenticated. Check event.source === window.parent and an exact-origin allowlist; never send to "_". Preview mode requires ?preview=true and being framed by an allowed origin. (dynamic-homepage-section-engine)
SEC7 Secrets stay server-side. No secret uses NEXT*PUBLIC*. Server-only modules start with import "server-only".
SEC8 No PII in localStorage, URLs (except opaque tokens), logs or analytics. Order pages need an access token and are noindex and no-store.
SEC9 Never cache user-specific data. Orders, coupons per customer and token-bound responses use no-store.
SEC10 Show safe errors. Never display raw backend or 5xx messages in the UI. Use ApiError codes to select UX.
SEC11 Mocks never run in production, including as an error fallback. 4. Zero-Garbage Code
4.1 No Monolithic Components
File limit: no component file exceeds 250 lines. Decompose into sub-components, hooks or utils before it gets there. Keep functions short (about 50 lines or less).
Single responsibility: section blocks (ProductShowcaseBlock, HeroSliderBlock, VideoReelsBlock) delegate controls, cards, modals and data normalization to companion files inside src/features/home/sections/ and src/features/home/utils/.
No inline business logic: state workflows, sorting, array mutation and network calls never live inline in JSX. Extract hooks or pure utilities.
4.2 Avoid Needless Re-renders
Push state down to the smallest component that uses it.
Memoize callbacks passed to memoized children (useCallback with React.memo).
Subscribe to Zustand with selectors. Never call a store hook without a selector. Use useShallow when selecting an object.
typescript
// FORBIDDEN: re-renders on any cart change
const { items, isOpen } = useCartStore();

// REQUIRED: granular selectors
const itemCount = useCartStore((s) => s.items.reduce((n, i) => n + i.quantity, 0));
const toggleDrawer = useCartStore((s) => s.toggleDrawer);
4.3 Dead Code
Remove unused imports immediately.
No commented-out code, obsolete JSX or abandoned tests in commits.
No stray console.log. Use structured error logging or remove debug output. 5. Strict Type Safety
5.1 No any
any, as any, (x: any) and Promise<any> are banned. Use unknown plus zod or type guards.
@ts-ignore is banned. @ts-expect-error requires a one-line reason and a linked issue.
Prefer string-literal unions over enum.
typescript
// FORBIDDEN
function parseSectionData(data: any): Product[] { return data.map((d: any) => d); }

// REQUIRED: schema at the boundary
const result = ProductListSchema.safeParse(data);
if (!result.success) return [];
return result.data;
5.2 Dynamic Sections

Homepage sections use a typed envelope (HomePageSection, SectionStyles) validated by schema. Each block parses its own config with a block-specific schema and falls back to safe defaults. Narrow by discriminated union after type normalization.

5.3 Next.js 16 Route Params

params and searchParams are Promises and must be awaited:

typescript
interface DynamicRouteProps {
params: Promise<{ storeSlug: string; slug?: string }>;
}

export default async function RoutePage({ params }: DynamicRouteProps) {
const { storeSlug } = await params;
// ...
}

Pages that must stay ISR-cached must not await searchParams or call headers()/cookies(), because that makes the route dynamic. Detect preview mode on the client (see the homepage skill).

6. RSC-First Discipline
   6.1 Server Components by default

Every layout and page under src/app/ is an async Server Component. On the server they:

Read the tenant from params.storeSlug and validate it.
Load data through feature server loaders (@/features/<name>/server), which map a 404 to notFound() and rethrow other errors.
Generate metadata with generateMetadata() (canonical, OpenGraph, robots).
Inject merchant theme CSS variables, with every value validated by whitelist helpers.
Render JSON-LD through JsonLd.
6.2 Push "use client" to the leaves

Never mark a whole page or layout "use client". Client components are limited to leaves that need DOM events, interactive state, browser APIs or client stores:

Cart drawer and cart trigger
CheckoutForm
Carousel/slider controls (the first hero slide is rendered in server HTML; only the controls hydrate)
Video reel modal and playback wrappers
Filter sidebar and facet toggles
StoreHomePageClient and useLivePreviewSync (builder preview only, dynamically imported)

Props crossing the server/client boundary must be serializable.

7. Styling & Layout Rules
   7.1 No hardcoded merchant-controlled dimensions
   Never put fixed vertical padding (py-12, py-16) or margins (my-8, mb-12) on dynamic section wrappers. Use the merchant's 4-way spacing (top, bottom, left, right; desktop and mobile).
   Never hardcode card width, gap or columns when cardWidth, cardGap, columns or mobileColumns are configured.
   Tailwind classes are written literally. Never build grid-cols-${n} or pt-${x} from variables.
   7.2 Spacing engine

Section wrappers consume CSS variables from buildSectionStyleVariables() through the shared literal class string (with var() fallbacks):

tsx

<section
  id={`section-${section.id}`}
  data-section-id={section.id}
  style={buildSectionStyleVariables(section.styles)}
  className={cn("relative w-full", visibilityClass, SECTION_SPACING_CLASSES)}
>
  <div className={containerClass(section)}>{children}</div>
</section>

The outer <section> owns margin, padding, background and visibility. The inner container owns max-width. Hide on mobile with max-sm:hidden. Preview hover and selection use outline, never border.

7.3 Typography bindings

Section titles and subtitles bind to the merchant's configuration: titleFontSize, subtitleFontSize, titleFontWeight, titleColor, subtitleColor, titleAlignment (left | center | right), titleLineHeight. Values pass through whitelist/clamp helpers (SEC5) and fall back to the theme default.

7.4 Class merging

Components that accept className must merge with cn() from @/shared/lib/utils (clsx + tailwind-merge). No string concatenation or template literals for Tailwind classes.

typescript
// FORBIDDEN
className={`px-4 py-2 ${className}`}

// REQUIRED
className={cn("px-4 py-2", className)}
7.5 No layout shift

Every media slot has dimensions or a fixed aspect ratio; late content reserves space; fonts use next/font. Exactly one image per page is preloaded (the LCP image). On Next.js 16 use preload, since priority is deprecated. (seo-and-web-vitals)

8. Multi-Tenancy & Data
   8.1 Routing strategies

Tenant resolution lives in src/proxy.ts and uses the host only:

Subdomain (production): gadget-world.selldesk.com is rewritten internally to /store/gadget-world/_.
Custom domain (production): gadgetworld.com is looked up (cached, fail closed), resolved to the real store slug, then rewritten.
Local development: _.localhost subdomains, and direct /store/:slug/\* paths, allowed only when NODE_ENV !== "production".

The proxy strips client-sent x-store-slug and x-tenant-host and sets trusted values on every request it handles. The matcher excludes /api/\*, \_next, and file-like paths (robots.txt, sitemap.xml, assets). Excluded paths never read tenant headers.

8.2 API calls
serverFetch (server only) and the browser axios client both send x-store-slug. Forward other headers only if the backend contract requires them.
The client-sent slug is a hint, not authorization. The API must scope every mutation to a tenant it derives and validates itself.
Cache tags and revalidate times come from the single registry shared/api/tags.ts. PII requests use noStore.
Errors are always ApiError (status, code, safe message). Never throw new Error(message) from the API layer.
8.3 Client storage isolation

Persisted client state (cart, recent views) is isolated per store: switching stores resets the cart so Store A items never appear in Store B. Persist only what is needed (never PII), version the schema, and wait for hydration before store initialization. Details: cart-and-checkout-lifecycle.

9. Live Preview Protocol (summary)

The storefront runs inside the Admin Homepage Builder's iframe only when ?preview=true and it is framed by an allowed origin. In that mode:

Handshake: send SELLDESK_PREVIEW_READY to each allowed origin (never "\*"), retrying until the first valid sync arrives.
Inbound: accept SELLDESK_PREVIEW_SYNC (seq + payload) and SELECT_SECTION only after verifying event.source and event.origin and schema-validating the message. Drop messages with a stale seq.
Selection: scroll the section into view ([data-section-id] lookup with CSS.escape) and show an outline ring.
Outbound actions: the toolbar sends SELECT_SECTION, DUPLICATE_SECTION, MOVE_SECTION_UP, MOVE_SECTION_DOWN, REMOVE_SECTION as requests. The parent owns the state and replies with a new sync.
Links are inert and autoplay is paused in preview. Preview code is dynamically imported and never ships to shoppers.

The full message schema and implementation is in dynamic-homepage-section-engine.

10. Skill Index

Read the matching skill before editing. Paths are relative to the repository root.

Skill Load when the task touches
storefront-architecture-standards New files or folders, imports between features, routes, proxy/tenant resolution, API clients, caching, revalidation, env, mocks
dynamic-homepage-section-engine Homepage sections and blocks, section styles and spacing, card bindings, preview mode, postMessage, merchant section JSON
cart-and-checkout-lifecycle Cart store and drawer, add-to-cart, coupons, delivery fee, checkout form, order placement and confirmation, anything with money, stock or PII
seo-and-web-vitals Metadata, canonicals, robots/sitemap, JSON-LD, images, fonts, third-party scripts, LCP/CLS/INP
storefront-theming-and-styling Tenant theme variables, design tokens, global styles, typography and color bindings

Several tasks span multiple skills (for example a new product block: homepage engine + SEO images + architecture placement). Read all that apply.

11. CI Gates

All of these must pass with zero errors before delivering code:

Check Command Criterion
Type check pnpm exec tsc --noEmit Exit code 0
Lint (includes import-boundary rules) pnpm lint Zero errors and warnings
Production build pnpm build Zero failures; tenant pages are cached/ISR as intended, not all dynamic

Conditional checks:

When you changed Also verify
Metadata, JSON-LD, images, fonts, scripts View-source shows metadata in the initial HTML; Rich Results Test; Lighthouse mobile (throttled) meets the budgets in Section 1.2
Cart, coupon, checkout, order pages The manual test list in the cart skill's Definition of Done (double submit, offline retry, stock change, price change, store switch)
Proxy, API layer, revalidation A request with a spoofed x-store-slug is ignored; /api/revalidate rejects bad or missing secrets
Preview mode A message from a foreign origin is ignored; ?preview=true outside an iframe behaves as normal shopper mode 12. Definition of Done (global)
Relevant skills were read and their Definition of Done passes.
Files live in the right feature; no deep cross-feature imports; no shared -> features import.
No any, no dead code, no stray logs, no component over 250 lines.
No hardcoded merchant-controlled dimensions; cn() used for class merging.
Merchant data is schema-validated and rendered safely (SEC3 to SEC5).
No secrets, PII or mock data exposed (SEC7, SEC8, SEC11).
CI gates (Section 11) pass.
The final report lists changes, assumptions and anything unverified.

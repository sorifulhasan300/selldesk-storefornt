Architecture and rules for the SellDesk storefront dynamic homepage - DynamicSectionRenderer, DynamicSectionBlock, DynamicSectionHeader, block components (hero slider, banners, categories, products, videos, reviews, brands), container layouts, responsive 4-way spacing, typography and card bindings, and the secure bidirectional iframe postMessage live-preview protocol with the admin Homepage Builder. MUST be used whenever building or modifying any homepage section or block, section styles/spacing/visibility, useLivePreviewSync, SectionPreviewToolbar, preview mode, or merchant-provided section JSON (config/styles) in selldesk-storefront. Use it even for small tweaks (a padding class, a new block alias, a toolbar button), because spacing, security and hydration bugs hide there.

Dynamic Homepage Section Engine

The engine turns merchant-defined section JSON from the SellDesk backend into the storefront homepage. It runs in two modes:

Shopper mode: server-rendered, hydrated cleanly, no layout shift, no preview code shipped.
Builder preview mode: the storefront runs inside an iframe in the Admin Homepage Builder and syncs live over postMessage.

How to use this skill (for AI agents): read Section 0 first (hard rules), then only the sections your task touches. Run the Definition of Done (Section 14) before finishing. If a request conflicts with a hard rule, explain the risk and propose a safe alternative instead of silently complying.

0. Hard Rules (non-negotiable)

# Rule

H1 Verify every incoming message. Accept a message event only if event.source === window.parent AND event.origin is in the builder origin allowlist. Checking event.data shape is not authentication.
H2 Never postMessage(..., "\*"). Always pass an explicit target origin from the allowlist.
H3 Validate all section data with a schema (zod or project validator) before rendering, both from the API and from postMessage. Strip unknown fields, cap array sizes.
H4 Merchant text is text. Titles, subtitles, review text, alt text render only through React text nodes. Never dangerouslySetInnerHTML.
H5 URLs are validated. Links go through safeHref() (relative, http:, https: only). Video/embed URLs must match a host allowlist. Images must come from configured next/image remote patterns.
H6 Style values are whitelisted. Numbers are parsed and clamped, colors match a strict regex. Never interpolate a raw merchant string into a style, CSS variable, or class name.
H7 Preview code never ships to shoppers. Preview mode requires ?preview=true AND running inside an iframe AND a trusted parent. Load preview-only code (useLivePreviewSync, toolbar) with next/dynamic.
H8 The iframe never fetches draft data. Unpublished sections arrive only through a trusted SELLDESK_PREVIEW_SYNC message.
H9 Stable keys and IDs. Never key reorderable sections by array index. Duplicated sections get new unique IDs.
H10 One bad section must not break the page. Wrap each block in an error boundary.
H11 Preview chrome must not change layout. Use outline/ring, never border, for hover/selected states.
H12 Layout decisions use CSS breakpoints, not JS viewport detection. window.innerWidth branches cause hydration mismatches and layout shift.
H13 Tailwind classes are written literally. Never build grid-cols-${n} or pt-${x} from variables; the compiler will not generate them.
H14 Server and client render the same first output. Anything that differs (preview flag, device) is applied after hydration or via CSS.

1. File Map
   Concern File
   Page entry (server) src/app/store/[storeSlug]/page.tsx
   Client shell + preview sync src/features/home/components/StoreHomePageClient.tsx, src/features/home/preview/use-live-preview-sync.ts
   Renderer / wrapper / header src/features/home/components/ (DynamicSectionRenderer.tsx, DynamicSectionBlock.tsx, DynamicSectionHeader.tsx)
   Blocks src/features/home/sections/ (HeroSliderBlock, BannerGridBlock, CategoryGridBlock, ProductShowcaseBlock, VideoReelsBlock, CustomerReviewsBlock, BrandShowcaseBlock)
   Spacing/style helpers src/features/home/utils/section-styles.utils.ts
   Grid helpers src/features/home/utils/grid-layout.utils.ts
   Data / service / public API src/features/home/services/home.service.ts, index.ts, server.ts
2. Pipeline
   Server: StoreHomePage (fetch bootstrap + catalog, validate sections with schema)
   |
   v
   Client: StoreHomePageClient (initial sections = server props)
   |
   +----+-----------------------------------------------+
   | Shopper mode Preview mode (H7) |
   | static sections - READY -> allowed origins
   | - SYNC / SELECT_SECTION (trusted only)
   | - toolbar actions -> parent
   +----+-----------------------------------------------+
   v
   DynamicSectionRenderer (sort by order, filter active, resolve block, error boundary)
   v
   DynamicSectionBlock (visibility, container, spacing vars, background, outline, header)
   v
   Block components (Hero, Banner, Category, Product, Video, Reviews, Brand)
3. Data Contract

Define the contract once and derive types from it. Everything downstream relies on it.

typescript
// section-schema.ts
const px = z.union([z.number().min(0).max(400), z.string().regex(/^\d{1,3}(\.\d+)?(px)?$/)]);
const color = z.string().regex(
/^(#[0-9a-f]{3,8}|rgba?\([\d\s.,%]+\)|hsla?\([\d\s.,%]+\))$/i,
);

export const SectionStylesSchema = z.object({
layout: z.enum(["standard", "boxed", "full-width", "cropped", "fluid"]).optional(),
hideOnMobile: z.boolean().optional(),
hideOnDesktop: z.boolean().optional(),
paddingTop: px.optional(), paddingBottom: px.optional(),
paddingLeft: px.optional(), paddingRight: px.optional(),
mobilePaddingTop: px.optional(), mobilePaddingBottom: px.optional(),
mobilePaddingLeft: px.optional(), mobilePaddingRight: px.optional(),
marginTop: px.optional(), marginBottom: px.optional(),
marginLeft: px.optional(), marginRight: px.optional(),
mobileMarginTop: px.optional(), mobileMarginBottom: px.optional(),
mobileMarginLeft: px.optional(), mobileMarginRight: px.optional(),
backgroundColor: color.optional(),
borderRadius: px.optional(),
cardGap: px.optional(),
categoryColumns: z.number().int().min(1).max(6).optional(),
}).strip();

export const HomePageSectionSchema = z.object({
id: z.string().regex(/^[A-Za-z0-9_-]{1,100}$/),
type: z.string().max(50).optional(),
key: z.string().max(50).optional(),
title: z.string().max(200).optional(),
subtitle: z.string().max(400).optional(),
isActive: z.boolean().optional(),
order: z.number().optional(),
styles: SectionStylesSchema.optional(),
config: z.record(z.unknown()).optional(), // each block parses its own config (see Section 13)
});
export type HomePageSection = z.infer<typeof HomePageSectionSchema>;

Typography values (titleFontSize, titleColor, etc.) follow the same rule: numbers clamped (for example font size 10 to 96), colors through the color regex, weights from 100..900 or normal|bold.

typescript
// safe-url.ts
export function safeHref(v: unknown): string | null {
if (typeof v !== "string") return null;
const s = v.trim();
if (s.startsWith("/") && !s.startsWith("//")) return s;
try {
const u = new URL(s);
return u.protocol === "https:" || u.protocol === "http:" ? u.toString() : null;
} catch { return null; }
}

External links use target="\_blank" rel="noopener noreferrer".

4. DynamicSectionRenderer
   4.1 Directives
   Order: sort by order (stable sort) before filtering. The original pipeline promised ordering but never specified it.
   Inactive filtering: drop isActive === false. (Preview only, recommended: render inactive sections dimmed with a "Hidden" badge so the merchant can find and re-enable them.)
   Type normalization: trim, lowercase, strip - and _, then map aliases to a canonical type through one alias table (not scattered case labels).
   Banner vs hero: a banners section renders HeroSliderBlock only when config.displayType === "slider" or config.viewType === "slider". Do not infer from the title containing "hero": a merchant titling a grid "Hero's Choice Sale" would silently become a slider. If legacy data depends on the title rule, migrate the data, or keep a clearly named LEGACY_HERO_TITLE_FALLBACK helper limited to /^hero\b/i.
   Keys: key by section.id. An index fallback is allowed only for static production data that never reorders. In the builder, new unsaved sections get a stable client ID (tmp_<uuid>) from the parent and keep it.
   Error boundary around every block (H10): production renders nothing; preview renders a small red card with the section type and error message.
   Fallback templates: if the merchant has no active sections, render the store's default template sections (define them in one place, validated by the same schema), never an empty page.
   Unknown type: production returns null; development and preview log/show "Unknown section type: X".
   4.2 Resolution
   tsx
   const ALIASES: Record<string, string> = {
   banner: "banners", category: "categories", product: "products",
   video: "videos", customerreview: "reviews", customerreviews: "reviews",
   testimonials: "reviews", brand: "brands",
   };

export const normalizeType = (s?: string) => {
const t = (s ?? "").trim().toLowerCase().replace(/[-_]/g, "");
return ALIASES[t] ?? t;
};

const isHeroBanner = (s: HomePageSection) =>
s.config?.displayType === "slider" || s.config?.viewType === "slider";

function resolveSectionBlock(s: HomePageSection, ctx: BlockContext): React.ReactNode {
switch (normalizeType(s.type || s.key)) {
case "heroslider": return <HeroSliderBlock section={s} currency={ctx.currency} />;
case "banners": return isHeroBanner(s)
? <HeroSliderBlock section={s} currency={ctx.currency} />
: <BannerGridBlock section={s} />;
case "categories": return <CategoryGridBlock section={s} />;
case "products": return <ProductShowcaseBlock section={s} currency={ctx.currency} fallbackProducts={ctx.fallbackProducts} />;
case "videos": return <VideoReelsBlock section={s} />;
case "reviews": return <CustomerReviewsBlock section={s} />;
case "brands": return <BrandShowcaseBlock section={s} />;
default: return null;
}
}
tsx
const visible = useMemo(
() => [...sections]
.sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
.filter((s) => s.isActive !== false),
[sections],
); 5. DynamicSectionBlock
5.1 Visibility
hideOnMobile && hideOnDesktop: return null in production. In preview render a dimmed placeholder with a "Hidden on all devices" badge so it stays selectable.
hideOnMobile: use max-sm:hidden. hidden sm:block forces display:block on desktop and breaks sections that use flex or grid.
hideOnDesktop: sm:hidden.
"Desktop" in this engine means viewport >= sm (640px), so tablets get desktop spacing and visibility. Keep this consistent across the spacing engine and hide logic.
A section hidden by CSS is still in the DOM. Keep images below the fold lazy, and carousels must not run timers while display:none.
5.2 Structure: outer section vs inner container

The outer <section> owns margin, padding, background, border radius and visibility. The inner container owns the max-width and horizontal gutter (Section 7). This keeps backgrounds full-bleed while content stays aligned.

tsx

<section
  id={`section-${section.id}`}
  data-section-id={section.id}
  aria-labelledby={hasTitle ? `section-title-${section.id}` : undefined}
  style={{ ...buildSectionStyleVariables(section.styles), backgroundColor: safeColor(section.styles?.backgroundColor) }}
  className={cn(SECTION_SPACING_CLASSES, visibilityClass, isPreview && previewOutlineClasses(isSelected))}
>
  <div className={containerClass(section)}>
    <DynamicSectionHeader section={section} />
    {children}
  </div>
</section>
5.3 IDs

Render data-section-id always and a prefixed DOM id. The prefix avoids collisions with page IDs like root. Look sections up with [data-section-id] only, escaped with CSS.escape, never getElementById(arbitraryString).

5.4 Preview outline (H11)

A border adds pixels and shifts the layout on hover. Use an outline that takes no space:

typescript
const previewOutlineClasses = (selected: boolean) =>
cn(
"outline outline-2 -outline-offset-2 outline-dashed", // inset so overflow-hidden containers do not clip it
selected ? "outline-sky-500" : "outline-transparent hover:outline-sky-400",
); 6. DynamicSectionHeader
Hero exemption: hero sliders hide the header unless config.showTitle === true.
Resolution: title = section.title ?? config.title; subtitle = section.subtitle ?? config.subtitle. Treat empty or whitespace-only strings as missing. Render no header (and no empty heading) when both are missing.
Semantics: render the title as <h2 id="section-title-{id}">. The page has exactly one <h1>; blocks never render another one.
Alignment:
left: text-left items-start justify-between
center: text-center items-center justify-center mx-auto
right: text-right items-end justify-end
Typography bindings: titleFontSize (number to px, or validated string), titleFontWeight, titleColor, titleLineHeight, subtitleFontSize, subtitleColor. Every value passes through the whitelist helpers (H6) and falls back to the theme default when invalid.
"View All" CTA: the URL goes through safeHref(); drop the link when it returns null. 7. Container Layouts

section.styles.layout selects the inner container class.

Mode Classes Intended use
standard / boxed max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 Products, Categories, Reviews, Brands
full-width w-full px-0 Hero, edge-to-edge banners, full-bleed video
cropped / fluid max-w-[1920px] mx-auto px-4 sm:px-8 overflow-hidden Ultra-wide banners, cinematic reels

Default layout resolution (the original rule "omitted means boxed" contradicted "hero uses full-width"):

Use styles.layout if present and valid.
Otherwise use the type default: heroslider and slider banners default to full-width; everything else defaults to boxed.
Unknown layout string falls back to the type default.

Notes: overflow-hidden clips focus rings, shadows and dropdowns, so use cropped only for media-style sections. The container gutter and merchant padding add together; that is intended, so do not also add fixed padding classes.

8. Responsive 4-Way Spacing Engine

Merchants set margin and padding in px for desktop and mobile. Values become CSS variables on the section root and are consumed by breakpoint classes. No JS measures the viewport (H12).

8.1 parsePx (must be defined exactly like this)

An explicit 0 is a real value. Only undefined, null, empty and invalid inputs use the fallback.

typescript
const MAX_SPACING = 400;

export function parsePx(v: unknown, fallback: number): number {
if (v === undefined || v === null || v === "") return fallback;
const n = typeof v === "number" ? v : parseFloat(String(v));
if (!Number.isFinite(n)) return fallback;
return Math.min(Math.max(n, 0), MAX_SPACING);
}

export function parsePxOrUndef(v: unknown): number | undefined {
const n = parsePx(v, NaN);
return Number.isNaN(n) ? undefined : n;
}
8.2 Variable builder

When a mobile value is not specified, the desktop value is clamped for small screens. The caps are named constants, not magic numbers:

typescript
const MOBILE_CAP = { padY: 24, padX: 16, marY: 16, marX: 8 } as const;

type Side = "Top" | "Bottom" | "Left" | "Right";
const SIDES: [Side, string, boolean][] = [
["Top", "t", true], ["Bottom", "b", true], ["Left", "l", false], ["Right", "r", false],
];

export function buildSectionStyleVariables(styles?: SectionStyles): React.CSSProperties {
if (!styles) return {};
const s = styles as Record<string, unknown>;
const out: Record<string, string> = {};

for (const [side, k, vertical] of SIDES) {
const padD = parsePx(s[`padding${side}`], 0);
const marD = parsePx(s[`margin${side}`], 0);
out[`--p${k}-desktop`] = `${padD}px`;
out[`--m${k}-desktop`] = `${marD}px`;
out[`--p${k}-mobile`] = `${parsePx(s[`mobilePadding${side}`], Math.min(padD, vertical ? MOBILE_CAP.padY : MOBILE_CAP.padX))}px`;
    out[`--m${k}-mobile`] = `${parsePx(s[`mobileMargin${side}`], Math.min(marD, vertical ? MOBILE_CAP.marY : MOBILE_CAP.marX))}px`;
}
return out as React.CSSProperties;
}

Output variables: --pt|pb|pl|pr-mobile|desktop and --mt|mb|ml|mr-mobile|desktop (16 total, same names as before).

8.3 Classes (literal, with fallbacks)

The classes must have var() fallbacks, because buildSectionStyleVariables returns {} when styles is missing and an unresolved variable would make the declaration invalid.

typescript
export const SECTION_SPACING_CLASSES =
"pt-[var(--pt-mobile,0px)] pb-[var(--pb-mobile,0px)] pl-[var(--pl-mobile,0px)] pr-[var(--pr-mobile,0px)] " +
"mt-[var(--mt-mobile,0px)] mb-[var(--mb-mobile,0px)] ml-[var(--ml-mobile,0px)] mr-[var(--mr-mobile,0px)] " +
"sm:pt-[var(--pt-desktop,0px)] sm:pb-[var(--pb-desktop,0px)] sm:pl-[var(--pl-desktop,0px)] sm:pr-[var(--pr-desktop,0px)] " +
"sm:mt-[var(--mt-desktop,0px)] sm:mb-[var(--mb-desktop,0px)] sm:ml-[var(--ml-desktop,0px)] sm:mr-[var(--mr-desktop,0px)]";

Anti-pattern: static py-12 or my-8 on dynamic sections. Always use the variable classes above.

9. Card Customization Bindings
   Section Config Fallback CSS binding
   Product Showcase cardWidth 280px w-[var(--card-width,280px)]
   Product Showcase cardGap 16px gap-[var(--card-gap,1rem)]
   Product Showcase cardRadius 1rem rounded-[var(--card-radius,1rem)]
   Category Grid cardWidth 160px w-[var(--cat-width,160px)]
   Category Grid columns / styles.categoryColumns 6 desktop, 2 mobile grid helper below
   Video Reels thumbnailShape portrait aspect-[9/16] or aspect-square

Precedence: when both exist, config._ wins over styles._. Where variables are set: on the block root via buildCardVariables(section), only when a valid value exists (so the CSS fallback applies otherwise). Values are numbers converted to px after parsePx (H6).

typescript
export function buildCardVariables(s: HomePageSection): React.CSSProperties {
const c = s.config ?? {}, st = s.styles ?? {};
const out: Record<string, string> = {};
const set = (name: string, v: number | undefined) => { if (v !== undefined) out[name] = `${v}px`; };
set("--card-width", parsePxOrUndef(c.cardWidth));
set("--cat-width", parsePxOrUndef(c.cardWidth));
set("--card-gap", parsePxOrUndef(c.cardGap ?? st.cardGap));
set("--card-radius", parsePxOrUndef(c.cardRadius ?? st.borderRadius));
return out as React.CSSProperties;
}
9.1 Grid helper

The original helper defaulted to 4 columns while the table said 6, silently remapped invalid values, and jumped straight to up to 6 columns at 640px (too narrow). The helper below clamps instead, takes the fallback as an argument, and adds a tablet step. All class strings are literal (H13).

typescript
const BASE = { 1: "grid-cols-1", 2: "grid-cols-2", 3: "grid-cols-3" } as const;
const SM = { 1: "sm:grid-cols-1", 2: "sm:grid-cols-2", 3: "sm:grid-cols-3" } as const;
const LG = { 1: "lg:grid-cols-1", 2: "lg:grid-cols-2", 3: "lg:grid-cols-3",
4: "lg:grid-cols-4", 5: "lg:grid-cols-5", 6: "lg:grid-cols-6" } as const;

const clampInt = (v: unknown, min: number, max: number, fb: number) => {
const n = Math.round(Number(v));
return Number.isFinite(n) ? Math.min(Math.max(n, min), max) : fb;
};

export function getGridClasses(
desktop: unknown, mobile: unknown, fallback = { desktop: 4, mobile: 2 },
): string {
const d = clampInt(desktop, 1, 6, fallback.desktop) as 1 | 2 | 3 | 4 | 5 | 6;
const m = clampInt(mobile, 1, 3, fallback.mobile) as 1 | 2 | 3;
return `${BASE[m]} ${SM[Math.min(d, 3) as 1 | 2 | 3]} ${LG[d]}`;
}
// Category Grid: getGridClasses(cfg.columns ?? styles.categoryColumns, cfg.mobileColumns, { desktop: 6, mobile: 2 }) 10. Preview Protocol (postMessage)
10.1 Canonical messages

Every message has the envelope { source: "selldesk", version: 1, type, ... }. Pick one shape per message and normalize any legacy shapes in a single function (the old code accepted payload as an array or {sections}, and sectionId at the top level or in payload).

Direction type Fields Effect
Child to parent SELLDESK_PREVIEW_READY none Iframe listener is registered
Parent to child SELLDESK_PREVIEW_SYNC seq: number, payload: HomePageSection[] Replace local sections
Parent to child SELECT_SECTION sectionId Scroll to and outline the section
Child to parent SELECT_SECTION sectionId User clicked a section in the preview
Child to parent DUPLICATE_SECTION, MOVE_SECTION_UP, MOVE_SECTION_DOWN, REMOVE_SECTION sectionId Request a change (the parent decides)
10.2 Rules
Single source of truth is the parent. Toolbar actions only send a request. The iframe never mutates its own section list optimistically; it re-renders when the next SYNC arrives.
Ordering: each SYNC carries an increasing seq. Ignore a message whose seq is not greater than the last applied one.
Handshake reliability: the parent may not be listening yet when the child first sends READY. The child retries READY (for example every 500ms, up to 10 times) until it receives its first trusted SYNC.
Click handling in preview: a capture-phase listener calls preventDefault() on links and buttons inside sections (so the iframe never navigates away), and a click on a section sends SELECT_SECTION. Autoplay in sliders and video is paused in preview.
Server headers: storefront responses set Content-Security-Policy: frame-ancestors 'self' <builder origins> (use 'none' outside builder routes). Frames from other origins must not be able to embed the storefront.
Allowlist source: NEXT_PUBLIC_BUILDER_ORIGINS (comma-separated exact origins, no wildcards).
10.3 Secure implementation
typescript
// useLivePreviewSync.ts
const ALLOWED = (process.env.NEXT_PUBLIC_BUILDER_ORIGINS ?? "").split(",").map((s) => s.trim()).filter(Boolean);

const SyncMsg = z.object({
source: z.literal("selldesk"),
type: z.literal("SELLDESK*PREVIEW_SYNC"),
seq: z.number().int().nonnegative(),
payload: z.array(HomePageSectionSchema).max(60),
});
const SelectMsg = z.object({
source: z.literal("selldesk"),
type: z.literal("SELECT_SECTION"),
sectionId: z.string().regex(/^[A-Za-z0-9*-]{1,100}$/),
});

export function useLivePreviewSync(initial: HomePageSection[]) {
const [sections, setSections] = useState(initial);
const [selectedId, setSelectedId] = useState<string | null>(null);
const [active, setActive] = useState(false);
const parentOrigin = useRef<string | null>(null);
const lastSeq = useRef(-1);

// H7: preview only when ?preview=true AND framed. Decide after mount (H14).
useEffect(() => {
const flagged = new URLSearchParams(location.search).get("preview") === "true";
setActive(flagged && window.self !== window.top && ALLOWED.length > 0);
}, []);

useEffect(() => {
if (!active) return;

    const onMessage = (event: MessageEvent) => {
      // H1: authenticate the sender before looking at the data
      if (event.source !== window.parent || !ALLOWED.includes(event.origin)) return;
      parentOrigin.current = event.origin;

      const sync = SyncMsg.safeParse(event.data);
      if (sync.success) {
        if (sync.data.seq <= lastSeq.current) return; // stale or duplicate
        lastSeq.current = sync.data.seq;
        startTransition(() => setSections(sync.data.payload));
        return;
      }
      const sel = SelectMsg.safeParse(event.data);
      if (sel.success) {
        setSelectedId(sel.data.sectionId);
        document
          .querySelector<HTMLElement>(`[data-section-id="${CSS.escape(sel.data.sectionId)}"]`)
          ?.scrollIntoView({ behavior: "smooth", block: "center" });
      }
      // anything else: ignore silently
    };

    window.addEventListener("message", onMessage);

    // H2: READY goes to each allowed origin explicitly; only the matching parent receives it
    let tries = 0;
    const ready = setInterval(() => {
      if (lastSeq.current >= 0 || ++tries > 10) return clearInterval(ready);
      ALLOWED.forEach((o) =>
        window.parent.postMessage({ source: "selldesk", version: 1, type: "SELLDESK_PREVIEW_READY" }, o),
      );
    }, 500);

    return () => { window.removeEventListener("message", onMessage); clearInterval(ready); };

}, [active]);

const sendAction = useCallback((type: ActionType, sectionId: string) => {
if (!parentOrigin.current) return;
window.parent.postMessage({ source: "selldesk", version: 1, type, sectionId }, parentOrigin.current);
}, []);

return { sections, selectedId, isPreview: active, sendAction };
}

Because useSearchParams requires a Suspense boundary in the App Router, reading location.search inside the effect (as above) avoids both the boundary and a server/client mismatch.

11. Production Performance and Accessibility
    LCP: only the first hero image on the page gets priority/fetchPriority="high". Every other image is lazy. Always set sizes for next/image.
    No layout shift: every media slot has a fixed aspect ratio or explicit dimensions; carousels reserve their height before hydration; skeletons match final dimensions.
    Below-the-fold blocks (reviews, brands, videos) may use next/dynamic or lazy hydration. Hero stays server-rendered.
    Video: use preload="none" and a poster, or a click-to-load facade for embeds. Embeds are limited to the host allowlist (H5) and sandboxed.
    Carousels: respect prefers-reduced-motion, pause on hover/focus, expose aria-roledescription="carousel", labelled slides, and keyboard-operable controls. Never autoplay without a pause control.
    Sections: use <section aria-labelledby>; images need meaningful alt or alt="" when decorative.
12. Adding a New Block Type (recipe)
    Create <Name>Block.tsx that accepts { section } and parses its own config with a block-specific zod schema (with safe defaults).
    Add the canonical type and its aliases to ALIASES and the switch in Section 4.2.
    Add a default layout for the type in the Section 7 type-default table.
    Use only literal Tailwind classes and the spacing/card variables (H13, Section 8 and 9).
    Add the type to the builder-side type list (admin) and to the default fallback template if appropriate.
    Verify it with an invalid config, an empty config, and a hidden-on-mobile config.
13. Anti-Patterns
    Do not Do instead
    Listen for message and trust event.data Check event.source and event.origin, then schema-validate
    postMessage(msg, "\*") Explicit allowlisted origin
    Show "Secure Origin Validation" comments with no check Implement the check (Section 10.3)
    border-2 border-dashed for preview hover outline with negative offset
    hidden sm:block for hide-on-mobile max-sm:hidden
    Title containing "hero" decides block type Explicit config.displayType
    Key by array index Key by stable section.id
    document.getElementById(idFromMessage) or raw selector string [data-section-id] with CSS.escape
    className={\grid-cols-${n}`}` Literal class maps
    parsePx(0) treated as missing Only undefined/null/""/NaN use the fallback
    Raw merchant color/size into style Whitelist regex and clamp
    dangerouslySetInnerHTML for titles or reviews React text nodes
    href={config.url} directly safeHref(config.url)
    if (window.innerWidth < 640) to pick layout CSS breakpoints
    Fetch draft sections inside the iframe Receive drafts via trusted SYNC only
    One block crashing the whole homepage Per-section error boundary
14. Definition of Done
    Message handler checks event.source === window.parent and an exact-origin allowlist; outgoing messages never use "\*".
    Section data (API and postMessage) passes the zod schema; URLs, colors and numbers are whitelisted/clamped.
    No dangerouslySetInnerHTML for merchant content; external links have rel="noopener noreferrer".
    Preview code is dynamically loaded and active only for ?preview=true inside an allowed iframe; shopper bundle has no toolbar code.
    Sections are sorted by order, filtered by isActive, keyed by stable id, each wrapped in an error boundary.
    Banner type uses explicit config, not the title.
    Spacing uses variable classes with var() fallbacks; explicit 0 is honored; mobile defaults clamp desktop values.
    Hide-on-mobile uses max-sm:hidden; both-hidden returns null in production and a placeholder in preview.
    Container layout resolves through the type-default rule; background is on the outer section, width on the inner container.
    Preview hover/selection uses outline (no layout shift); links are inert and autoplay paused in preview.
    Tailwind classes are all literal; grid helper clamps and has a tablet step.
    First hero image has priority; media has reserved dimensions; carousels honor reduced motion.
    Manual tests: hidden/inactive section, reorder in builder, duplicate section (new ID), invalid color/URL in config, unknown block type, message from a foreign origin (must be ignored), page loaded with ?preview=true outside an iframe (must behave as normal shopper mode), slow 3G first load (no layout jump).

---
name: storefront-architecture-standards
description: Production architectural standards, clean layer decoupling, feature-first folder structure, multi-tenant resolution workflow, and service abstraction for SellDesk storefront. Use whenever adding or refactoring storefront routes, services, middleware, utilities, or components.
---

# 🏛️ Storefront Architecture Standards Skill

The **Storefront Architecture Standards** govern the structural hierarchy, multi-tenant routing, service abstraction, and layer decoupling across the `selldesk-storefront` application.

Following Next.js 16 App Router principles, the architecture enforces a strict unidirectional dependency graph:
`Routes (app/) -> Presentation Components (components/) -> Custom Hooks (hooks/) -> Service Layer (services/) -> Network / Cache (api-client)`.

---

## 1. Directory Structure & Layer Conventions

The codebase is organized into cleanly partitioned layers to eliminate circular dependencies, dead code, and cross-layer pollution.

```
selldesk-storefront/
├── src/
│   ├── app/                               # Next.js 16 App Router (RSC-first routes & layouts)
│   │   ├── api/revalidate/                # On-demand ISR tag revalidation webhook
│   │   ├── store/[storeSlug]/             # Dynamic multi-tenant storefront route segment
│   │   │   ├── cart/page.tsx              # Standalone Cart page
│   │   │   ├── checkout/page.tsx          # Single-page Checkout workflow
│   │   │   ├── orders/[orderNumber]/      # Order Confirmation & Status tracking
│   │   │   ├── products/                  # Catalog listing & search filtering
│   │   │   ├── products/[slug]/           # Product Detail Page (PDP)
│   │   │   ├── layout.tsx                 # Tenant Root Layout (CSS variables & header/footer)
│   │   │   ├── loading.tsx                # Instant skeleton loader for route transitions
│   │   │   └── page.tsx                   # Tenant Homepage (Server Component)
│   │   ├── globals.css                    # Tailwind CSS v4 setup & base design tokens
│   │   ├── layout.tsx                     # Root HTML document wrapper
│   │   └── not-found.tsx                  # 404 fallback page
│   │
│   ├── components/                        # Presentation Layer (Decomposed, typed UI)
│   │   ├── catalog/                       # Product cards, filter sidebars, grid controls
│   │   ├── checkout/                      # Checkout form, order summary, address inputs
│   │   ├── home/                          # Dynamic section engine (Renderer, Block, Header)
│   │   │   ├── hooks/                     # Home-specific interaction hooks
│   │   │   ├── sections/                  # Specific section blocks (Hero, Category, Products, etc.)
│   │   │   └── utils/                     # Grid calculation, spacing, product normalizers
│   │   ├── layout/                        # StoreHeader, StoreFooter, CartDrawer
│   │   └── product/                       # Product gallery, AddToCart CTA, variant pickers
│   │
│   ├── services/                          # Infrastructure & Data Access Layer
│   │   ├── api-client.ts                  # Server fetch (ISR) & Axios client factory
│   │   └── storefront.service.ts          # Unified StorefrontService facade
│   │
│   ├── store/                             # Client-side State Stores (Zustand)
│   │   └── use-cart-store.ts              # Partitioned, persistent tenant shopping cart
│   │
│   ├── hooks/                             # Shared React Custom Hooks
│   │   ├── use-cart.ts                    # Cart convenience hook with store scoping
│   │   └── use-live-preview-sync.ts       # Iframe postMessage synchronization bridge
│   │
│   ├── types/                             # Pure TypeScript Type Definitions & Schemas
│   │   ├── cart.ts                        # CartItem, CartState
│   │   ├── order.ts                       # CheckoutDto, CheckoutResponse, OrderDetail
│   │   ├── product.ts                     # Product, ProductVariant, Category
│   │   ├── section.ts                     # HomePageSection, SectionStyles, Slide/Video models
│   │   ├── store.ts                       # StoreConfig, StorefrontBootstrap
│   │   └── index.ts                       # Barrel export for all types
│   │
│   ├── constants/                         # Mock fallbacks and system defaults
│   │   └── mock-storefront.constants.ts   # Development fallback payloads
│   │
│   ├── lib/                               # Pure Utilities
│   │   ├── tenant.ts                      # Header tenant extraction helpers
│   │   └── utils.ts                       # cn() class merger, formatCurrency()
│   │
│   └── middleware.ts                      # Multi-tenant domain & subdomain resolution
```

---

## 2. Layer Decoupling & Barrel Export Standards

### 2.1 Unidirectional Dependency Rules
- **Rule 1 (Presentation never calls HTTP directly):** Presentation components (`src/components/`) must never invoke native `fetch` or Axios directly. They must delegate all server actions and client mutations to `StorefrontService`.
- **Rule 2 (RSC handles initial data fetching):** Server Components under `src/app/store/[storeSlug]/` fetch data on the server via `StorefrontService`, passing initial models to client components as typed props.
- **Rule 3 (Types are pure and side-effect free):** Files under `src/types/` must contain only TypeScript interfaces, type aliases, and enums. Never import React components, hooks, or libraries inside `src/types/`.

### 2.2 Controlled Barrel Exports
To maintain fast compilation in Next.js 16 and prevent circular bundle cycles:
- All types are exported from `src/types/index.ts`.
- Component subdirectories (e.g. `src/components/home/sections/index.ts`) export only the public interfaces of their blocks.
- Internal helper utilities remain private to their subfolder unless explicitly exported.

---

## 3. Multi-Tenant Store Resolution Workflow

SellDesk storefront routes serve multi-tenant merchants through a unified Next.js 16 App Router codebase. The resolution engine is implemented in `src/middleware.ts`.

### 3.1 Tenant Resolution Flowchart

```
  Incoming HTTP Request
           │
           ▼
  Is pathname starting with '/store/'?
    ├── YES ──► Extract pathSlug
    │           Rewrite internally to /store/[storeSlug]/[remainingPath]
    │           Inject headers: x-store-slug, x-tenant-host
    │           Return response
    └── NO
           │
           ▼
  Is host ending with '.[baseDomain]' or '.localhost'?
    ├── YES ──► Extract subdomain candidate
    │           Is candidate in RESERVED_SUBDOMAINS? (e.g. 'www', 'api', 'admin')
    │             ├── YES ──► Reject / Fallback to /not-found
    │             └── NO  ──► Set storeSlug = subdomain
    │                         Rewrite to /store/[storeSlug]/[pathname]
    └── NO
           │
           ▼
  Is host a verified custom domain? (CNAME / custom apex)
    ├── YES ──► Set storeSlug = host
    │           Rewrite to /store/[storeSlug]/[pathname]
    └── NO
           │
           ▼
  Fallback ──► Rewrite to /not-found
```

### 3.2 Request Header Enrichment
Every rewritten request from `middleware.ts` is stamped with identifying headers:
- `x-store-slug`: The normalized store identifier (e.g. `gadget-store`).
- `x-tenant-host`: The original client host header (e.g. `gadget-store.selldesk.test:3001` or `shop.gadget.com`).
- `x-store-id`: Populated if the identifier matches a standard UUID regex.

### 3.3 Server Component Tenant Resolution Helper (`src/lib/tenant.ts`)
In Next.js 16 Server Components, extract the active store slug asynchronously:

```typescript
import { headers } from "next/headers";

export async function getStoreSlugFromHeaders(): Promise<string> {
  const headersList = await headers();
  const slug = headersList.get("x-store-slug");
  if (!slug) {
    throw new Error("Missing x-store-slug header in request context");
  }
  return slug;
}
```

---

## 4. Service Abstraction & Data Fetching Patterns

Data operations are split strictly between **Server-Side Fetch (RSC/ISR)** and **Client-Side Mutations**.

### 4.1 Server-Side Data Fetching (`serverFetch`)
`serverFetch` uses Next.js native `fetch` augmented with Incremental Static Regeneration (ISR) and cache tags.

```typescript
// services/api-client.ts
export async function serverFetch<T>(
  endpoint: string,
  storeSlug: string,
  options: {
    revalidate?: number | false;
    tags?: string[];
  } = {},
): Promise<T> {
  const cleanEndpoint = endpoint.startsWith("/") ? endpoint : `/${endpoint}`;
  const url = `${API_BASE_URL}${cleanEndpoint}`;

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    "x-store-slug": storeSlug.trim(),
  };

  const res = await fetch(url, {
    headers,
    next: {
      revalidate: options.revalidate !== undefined ? options.revalidate : 60,
      tags: options.tags || [`tenant:${storeSlug}`],
    },
  });

  if (!res.ok) {
    throw new Error(`[Fetch Error ${res.status}] Failed request to ${endpoint}`);
  }

  const json = await res.json();
  return (json.data ?? json) as T;
}
```

#### Revalidation Tag Strategy:
| Resource | Revalidate Frequency | Cache Tags |
| :--- | :--- | :--- |
| **Storefront Bootstrap** | 1 hour (`3600s`) | `store:${storeSlug}:bootstrap` |
| **Product Catalog** | 2 minutes (`120s`) | `store:${storeSlug}:products` |
| **Product Detail** | 5 minutes (`300s`) | `store:${storeSlug}:product:${slug}` |
| **Category List** | 30 minutes (`1800s`)| `store:${storeSlug}:categories` |

### 4.2 On-Demand Cache Revalidation Webhook
When a merchant modifies products or homepage sections in `selldesk-store-admin`, the backend dispatches an HTTP POST to `/api/revalidate`:

```typescript
// app/api/revalidate/route.ts
import { revalidateTag } from "next/cache";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const secret = req.headers.get("x-revalidate-secret");
  if (secret !== process.env.REVALIDATE_SECRET) {
    return NextResponse.json({ message: "Invalid secret" }, { status: 401 });
  }

  const { tag, storeSlug } = await req.json();
  if (tag) {
    revalidateTag(tag);
    return NextResponse.json({ revalidated: true, tag });
  }
  if (storeSlug) {
    revalidateTag(`store:${storeSlug}:bootstrap`);
    revalidateTag(`store:${storeSlug}:products`);
    return NextResponse.json({ revalidated: true, storeSlug });
  }

  return NextResponse.json({ message: "Missing tag or storeSlug" }, { status: 400 });
}
```

### 4.3 Client-Side Axios Client (`createApiClient`)
For interactive customer actions (applying coupons, submitting checkout orders), use the Axios client factory:

```typescript
// services/api-client.ts
export function createApiClient(storeSlug?: string): AxiosInstance {
  const client = axios.create({
    baseURL: API_BASE_URL,
    timeout: 15000,
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      ...(storeSlug ? { "x-store-slug": storeSlug.trim() } : {}),
    },
  });

  client.interceptors.response.use(
    (response) => response.data,
    (error) => {
      const message =
        error.response?.data?.message ||
        error.message ||
        "An unexpected error occurred.";
      return Promise.reject(new Error(message));
    },
  );

  return client;
}
```

---

## 5. Architectural Anti-Patterns

> [!CAUTION]
> 1. **No Client-Side Fetch to Internal APIs:** Never call `fetch('/api/v1/...')` directly from React UI components. Always use `StorefrontService`.
> 2. **No Secret Leaks:** Never prefix internal API keys, database URLs, or webhook secrets with `NEXT_PUBLIC_`.
> 3. **No Direct DOM Mutation:** Never manipulate section DOM nodes with `document.querySelector` or `el.style` inside production presentation components. All dynamic styles must flow through React props and CSS variables.


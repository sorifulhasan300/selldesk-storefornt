# SellDesk Storefront Engine (`selldesk-storefront`)

High-performance, multi-tenant Public Shopping Engine for the **SellDesk SaaS Platform**, decoupled from the Main Landing Page (`selldesk-frontend`) and Merchant Dashboard (`selldesk-store-admin`).

---

## ⚡ Core Architecture

- **Next.js 16 (App Router)** + **React 19**
- **Dynamic Multi-Tenancy**: Edge Middleware rewrites requests dynamically from subdomains (`mystore.selldesk.test`) or path routes (`/store/mystore`) to internal route segments (`/_tenant/[storeSlug]/*`).
- **Performance & SEO First**: Server Components (RSC), Incremental Static Regeneration (ISR), Google JSON-LD Product Schemas, and automatic Edge caching.
- **Tenant-Scoped Cart**: Zustand store with LocalStorage persistence namespaced by store slug to avoid cross-tenant contamination.
- **Isomorphic API Client**: Automatic injection of `x-store-slug` headers pointing to `http://api.selldesk.test:5000/api/v1`.

---

## 📁 Directory Structure

```text
selldesk-storefront/
├── src/
│   ├── middleware.ts                         # Edge Tenant Resolution & Route Rewriter
│   ├── app/
│   │   ├── layout.tsx                        # Global root shell
│   │   ├── globals.css                       # Tailwind CSS v4 styling
│   │   ├── not-found.tsx                     # Global fallback 404
│   │   ├── api/revalidate/route.ts           # On-demand ISR revalidation webhook
│   │   └── _tenant/[storeSlug]/
│   │       ├── layout.tsx                    # Store Layout (Theme, Header, Footer, Cart)
│   │       ├── page.tsx                      # Home (Banners, Categories, Trending)
│   │       ├── loading.tsx                   # Streaming RSC skeleton
│   │       ├── products/
│   │       │   ├── page.tsx                  # PLP: Catalog, Filters, Search & Pagination
│   │       │   └── [slug]/page.tsx           # PDP: Gallery, Variant Picker, Add to Cart
│   │       ├── cart/page.tsx                 # Full Shopping Bag & Line Item Management
│   │       ├── checkout/page.tsx             # Multi-step Checkout Form & Order Placement
│   │       └── orders/[orderNumber]/page.tsx # Order Confirmation & Tracking
│   ├── components/
│   │   ├── layout/                           # StoreHeader, StoreFooter, CartDrawer
│   │   ├── home/                             # HeroSlider, CategoryGrid
│   │   ├── catalog/                          # ProductCard, FilterSidebar
│   │   ├── product/                          # ProductGallery, AddToCartCTA
│   │   └── checkout/                         # CheckoutForm (with live delivery fees)
│   ├── hooks/
│   │   └── use-cart.ts                       # Hydration-safe cart hook
│   ├── services/
│   │   ├── api-client.ts                     # Axios & serverFetch with tenant headers
│   │   └── storefront.service.ts             # Storefront queries & order mutations
│   ├── store/
│   │   └── use-cart-store.ts                 # Zustand cart store with tenant isolation
│   └── types/                                # Fully typed TypeScript models
```

---

## 🚀 Getting Started

### 1. Local DNS Resolution (`/etc/hosts`)

Add your test subdomains to `/etc/hosts`:

```bash
sudo nano /etc/hosts
```

```text
127.0.0.1  selldesk.test
127.0.0.1  mystore.selldesk.test
127.0.0.1  demo.selldesk.test
127.0.0.1  api.selldesk.test
```

### 2. Environment Variables

Verify `.env.local`:

```env
NEXT_PUBLIC_API_URL=http://api.selldesk.test:5000/api/v1
INTERNAL_API_URL=http://localhost:5000/api/v1
NEXT_PUBLIC_BASE_DOMAIN=selldesk.test:3001
REVALIDATION_SECRET=selldesk_secure_isr_secret_2026
```

### 3. Development Server

```bash
pnpm dev
# Runs on http://selldesk.test:3001
```

### 4. Testing Multi-Tenant Resolution

- **Subdomain Routing**: Open `http://mystore.selldesk.test:3001` or `http://demo.selldesk.test:3001`
- **Path Routing**: Open `http://selldesk.test:3001/store/mystore` or `http://selldesk.test:3001/store/mystore/products`
- **Product Details (PDP)**: Open `http://mystore.selldesk.test:3001/products/minimalist-chrono-watch`
- **Checkout Flow**: Open `http://mystore.selldesk.test:3001/checkout`

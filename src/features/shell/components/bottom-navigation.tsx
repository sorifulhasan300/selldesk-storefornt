"use client";

import Link from "next/link";
import {
  Home,
  Grid,
  Grid2X2,
  LayoutGrid,
  ShoppingBag,
  ShoppingCart,
  User,
  Heart,
  Search,
  Tag,
  Package,
  Star,
  type LucideProps,
} from "lucide-react";
import { useCart } from "@/features/cart";
import { cn } from "@/shared/lib/utils";
import type {
  StorefrontBottomNavConfig,
  StorefrontBottomNavItemConfig,
  BottomNavIconName,
} from "@/shared/types";

// ---------------------------------------------------------------------------
// Icon registry — safe map from config iconName to Lucide component.
// Adding a new icon: extend BottomNavIconName in shared/types/store.ts, then
// add the same key here.  Never spread unknown strings into JSX.
// ---------------------------------------------------------------------------

type IconComponent = React.ComponentType<LucideProps>;

const ICON_MAP: Record<BottomNavIconName, IconComponent> = {
  home: Home,
  grid: Grid,
  "grid-2x2": Grid2X2,
  "layout-grid": LayoutGrid,
  "shopping-bag": ShoppingBag,
  "shopping-cart": ShoppingCart,
  user: User,
  heart: Heart,
  search: Search,
  tag: Tag,
  package: Package,
  star: Star,
};

// ---------------------------------------------------------------------------
// Default items — rendered when config.bottomNav is absent.
// ---------------------------------------------------------------------------

const DEFAULT_ITEMS: StorefrontBottomNavItemConfig[] = [
  { label: "Home", iconName: "home", href: "/" },
  { label: "Catalog", iconName: "layout-grid", href: "/products" },
  { label: "Cart", iconName: "shopping-bag", openCart: true },
  { label: "Account", iconName: "user", href: "/" },
];

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

interface NavItemProps {
  item: StorefrontBottomNavItemConfig;
  storeSlug: string;
}

function BottomNavItem({ item, storeSlug }: NavItemProps) {
  const itemCount = useCart(storeSlug).itemCount;
  const toggleDrawer = useCart(storeSlug).toggleDrawer;

  const Icon = ICON_MAP[item.iconName] ?? Home;
  const isCart = item.openCart === true;

  const inner = (
    <span className="flex flex-col items-center gap-0.5 w-full">
      <span className="relative">
        <Icon className="w-6 h-6" aria-hidden="true" />
        {isCart && itemCount > 0 && (
          <span className="absolute -top-1.5 -right-1.5 bg-[var(--store-primary)] text-white text-[10px] font-bold min-w-[18px] h-[18px] rounded-full flex items-center justify-center px-0.5 ring-2 ring-white">
            {itemCount > 99 ? "99+" : itemCount}
          </span>
        )}
      </span>
      <span className="text-[10px] font-medium leading-none truncate max-w-[56px]">
        {item.label}
      </span>
    </span>
  );

  const baseClass = cn(
    "flex-1 flex items-center justify-center py-2 text-slate-500",
    "hover:text-[var(--store-primary)] transition-colors",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--store-primary)] rounded-sm",
  );

  if (isCart) {
    return (
      <button
        type="button"
        onClick={() => toggleDrawer(true)}
        className={baseClass}
        aria-label="Open cart"
      >
        {inner}
      </button>
    );
  }

  return (
    <Link href={item.href ?? "/"} className={baseClass}>
      {inner}
    </Link>
  );
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

export interface BottomNavigationProps {
  config?: StorefrontBottomNavConfig;
  storeSlug: string;
}

/**
 * Fixed bottom navigation bar visible on mobile (hidden on lg+).
 *
 * Reads items from `config.bottomNav` with a safe fallback to DEFAULT_ITEMS.
 * Cart item opens the cart drawer via `useCartStore(s => s.toggleDrawer)`.
 * Theme colours bind through `var(--store-primary)` — no hardcoded Tailwind
 * colour classes.
 */
export function BottomNavigation({ config, storeSlug }: BottomNavigationProps) {
  const items =
    config?.items && config.items.length > 0 ? config.items : DEFAULT_ITEMS;

  return (
    <nav
      aria-label="Mobile navigation"
      className="lg:hidden fixed bottom-0 inset-x-0 z-50 bg-white border-t border-slate-200 safe-area-inset-bottom"
    >
      <div className="flex items-stretch h-16">
        {items.map((item, idx) => (
          <BottomNavItem
            key={`${item.iconName}-${idx}`}
            item={item}
            storeSlug={storeSlug}
          />
        ))}
      </div>
    </nav>
  );
}


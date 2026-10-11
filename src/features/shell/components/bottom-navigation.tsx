"use client";

import { useRouter } from "next/navigation";
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
import { Badge } from "@/shared/ui/badge";
import { Button } from "@/shared/ui/button";
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
  const { itemCount, toggleDrawer } = useCart(storeSlug);
  const router = useRouter();

  const Icon = ICON_MAP[item.iconName] ?? Home;
  const isCart = item.openCart === true;

  const inner = (
    <span className="flex flex-col items-center gap-0.5 w-full">
      <span className="relative">
        <Icon className="w-6 h-6" aria-hidden="true" />
        {isCart && itemCount > 0 && (
          <Badge className="absolute -top-1.5 -right-1.5 h-[18px] min-w-[18px] justify-center p-0 text-[10px] font-bold ring-2 ring-white">
            {itemCount > 99 ? "99+" : itemCount}
          </Badge>
        )}
      </span>
      <span className="text-[10px] font-medium leading-none truncate max-w-[56px]">
        {item.label}
      </span>
    </span>
  );

  return (
    <Button
      variant="ghost"
      className={cn(
        "h-auto min-w-0 flex-1 shrink rounded-none py-2 text-slate-500",
        "hover:text-[var(--store-primary)]",
      )}
      onClick={() =>
        isCart ? toggleDrawer(true) : router.push(item.href ?? "/")
      }
      aria-label={isCart ? "Open cart" : item.label}
    >
      {inner}
    </Button>
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

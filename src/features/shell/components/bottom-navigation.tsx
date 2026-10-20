"use client";

import { usePathname, useRouter } from "next/navigation";
import { useCart } from "@/features/cart";
import type {
  StorefrontBottomNavConfig,
  StorefrontBottomNavItemConfig,
} from "@/shared/types";
import {
  DEFAULT_BOTTOM_NAV_ITEMS,
  resolveBottomNavItems,
} from "./bottom-navigation-config";
import { BottomNavigationItem } from "./bottom-navigation-item";

export interface BottomNavigationProps {
  config?: StorefrontBottomNavConfig;
  storeSlug: string;
  wishlist?: { active: boolean };
}

function isActiveItem(pathname: string, item: StorefrontBottomNavItemConfig) {
  if (item.openCart) return pathname.endsWith("/cart");
  const href = item.href ?? "/";
  if (href === "/") return pathname === "/" || /^\/store\/[^/]+\/?$/.test(pathname);
  return pathname.endsWith(href);
}

function getDisplayItems(
  configuredItems: StorefrontBottomNavItemConfig[],
  isNotchLayout: boolean,
  isWishlistDisabled: boolean,
): StorefrontBottomNavItemConfig[] {
  const fallbackList = isWishlistDisabled
    ? DEFAULT_BOTTOM_NAV_ITEMS.filter(
        (candidate) =>
          candidate.href !== "/wishlist" &&
          candidate.iconName !== "heart" &&
          candidate.label?.toLowerCase() !== "wishlist",
      )
    : DEFAULT_BOTTOM_NAV_ITEMS;

  const items = [...configuredItems];
  while (items.length < 5) {
    const fallbackItem =
      fallbackList.find(
        (candidate) =>
          !items.some((item) => item.label === candidate.label),
      ) ?? fallbackList[items.length % fallbackList.length];
    items.push(fallbackItem);
  }

  if (isNotchLayout) items[2] = fallbackList[2] ?? items[2];
  return items.slice(0, 5);
}

export function BottomNavigation({
  config,
  storeSlug,
  wishlist,
}: BottomNavigationProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { itemCount, toggleDrawer } = useCart(storeSlug);

  if (config?.active === false) return null;

  const isWishlistDisabled = wishlist?.active === false;
  const isNotchLayout = config?.layout === 2;
  const items = getDisplayItems(
    resolveBottomNavItems(config, wishlist),
    isNotchLayout,
    isWishlistDisabled,
  );
  const backgroundColor = config?.bgColor ?? "var(--store-bg, #ffffff)";
  const iconColor = config?.iconColor ?? "#8a94a6";
  const activeColor = config?.activeColor ?? "var(--store-primary)";
  const showLabels = config?.showLabels ?? true;

  return (
    <nav
      aria-label="Mobile navigation"
      className="fixed inset-x-0 bottom-0 z-50 border-t border-slate-200 safe-area-inset-bottom lg:hidden"
      style={{ backgroundColor }}
    >
      <div className="mx-auto grid h-16 max-w-lg grid-cols-5 items-stretch px-1">
        {items.map((item, index) => {
          const isRaisedHome = isNotchLayout && index === 2;
          const isActive = isRaisedHome || isActiveItem(pathname, item);

          return (
            <BottomNavigationItem
              key={`${item.label}-${index}`}
              item={item}
              itemCount={itemCount}
              isActive={isActive}
              isRaisedHome={isRaisedHome}
              showLabels={showLabels}
              iconColor={iconColor}
              activeColor={activeColor}
              backgroundColor={backgroundColor}
              onSelect={() => {
                if (item.openCart) {
                  toggleDrawer(true);
                  return;
                }
                router.push(item.href ?? "/");
              }}
            />
          );
        })}
      </div>
    </nav>
  );
}

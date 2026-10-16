import type {
  BottomNavIconName,
  BottomNavItemKey,
  LegacyStorefrontBottomNavItemConfig,
  StorefrontBottomNavConfig,
  StorefrontBottomNavItemConfig,
} from "@/shared/types";

const MENU_ITEM_CONFIG: Record<
  BottomNavItemKey,
  StorefrontBottomNavItemConfig
> = {
  category: {
    label: "Categories",
    iconName: "grid-2x2",
    href: "/products",
  },
  search: {
    label: "Search",
    iconName: "search",
    href: "/products",
  },
  home: { label: "Home", iconName: "home", href: "/" },
  cart: { label: "Cart", iconName: "shopping-bag", openCart: true },
  track: {
    label: "Track Order",
    iconName: "package",
    href: "/track-order",
  },
  wishlist: { label: "Wishlist", iconName: "heart", href: "/wishlist" },
  account: { label: "Account", iconName: "user", href: "/account" },
};

const VALID_ICONS: readonly BottomNavIconName[] = [
  "home",
  "grid",
  "grid-2x2",
  "layout-grid",
  "shopping-bag",
  "shopping-cart",
  "user",
  "heart",
  "search",
  "tag",
  "package",
  "star",
];

export const DEFAULT_BOTTOM_NAV_ITEMS: StorefrontBottomNavItemConfig[] = [
  MENU_ITEM_CONFIG.category,
  MENU_ITEM_CONFIG.search,
  MENU_ITEM_CONFIG.home,
  MENU_ITEM_CONFIG.cart,
  MENU_ITEM_CONFIG.track,
];

function isBottomNavItemKey(value: string): value is BottomNavItemKey {
  return Object.prototype.hasOwnProperty.call(MENU_ITEM_CONFIG, value);
}

function isBottomNavIconName(value: string): value is BottomNavIconName {
  return VALID_ICONS.some((icon) => icon === value);
}

function normalizeLegacyItem(
  item: LegacyStorefrontBottomNavItemConfig,
): StorefrontBottomNavItemConfig {
  const legacy = item;
  const legacyLabel = legacy.label?.trim();
  const legacyIcon = legacy.iconName ?? legacy.icon;
  const iconName = legacyIcon && isBottomNavIconName(legacyIcon)
    ? legacyIcon
    : "home";

  return {
    label: legacyLabel || "Home",
    iconName,
    href: legacy.href ?? legacy.path ?? "/",
    openCart: legacy.openCart,
  };
}

export function resolveBottomNavItems(
  config?: StorefrontBottomNavConfig,
): StorefrontBottomNavItemConfig[] {
  const configuredItems = config?.items;
  if (!configuredItems?.length) return DEFAULT_BOTTOM_NAV_ITEMS;

  return configuredItems.map((item) => {
    if (typeof item === "string") {
      return isBottomNavItemKey(item) ? MENU_ITEM_CONFIG[item] : MENU_ITEM_CONFIG.home;
    }
    return normalizeLegacyItem(item);
  });
}

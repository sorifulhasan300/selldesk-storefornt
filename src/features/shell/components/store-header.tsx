"use client";

import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import type {
  HeaderActionItem,
  StoreConfig,
  StorefrontHeaderConfig,
  StorefrontNavbarConfig,
} from "@/shared/types";
import { useCart } from "@/features/cart";
import {
  Heart,
  AppWindow,
  ChevronDown,
  Grid2X2,
  Menu,
  Phone,
  Search,
  ShoppingBag,
  Truck,
  UserRound,
  X,
} from "lucide-react";
import { useMemo, useState } from "react";
import { Badge } from "@/shared/ui/badge";
import { Button } from "@/shared/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetTitle,
} from "@/shared/ui/sheet";

interface NavLink {
  title: string;
  url: string;
  order?: number;
}

interface StoreHeaderConfig {
  navbar?: StorefrontNavbarConfig;
  header?: StorefrontHeaderConfig;
}

export interface StoreHeaderProps {
  store: StoreConfig;
  config?: StoreHeaderConfig;
  header?: StorefrontHeaderConfig;
  navbar?: StorefrontNavbarConfig;
  categories?: Array<{ id: string; name: string; slug: string }>;
  contactPhone?: string;
}

const DEFAULT_ACTIONS: HeaderActionItem[] = [
  {
    type: "cart",
    showOnDesktop: true,
    showOnMobile: true,
    label: "Cart",
    order: 1,
  },
  {
    type: "wishlist",
    showOnDesktop: true,
    showOnMobile: false,
    label: "Wishlist",
    order: 2,
  },
  {
    type: "account",
    showOnDesktop: true,
    showOnMobile: true,
    label: "Account",
    order: 3,
  },
  {
    type: "track",
    showOnDesktop: true,
    showOnMobile: false,
    label: "Track Order",
    order: 4,
  },
  {
    type: "hotline",
    showOnDesktop: true,
    showOnMobile: false,
    label: "Hotline",
    order: 5,
  },
];

function sortNavLinks(links: NavLink[]): NavLink[] {
  return [...links].sort((a, b) => (a.order ?? Infinity) - (b.order ?? Infinity));
}

function getLogoUrl(
  logo: StorefrontHeaderConfig["logo"],
  fallback: string | null | undefined,
  size: "large" | "medium",
): string | null {
  if (typeof logo === "string") return logo;
  return (
    logo?.thumbs?.[size] ??
    logo?.thumbs?.large ??
    logo?.thumbs?.medium ??
    logo?.thumbs?.url ??
    fallback ??
    null
  );
}

function LogoSlot({
  store,
  config,
}: {
  store: StoreConfig;
  config?: StorefrontHeaderConfig;
}) {
  const desktopLogo = getLogoUrl(config?.logo, store.logoUrl, "large");
  const mobileLogo = getLogoUrl(config?.logo, store.logoUrl, "medium");

  if (desktopLogo || mobileLogo) {
    return (
      <div className="relative h-10 w-10 overflow-hidden rounded-xl border border-slate-200">
        {desktopLogo && (
          <Image
            src={desktopLogo}
            alt={store.name}
            fill
            sizes="(max-width: 639px) 0px, 40px"
            className="hidden object-contain sm:block"
          />
        )}
        {mobileLogo && (
          <Image
            src={mobileLogo}
            alt={store.name}
            fill
            sizes="40px"
            className="object-contain sm:hidden"
          />
        )}
      </div>
    );
  }

  return (
    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-(--store-primary) text-lg font-black text-white shadow-xs">
      {store.name.charAt(0).toUpperCase()}
    </div>
  );
}

type NavbarStyle = NonNullable<StorefrontNavbarConfig["style"]>;
type NavbarMenuItem = NonNullable<
  StorefrontNavbarConfig["menuItems"]
>[number];

const NAV_LINK_STYLE: Record<NavbarStyle, string> = {
  default: "",
  pill: "rounded-full px-3 py-1.5 hover:bg-black/5",
  underline: "border-b-2 border-transparent px-1 py-2 hover:border-current",
  bordered: "rounded-md border border-current/20 px-3 py-1.5 hover:border-current",
};

function DesktopNav({
  links,
  style = "default",
  className = "",
}: {
  links: NavLink[];
  style?: NavbarStyle;
  className?: string;
}) {
  if (links.length === 0) return null;

  return (
    <nav
      className={`hidden items-center gap-5 text-sm font-medium text-inherit lg:flex ${className}`}
    >
      {links.map((link) => (
        <Link
          key={`${link.url}-${link.title}`}
          href={link.url}
          className={`transition-colors hover:text-(--store-primary) ${NAV_LINK_STYLE[style]}`}
        >
          {link.title}
        </Link>
      ))}
    </nav>
  );
}

function MenuItemLink({
  item,
  style,
  fontSize,
  depth = 0,
}: {
  item: NavbarMenuItem;
  style: NavbarStyle;
  fontSize: number;
  depth?: number;
}) {
  const label = item.label?.trim();
  if (!label) return null;

  const children = item.children ?? [];
  const url = item.link?.trim() || "#";

  if (children.length === 0) {
    return (
      <Link
        href={url}
        className={`block whitespace-nowrap transition-colors hover:text-(--store-primary) ${NAV_LINK_STYLE[style]}`}
        style={{ fontSize }}
      >
        {label}
      </Link>
    );
  }

  return (
    <div className={`group relative ${depth > 0 ? "w-full" : ""}`}>
      <div className="flex items-center gap-1">
        <Link
          href={url}
          className={`whitespace-nowrap transition-colors hover:text-(--store-primary) ${NAV_LINK_STYLE[style]}`}
          style={{ fontSize }}
        >
          {label}
        </Link>
        <button
          type="button"
          aria-label={`Show ${label} sub-items`}
          className="rounded p-1 transition-colors hover:bg-muted"
        >
          <ChevronDown size={14} aria-hidden="true" />
        </button>
      </div>
      <div
        className={`invisible absolute z-50 min-w-48 rounded-md border border-border bg-popover p-2 text-popover-foreground opacity-0 shadow-lg transition group-hover:visible group-hover:opacity-100 group-focus-within:visible group-focus-within:opacity-100 ${
          depth > 0 ? "left-full top-0 ml-1" : "left-0 top-full pt-2"
        }`}
      >
        <div className="space-y-1">
          {children.map((child, index) => (
            <MenuItemLink
              key={`${child.link}-${child.label}-${index}`}
              item={child}
              style={style}
              fontSize={fontSize}
              depth={depth + 1}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

function ConfiguredDesktopNavbar({
  navbar,
  categories,
}: {
  navbar: StorefrontNavbarConfig;
  categories?: Array<{ id: string; name: string; slug: string }>;
}) {
  const items = navbar.menuItems ?? [];
  const layout = navbar.layout ?? 1;
  const megaCategory = navbar.megaCategory;
  const showCategoryButton =
    megaCategory?.active !== false && (categories?.length ?? 0) > 0;
  const categoryIcon =
    megaCategory?.icon === "GridOutlined"
      ? Grid2X2
      : megaCategory?.icon === "MenuOutlined"
        ? Menu
        : AppWindow;
  const CategoryIcon = categoryIcon;

  return (
    <nav
      aria-label="Store navigation"
      className="hidden border-t border-current/10 lg:block"
      style={{
        minHeight: `${navbar.height ?? 60}px`,
        backgroundColor: navbar.bgColor || undefined,
        color: navbar.textColor || undefined,
        fontSize: `${navbar.fontSize ?? 13}px`,
      }}
    >
      <div
        className={`mx-auto flex min-h-[inherit] max-w-7xl items-center gap-5 px-4 sm:px-6 lg:px-8 ${
          layout === 2
            ? "justify-between"
            : layout === 3
              ? "justify-center"
              : "justify-start"
        }`}
      >
        {showCategoryButton && (
          <div className="group relative shrink-0">
            <button
              type="button"
              className="flex items-center gap-2 rounded-md px-3 py-2 font-medium transition-colors hover:bg-black/5"
              aria-label={megaCategory?.label ?? "Categories"}
            >
              <CategoryIcon size={16} aria-hidden="true" />
              <span>{megaCategory?.label || "Categories"}</span>
              <ChevronDown size={14} aria-hidden="true" />
            </button>
            <div className="invisible absolute left-0 top-full z-50 min-w-56 rounded-md border border-border bg-popover p-2 text-popover-foreground opacity-0 shadow-lg transition group-hover:visible group-hover:opacity-100 group-focus-within:visible group-focus-within:opacity-100">
              <div className="space-y-1">
                {categories?.map((category) => (
                  <Link
                    key={category.id}
                    href={`/products?categoryId=${category.id}`}
                    className="block rounded px-3 py-2 text-sm transition-colors hover:bg-muted"
                  >
                    {category.name}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        )}
        <div
          className={`flex flex-wrap items-center gap-5 ${
            layout === 2
              ? "flex-1 justify-end"
              : layout === 3
                ? "justify-center"
                : ""
          }`}
        >
          {items.map((item, index) => (
            <MenuItemLink
              key={`${item.link}-${item.label}-${index}`}
              item={item}
              style={navbar.style ?? "default"}
              fontSize={navbar.fontSize ?? 13}
            />
          ))}
        </div>
      </div>
    </nav>
  );
}

function MobileDrawer({
  links,
  onClose,
  menuItems,
  fontSize,
  style = "default",
}: {
  links: NavLink[];
  onClose: () => void;
  style?: NavbarStyle;
  menuItems?: NavbarMenuItem[];
  fontSize?: number;
}) {
  const renderMenuItems = (items: NavbarMenuItem[], depth = 0) =>
    items.map((item, index) => {
      const label = item.label?.trim();
      if (!label) return null;
      return (
        <div
          key={`${item.link}-${label}-${index}`}
          className={depth > 0 ? "ml-4 border-l border-border pl-3" : ""}
        >
          <Link
            href={item.link?.trim() || "#"}
            onClick={onClose}
            className={`block w-fit text-base font-semibold text-inherit hover:text-(--store-primary) ${NAV_LINK_STYLE[style]}`}
            style={{ fontSize }}
          >
            {label}
          </Link>
          {item.children && item.children.length > 0 && (
            <div className="mt-2 space-y-3">
              {renderMenuItems(item.children, depth + 1)}
            </div>
          )}
        </div>
      );
    });

  return (
    <SheetContent side="left" className="gap-6">
      <SheetTitle className="sr-only">Store navigation</SheetTitle>
      <SheetDescription className="sr-only">
        Browse store pages.
      </SheetDescription>
      <nav aria-label="Store navigation" className="space-y-4 pt-8">
        {menuItems
          ? renderMenuItems(menuItems)
          : links.map((link) => (
          <Link
            key={`${link.url}-${link.title}`}
            href={link.url}
            onClick={onClose}
            className={`block w-fit text-base font-semibold text-inherit hover:text-(--store-primary) ${NAV_LINK_STYLE[style]}`}
          >
            {link.title}
          </Link>
            ))}
      </nav>
    </SheetContent>
  );
}

function actionVisibility(action: HeaderActionItem): string {
  if (action.showOnDesktop === false && action.showOnMobile === false) {
    return "hidden";
  }
  if (action.showOnDesktop === false) return "inline-flex lg:hidden";
  if (action.showOnMobile === false) return "hidden lg:inline-flex";
  return "inline-flex";
}

function ActionLink({
  href,
  label,
  Icon,
  iconSize,
  fontSize,
  actionStyle,
  className,
}: {
  href: string;
  label: string;
  Icon: typeof Phone;
  iconSize: number;
  fontSize: number;
  actionStyle: number | string;
  className: string;
}) {
  return (
    <Link
      href={href}
      aria-label={label}
      title={label}
      className={`items-center justify-center gap-2 rounded-md px-2 py-1.5 text-inherit hover:bg-black/5 ${className}`}
    >
      <Icon size={iconSize} aria-hidden="true" />
      {Number(actionStyle) !== 1 && (
        <span className="text-xs font-medium" style={{ fontSize }}>
          {label}
        </span>
      )}
    </Link>
  );
}

export function StoreHeader({
  store,
  config,
  header,
  navbar,
  categories,
  contactPhone,
}: StoreHeaderProps) {
  const { itemCount, toggleDrawer } = useCart(store.subDomain);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const router = useRouter();

  const resolvedHeader = header ?? config?.header;
  const resolvedNavbar = navbar ?? config?.navbar;
  const defaultLinks = useMemo(() => {
    const list: NavLink[] = [
      { title: "Home", url: "/" },
      { title: "Catalog", url: "/products" },
    ];
    categories?.slice(0, 4).forEach((category) => {
      list.push({
        title: category.name,
        url: `/products?categoryId=${category.id}`,
      });
    });
    return list;
  }, [categories]);

  const rawLinks = resolvedNavbar?.links;
  const hasConfiguredMenuItems = Array.isArray(resolvedNavbar?.menuItems);
  const isConfiguredNavbar = hasConfiguredMenuItems;
  const sortedNavLinks = useMemo(
    () => {
      if (hasConfiguredMenuItems) {
        return (resolvedNavbar?.menuItems ?? [])
          .filter((item) => Boolean(item.label?.trim()))
          .map((item, index) => ({
            title: item.label?.trim() ?? "",
            url: item.link?.trim() || "#",
            order: index + 1,
          }));
      }
      return rawLinks && rawLinks.length > 0
        ? sortNavLinks(rawLinks)
        : defaultLinks;
    },
    [hasConfiguredMenuItems, resolvedNavbar?.menuItems, rawLinks, defaultLinks],
  );

  const actions = [
    ...(resolvedHeader?.actions?.length
      ? resolvedHeader.actions
      : DEFAULT_ACTIONS),
  ].sort((left, right) => (left.order ?? Infinity) - (right.order ?? Infinity));
  const iconSize = resolvedHeader?.actionIconSize ?? 18;
  const actionFontSize = resolvedHeader?.actionFontSize ?? 12;
  const actionStyle = resolvedHeader?.actionStyle ?? 3;
  const searchStyle = Number(resolvedHeader?.searchStyle ?? 2);
  const layoutByName: Record<string, number> = {
    standard: 1,
    centered: 2,
    action: 3,
    split: 4,
    minimal: 5,
  };
  const rawLayout = resolvedHeader?.layout ?? 3;
  const candidateLayout =
    typeof rawLayout === "string"
      ? layoutByName[rawLayout] ?? Number(rawLayout)
      : rawLayout;
  const layout = [1, 2, 3, 4, 5].includes(candidateLayout)
    ? candidateLayout
    : 3;
  const isCentered = layout === 2;
  const isSplit = layout === 4;
  const isMinimal = layout === 5;
  const navbarStyle = resolvedNavbar?.style ?? "default";
  const navbarActive = resolvedNavbar?.active !== false;
  const phoneHref = contactPhone?.replace(/[^\d+]/g, "");
  const headerStyle = {
    backgroundColor: resolvedHeader?.bgColor ?? "#ffffff",
    color: resolvedHeader?.textColor ?? "#0b0b0b",
    minHeight: `${resolvedHeader?.height ?? 81}px`,
  };

  const renderActions = () => (
    <div
      className={`flex items-center gap-1 sm:gap-2 ${
        isCentered ? "absolute right-4 sm:right-6 lg:right-8" : ""
      }`}
    >
      {resolvedHeader?.searchEnabled !== false && (
        <Button
          variant="ghost"
          size={searchStyle === 1 ? "icon" : "default"}
          onClick={() => router.push("/products")}
          aria-label="Search Products"
          title="Search Products"
          className={`text-inherit ${
            searchStyle === 3 ? "rounded-full border border-current/20" : ""
          }`}
        >
          <Search size={iconSize} />
          {searchStyle !== 1 && (
            <span
              className="text-xs font-medium"
              style={{ fontSize: actionFontSize }}
            >
              Search
            </span>
          )}
        </Button>
      )}

      {actions.map((action, index) => {
        const visibility = actionVisibility(action);
        const label = action.label ?? action.type;
        const iconClassName = visibility;

        if (action.type === "cart") {
          if (resolvedHeader?.cartEnabled === false) return null;
          return (
            <Button
              key={`${action.type}-${index}`}
              variant="ghost"
              size="default"
              onClick={() => toggleDrawer(true)}
              className={`relative px-2 text-inherit ${visibility}`}
              aria-label={label}
              title={label}
            >
              <ShoppingBag size={iconSize} />
              {itemCount > 0 && (
                <Badge className="absolute -right-1 -top-1 size-5 justify-center border border-white/30 p-0 text-[11px] shadow-sm ring-2 ring-white">
                  {itemCount}
                </Badge>
              )}
              {Number(actionStyle) !== 1 && (
                <span
                  className="text-xs font-medium"
                  style={{ fontSize: actionFontSize }}
                >
                  {label}
                </span>
              )}
            </Button>
          );
        }

        const actionLinks: Record<
          string,
          { href: string; Icon: typeof Phone }
        > = {
          wishlist: { href: "/wishlist", Icon: Heart },
          account: { href: "/account", Icon: UserRound },
          track: { href: "/track-order", Icon: Truck },
        };
        const actionLink = actionLinks[action.type];
        if (actionLink) {
          if (
            action.type === "wishlist" &&
            resolvedHeader?.wishListEnabled === false
          ) {
            return null;
          }
          return (
            <ActionLink
              key={`${action.type}-${index}`}
              href={actionLink.href}
              label={label}
              Icon={actionLink.Icon}
              iconSize={iconSize}
              fontSize={actionFontSize}
              actionStyle={actionStyle}
              className={iconClassName}
            />
          );
        }

        if (action.type === "hotline" && phoneHref) {
          return (
            <ActionLink
              key={`${action.type}-${index}`}
              href={`tel:${phoneHref}`}
              label={label}
              Icon={Phone}
              iconSize={iconSize}
              fontSize={actionFontSize}
              actionStyle={actionStyle}
              className={iconClassName}
            />
          );
        }

        return null;
      })}
    </div>
  );

  const menuButton =
    (!isConfiguredNavbar || navbarActive) && sortedNavLinks.length > 0 && (
    <Button
      variant="ghost"
      size="icon"
      onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
      className={`text-inherit lg:hidden ${
        isCentered ? "absolute left-4 sm:left-6 lg:left-8" : ""
      }`}
      aria-label="Toggle Navigation"
    >
      {mobileMenuOpen ? (
        <X className="h-6 w-6" />
      ) : (
        <Menu className="h-6 w-6" />
      )}
    </Button>
  );

  const logo = (
    <Link
      href="/"
      className={`flex items-center gap-3 ${isCentered ? "justify-center" : ""}`}
    >
      <LogoSlot store={store} config={resolvedHeader} />
      <span className="hidden text-lg font-bold tracking-tight text-inherit sm:inline">
        {store.name}
      </span>
    </Link>
  );

  return (
    <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
      <header
        className={`${resolvedHeader?.stickyHeader === false ? "relative" : "sticky"} top-0 z-40 border-b border-slate-200/80 backdrop-blur-md`}
        style={headerStyle}
      >
        <div
          className={`mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 ${
            isCentered || isSplit
              ? "flex min-h-[inherit] flex-col justify-center gap-2 py-2"
              : "flex min-h-[inherit] items-center justify-between gap-4"
          }`}
        >
          <div
            className={`relative flex min-h-13 items-center gap-4 ${
              isCentered ? "justify-center" : "justify-between"
            }`}
          >
            {menuButton}
            {logo}
            {!isConfiguredNavbar && layout === 1 && (
              <DesktopNav
                links={sortedNavLinks}
                style={navbarStyle}
                className="flex-1 justify-center"
              />
            )}
            {!isConfiguredNavbar && layout === 3 && (
              <DesktopNav links={sortedNavLinks} style={navbarStyle} />
            )}
            {!isMinimal && renderActions()}
          </div>

          {!isConfiguredNavbar && (isCentered || isSplit) && (
            <DesktopNav
              links={sortedNavLinks}
              style={navbarStyle}
              className="justify-center"
            />
          )}

          {isMinimal && (
            <div className="absolute right-4 top-1/2 -translate-y-1/2 sm:right-6 lg:right-8">
              {renderActions()}
            </div>
          )}
        </div>

        {sortedNavLinks.length > 0 && (!isConfiguredNavbar || navbarActive) && (
          <MobileDrawer
            links={sortedNavLinks}
            menuItems={
              isConfiguredNavbar ? resolvedNavbar?.menuItems : undefined
            }
            fontSize={
              isConfiguredNavbar ? resolvedNavbar?.fontSize ?? 13 : undefined
            }
            onClose={() => setMobileMenuOpen(false)}
            style={navbarStyle}
          />
        )}
      </header>
      {navbarActive && isConfiguredNavbar && (
        <ConfiguredDesktopNavbar navbar={resolvedNavbar} categories={categories} />
      )}
    </Sheet>
  );
}

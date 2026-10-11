"use client";

import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import type {
  StoreConfig,
  StorefrontHeaderConfig,
  StorefrontNavbarConfig,
} from "@/shared/types";
import { useCart } from "@/features/cart";
import { ShoppingBag, Search, Menu, X } from "lucide-react";
import { useState, useMemo } from "react";
import { Badge } from "@/shared/ui/badge";
import { Button } from "@/shared/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetTitle,
} from "@/shared/ui/sheet";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface NavLink {
  title: string;
  url: string;
  order?: number;
}

interface HeaderConfig {
  logo?: string | null;
  searchEnabled?: boolean;
  cartEnabled?: boolean;
}

interface NavbarConfig {
  links?: NavLink[];
}

interface StoreHeaderConfig {
  navbar?: NavbarConfig | StorefrontNavbarConfig;
  header?: HeaderConfig | StorefrontHeaderConfig;
}

export interface StoreHeaderProps {
  store: StoreConfig;
  config?: StoreHeaderConfig;
  header?: StorefrontHeaderConfig;
  navbar?: StorefrontNavbarConfig;
  categories?: Array<{ id: string; name: string; slug: string }>;
}


// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Sort nav links by `order` (ascending), falling back to insertion order. */
function sortNavLinks(links: NavLink[]): NavLink[] {
  return [...links].sort((a, b) => (a.order ?? Infinity) - (b.order ?? Infinity));
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function LogoSlot({
  store,
  config,
}: {
  store: StoreConfig;
  config?: HeaderConfig | StorefrontHeaderConfig;
}) {
  const logoSrc = config?.logo ?? store.logoUrl ?? null;

  if (logoSrc) {
    return (
      <div className="relative w-10 h-10 rounded-xl overflow-hidden border border-slate-200">
        <Image src={logoSrc} alt={store.name} fill className="object-cover" />
      </div>
    );
  }

  return (
    <div className="w-10 h-10 rounded-xl bg-[var(--store-primary)] text-white font-black text-lg flex items-center justify-center shadow-xs">
      {store.name.charAt(0).toUpperCase()}
    </div>
  );
}

interface DesktopNavProps {
  links: NavLink[];
}

function DesktopNav({ links }: DesktopNavProps) {
  if (links.length === 0) return null;

  return (
    <nav className="hidden lg:flex items-center gap-8 text-sm font-medium text-slate-600">
      {links.map((link) => (
        <Link
          key={`${link.url}-${link.title}`}
          href={link.url}
          className="hover:text-[var(--store-primary)] transition-colors"
        >
          {link.title}
        </Link>
      ))}
    </nav>
  );
}

interface MobileDrawerProps {
  links: NavLink[];
  onClose: () => void;
}

function MobileDrawer({ links, onClose }: MobileDrawerProps) {
  return (
    <SheetContent side="left" className="gap-6">
      <SheetTitle className="sr-only">Store navigation</SheetTitle>
      <SheetDescription className="sr-only">
        Browse store pages.
      </SheetDescription>
      <nav aria-label="Store navigation" className="space-y-4 pt-8">
        {links.map((link) => (
          <Link
            key={`${link.url}-${link.title}`}
            href={link.url}
            onClick={onClose}
            className="block text-base font-semibold text-slate-800 hover:text-[var(--store-primary)]"
          >
            {link.title}
          </Link>
        ))}
      </nav>
    </SheetContent>
  );
}

interface ActionIconsProps {
  searchEnabled: boolean;
  cartEnabled: boolean;
  itemCount: number;
  onCartClick: () => void;
  onSearchClick: () => void;
}

function ActionIcons({
  searchEnabled,
  cartEnabled,
  itemCount,
  onCartClick,
  onSearchClick,
}: ActionIconsProps) {
  return (
    <div className="flex items-center gap-3">
      {searchEnabled && (
        <Button
          variant="ghost"
          size="icon"
          onClick={onSearchClick}
          aria-label="Search Products"
        >
          <Search className="w-5 h-5" />
        </Button>
      )}

      {cartEnabled && (
        <Button
          size="icon"
          onClick={onCartClick}
          className="relative shadow-xs"
          aria-label="View Shopping Cart"
        >
          <ShoppingBag className="w-5 h-5" />
          {itemCount > 0 && (
            <Badge className="absolute -top-1 -right-1 size-5 justify-center border border-white/30 p-0 text-[11px] shadow-sm ring-2 ring-white">
              {itemCount}
            </Badge>
          )}
        </Button>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

export function StoreHeader({
  store,
  config,
  header,
  navbar,
  categories,
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
    if (categories && categories.length > 0) {
      categories.slice(0, 4).forEach((cat) => {
        list.push({ title: cat.name, url: `/products?categoryId=${cat.id}` });
      });
    }
    return list;
  }, [categories]);

  const rawLinks = resolvedNavbar?.links;
  const sortedNavLinks = useMemo(
    () => (rawLinks && rawLinks.length > 0 ? sortNavLinks(rawLinks as NavLink[]) : defaultLinks),
    [rawLinks, defaultLinks],
  );

  const searchEnabled = resolvedHeader?.searchEnabled ?? true;
  const cartEnabled = resolvedHeader?.cartEnabled ?? true;

  return (
    <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
      <>
        <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-slate-200/80">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between gap-4">
            {/* Mobile menu trigger — only show when there are nav links */}
            {sortedNavLinks.length > 0 && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="lg:hidden"
                aria-label="Toggle Navigation"
              >
                {mobileMenuOpen ? (
                  <X className="w-6 h-6" />
                ) : (
                  <Menu className="w-6 h-6" />
                )}
              </Button>
            )}

            {/* Brand Logo / Name */}
            <Link href="/" className="flex items-center gap-3">
              <LogoSlot store={store} config={resolvedHeader} />
              <span className="font-bold text-lg text-slate-900 tracking-tight hidden sm:inline">
                {store.name}
              </span>
            </Link>

            {/* Desktop Navigation */}
            <DesktopNav links={sortedNavLinks} />

            {/* Action icons */}
            <ActionIcons
              searchEnabled={searchEnabled}
              cartEnabled={cartEnabled}
              itemCount={itemCount}
              onCartClick={() => toggleDrawer(true)}
              onSearchClick={() => router.push("/products")}
            />
          </div>

          {/* Mobile Drawer */}
          {sortedNavLinks.length > 0 && (
            <MobileDrawer
              links={sortedNavLinks}
              onClose={() => setMobileMenuOpen(false)}
            />
          )}
        </header>
      </>
    </Sheet>
  );
}

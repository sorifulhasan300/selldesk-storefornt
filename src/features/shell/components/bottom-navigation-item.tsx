"use client";

import {
  Grid,
  Grid2X2,
  Heart,
  Home,
  LayoutGrid,
  Package,
  Search,
  ShoppingBag,
  ShoppingCart,
  Star,
  Tag,
  User,
  type LucideProps,
} from "lucide-react";
import type { ComponentType, CSSProperties } from "react";
import { Badge } from "@/shared/ui/badge";
import { Button } from "@/shared/ui/button";
import { cn } from "@/shared/lib/utils";
import type {
  BottomNavIconName,
  StorefrontBottomNavItemConfig,
} from "@/shared/types";

type IconComponent = ComponentType<LucideProps>;

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

interface BottomNavigationItemProps {
  item: StorefrontBottomNavItemConfig;
  itemCount: number;
  isActive: boolean;
  isRaisedHome: boolean;
  showLabels: boolean;
  iconColor: string;
  activeColor: string;
  backgroundColor: string;
  onSelect: () => void;
}

export function BottomNavigationItem({
  item,
  itemCount,
  isActive,
  isRaisedHome,
  showLabels,
  iconColor,
  activeColor,
  backgroundColor,
  onSelect,
}: BottomNavigationItemProps) {
  const Icon = ICON_MAP[item.iconName] ?? Home;
  const foregroundColor = isActive ? activeColor : iconColor;

  return (
    <Button
      variant="ghost"
      onClick={onSelect}
      aria-label={item.openCart ? "Open cart" : item.label}
      aria-current={isActive ? "page" : undefined}
      className={cn(
        "relative h-full min-w-0 flex-1 shrink flex-col gap-0.5 rounded-none px-1 py-2",
        isRaisedHome && "overflow-visible",
      )}
      style={{ color: foregroundColor }}
    >
      {isRaisedHome ? (
        <span
          className="absolute -top-5 flex size-11 items-center justify-center rounded-full border-4 shadow-md"
          style={{
            backgroundColor: activeColor,
            borderColor: iconColor,
            color: backgroundColor,
          }}
        >
          <Icon className="size-5" aria-hidden="true" />
        </span>
      ) : (
        <span className="relative">
          <Icon className="size-5" aria-hidden="true" />
          {item.openCart && itemCount > 0 && (
            <Badge
              className="absolute -right-2 -top-2 h-[18px] min-w-[18px] justify-center p-0 text-[10px] font-bold ring-2"
              style={{ "--tw-ring-color": backgroundColor } as CSSProperties}
            >
              {itemCount > 99 ? "99+" : itemCount}
            </Badge>
          )}
        </span>
      )}
      {showLabels && (
        <span
          className={cn(
            "max-w-full truncate text-[10px] font-medium leading-none",
            isRaisedHome && "mt-5",
          )}
        >
          {item.label}
        </span>
      )}
    </Button>
  );
}

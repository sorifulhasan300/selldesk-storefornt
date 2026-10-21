"use client";

import React, { createContext, useContext } from "react";
import {
  Home,
  Search,
  ShoppingCart,
  ShoppingBag,
  Heart,
  User,
  UserRound,
} from "lucide-react";

export type StorefrontIconName =
  | "home"
  | "search"
  | "cart"
  | "shopping-bag"
  | "shopping-cart"
  | "wishlist"
  | "heart"
  | "user"
  | "account";

export const IconSetContext = createContext<string>("set1");

export function IconSetProvider({
  iconSet = "set1",
  children,
}: {
  iconSet?: string;
  children: React.ReactNode;
}) {
  return (
    <IconSetContext.Provider value={iconSet}>
      {children}
    </IconSetContext.Provider>
  );
}

export function useStorefrontIconSet(): string {
  return useContext(IconSetContext) || "set1";
}

interface StorefrontIconProps {
  name: StorefrontIconName;
  size?: number;
  className?: string;
  strokeWidth?: number;
  iconSet?: string;
  "aria-hidden"?: boolean | "true" | "false";
}

function normalizeIconName(name: StorefrontIconName): "home" | "search" | "cart" | "wishlist" | "user" {
  if (name === "shopping-bag" || name === "shopping-cart" || name === "cart") return "cart";
  if (name === "heart" || name === "wishlist") return "wishlist";
  if (name === "user" || name === "account") return "user";
  if (name === "search") return "search";
  return "home";
}

export function StorefrontIcon({
  name,
  size = 20,
  className = "",
  strokeWidth,
  iconSet: iconSetProp,
  ...rest
}: StorefrontIconProps) {
  const contextIconSet = useStorefrontIconSet();
  const activeSet = iconSetProp || contextIconSet || "set1";
  const canonical = normalizeIconName(name);

  // Set 2: Bold Outline
  if (activeSet === "set2") {
    const sw = strokeWidth ?? 2.75;
    if (canonical === "home") return <Home size={size} strokeWidth={sw} className={className} {...rest} />;
    if (canonical === "search") return <Search size={size} strokeWidth={sw} className={className} {...rest} />;
    if (canonical === "cart") return <ShoppingBag size={size} strokeWidth={sw} className={className} {...rest} />;
    if (canonical === "wishlist") return <Heart size={size} strokeWidth={sw} className={className} {...rest} />;
    return <User size={size} strokeWidth={sw} className={className} {...rest} />;
  }

  // Set 3: Solid Filled
  if (activeSet === "set3") {
    if (canonical === "home") return <Home size={size} fill="currentColor" strokeWidth={1} className={className} {...rest} />;
    if (canonical === "search") return <Search size={size} strokeWidth={2.5} className={className} {...rest} />;
    if (canonical === "cart") return <ShoppingBag size={size} fill="currentColor" strokeWidth={1} className={className} {...rest} />;
    if (canonical === "wishlist") return <Heart size={size} fill="currentColor" strokeWidth={1} className={className} {...rest} />;
    return <User size={size} fill="currentColor" strokeWidth={1} className={className} {...rest} />;
  }

  // Set 4: Duotone Tinted
  if (activeSet === "set4") {
    const sw = strokeWidth ?? 1.8;
    if (canonical === "home") return <Home size={size} fill="currentColor" fillOpacity={0.2} strokeWidth={sw} className={className} {...rest} />;
    if (canonical === "search") return <Search size={size} strokeWidth={2} className={className} {...rest} />;
    if (canonical === "cart") return <ShoppingBag size={size} fill="currentColor" fillOpacity={0.2} strokeWidth={sw} className={className} {...rest} />;
    if (canonical === "wishlist") return <Heart size={size} fill="currentColor" fillOpacity={0.2} strokeWidth={sw} className={className} {...rest} />;
    return <User size={size} fill="currentColor" fillOpacity={0.2} strokeWidth={sw} className={className} {...rest} />;
  }

  // Set 5: Sharp Square / Geometric
  if (activeSet === "set5") {
    const sw = strokeWidth ?? 2;
    if (canonical === "home") return <Home size={size} strokeWidth={sw} className={`stroke-square ${className}`} {...rest} />;
    if (canonical === "search") return <Search size={size} strokeWidth={sw} className={className} {...rest} />;
    if (canonical === "cart") return <ShoppingCart size={size} strokeWidth={sw} className={className} {...rest} />;
    if (canonical === "wishlist") return <Heart size={size} strokeWidth={sw} className={className} {...rest} />;
    return <User size={size} strokeWidth={sw} className={className} {...rest} />;
  }

  // Set 6: Soft Rounded
  if (activeSet === "set6") {
    const sw = strokeWidth ?? 2.2;
    if (canonical === "home") return <Home size={size} strokeWidth={sw} className={className} {...rest} />;
    if (canonical === "search") return <Search size={size} strokeWidth={sw} className={className} {...rest} />;
    if (canonical === "cart") return <ShoppingBag size={size} strokeWidth={sw} className={className} {...rest} />;
    if (canonical === "wishlist") return <Heart size={size} strokeWidth={sw} className={className} {...rest} />;
    return <UserRound size={size} strokeWidth={sw} className={className} {...rest} />;
  }

  // Set 7: Boutique Hairline
  if (activeSet === "set7") {
    const sw = strokeWidth ?? 1.25;
    if (canonical === "home") return <Home size={size} strokeWidth={sw} className={className} {...rest} />;
    if (canonical === "search") return <Search size={size} strokeWidth={sw} className={className} {...rest} />;
    if (canonical === "cart") return <ShoppingBag size={size} strokeWidth={sw} className={className} {...rest} />;
    if (canonical === "wishlist") return <Heart size={size} strokeWidth={sw} className={className} {...rest} />;
    return <User size={size} strokeWidth={sw} className={className} {...rest} />;
  }

  // Set 8: Classic Market Cart
  if (activeSet === "set8") {
    const sw = strokeWidth ?? 1.75;
    if (canonical === "home") return <Home size={size} strokeWidth={sw} className={className} {...rest} />;
    if (canonical === "search") return <Search size={size} strokeWidth={sw} className={className} {...rest} />;
    if (canonical === "cart") return <ShoppingCart size={size} strokeWidth={sw} className={className} {...rest} />;
    if (canonical === "wishlist") return <Heart size={size} strokeWidth={sw} className={className} {...rest} />;
    return <User size={size} strokeWidth={sw} className={className} {...rest} />;
  }

  // Set 9: Circular Inset Badges
  if (activeSet === "set9") {
    const iconSize = Math.max(12, Math.round(size * 0.7));
    return (
      <span className={`inline-flex items-center justify-center rounded-full border border-current/25 p-1 ${className}`}>
        {canonical === "home" && <Home size={iconSize} strokeWidth={1.75} {...rest} />}
        {canonical === "search" && <Search size={iconSize} strokeWidth={1.75} {...rest} />}
        {canonical === "cart" && <ShoppingBag size={iconSize} strokeWidth={1.75} {...rest} />}
        {canonical === "wishlist" && <Heart size={iconSize} strokeWidth={1.75} {...rest} />}
        {canonical === "user" && <User size={iconSize} strokeWidth={1.75} {...rest} />}
      </span>
    );
  }

  // Set 10: High-Contrast Tech
  if (activeSet === "set10") {
    const sw = strokeWidth ?? 2.4;
    if (canonical === "home") return <Home size={size} strokeWidth={sw} className={className} {...rest} />;
    if (canonical === "search") return <Search size={size} strokeWidth={sw} className={className} {...rest} />;
    if (canonical === "cart") return <ShoppingCart size={size} strokeWidth={sw} className={className} {...rest} />;
    if (canonical === "wishlist") return <Heart size={size} strokeWidth={sw} fill="currentColor" fillOpacity={0.15} className={className} {...rest} />;
    return <UserRound size={size} strokeWidth={sw} className={className} {...rest} />;
  }

  // Set 11: Retail Plus
  if (activeSet === "set11") {
    const sw = strokeWidth ?? 2;
    if (canonical === "home") return <Home size={size} strokeWidth={sw} className={className} {...rest} />;
    if (canonical === "search") return <Search size={size} strokeWidth={sw} className={className} {...rest} />;
    if (canonical === "cart") return <ShoppingBag size={size} strokeWidth={sw} className={className} {...rest} />;
    if (canonical === "wishlist") return <Heart size={size} strokeWidth={sw} fill="currentColor" className={className} {...rest} />;
    return <User size={size} strokeWidth={sw} className={className} {...rest} />;
  }

  // Set 1 / Default: Modern Minimal Line
  const sw = strokeWidth ?? 1.75;
  if (canonical === "home") return <Home size={size} strokeWidth={sw} className={className} {...rest} />;
  if (canonical === "search") return <Search size={size} strokeWidth={sw} className={className} {...rest} />;
  if (canonical === "cart") return <ShoppingBag size={size} strokeWidth={sw} className={className} {...rest} />;
  if (canonical === "wishlist") return <Heart size={size} strokeWidth={sw} className={className} {...rest} />;
  return <User size={size} strokeWidth={sw} className={className} {...rest} />;
}


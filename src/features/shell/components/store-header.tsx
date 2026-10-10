"use client";

import Link from "next/link";
import Image from "next/image";
import { StoreConfig } from "@/shared/types";
import { useCart } from "@/features/cart";
import { ShoppingBag, Search, Menu, X } from "lucide-react";
import { useState } from "react";

interface StoreHeaderProps {
  store: StoreConfig;
  categories?: Array<{ id: string; name: string; slug: string }>;
}

export function StoreHeader({ store, categories = [] }: StoreHeaderProps) {
  const { itemCount, toggleDrawer } = useCart(store.subDomain);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-slate-200/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between gap-4">
        {/* Mobile menu trigger */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="lg:hidden p-2 text-slate-700 hover:text-slate-900"
          aria-label="Toggle Navigation"
        >
          {mobileMenuOpen ? (
            <X className="w-6 h-6" />
          ) : (
            <Menu className="w-6 h-6" />
          )}
        </button>

        {/* Brand Logo / Name */}
        <Link href="/" className="flex items-center gap-3">
          {store.logoUrl ? (
            <div className="relative w-10 h-10 rounded-xl overflow-hidden border border-slate-200">
              <Image
                src={store.logoUrl}
                alt={store.name}
                fill
                className="object-cover"
              />
            </div>
          ) : (
            <div className="w-10 h-10 rounded-xl bg-blue-600 text-white font-black text-lg flex items-center justify-center shadow-xs">
              {store.name.charAt(0).toUpperCase()}
            </div>
          )}
          <span className="font-bold text-lg text-slate-900 tracking-tight hidden sm:inline">
            {store.name}
          </span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden lg:flex items-center gap-8 text-sm font-medium text-slate-600">
          <Link href="/" className="hover:text-blue-600 transition-colors">
            Home
          </Link>
          <Link
            href="/products"
            className="hover:text-blue-600 transition-colors"
          >
            Catalog
          </Link>
          {categories.slice(0, 4).map((cat) => (
            <Link
              key={cat.id}
              href={`/products?categoryId=${cat.id}`}
              className="hover:text-blue-600 transition-colors"
            >
              {cat.name}
            </Link>
          ))}
        </nav>

        {/* Action icons */}
        <div className="flex items-center gap-3">
          <Link
            href="/products"
            className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-colors"
            title="Search Products"
          >
            <Search className="w-5 h-5" />
          </Link>

          <button
            onClick={() => toggleDrawer(true)}
            className="relative p-2.5 bg-slate-900 hover:bg-blue-600 text-white rounded-xl transition-all shadow-xs cursor-pointer"
            aria-label="View Shopping Cart"
          >
            <ShoppingBag className="w-5 h-5" />
            {itemCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-rose-600 text-white text-[11px] font-bold w-5 h-5 rounded-full flex items-center justify-center shadow-sm">
                {itemCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Navigation */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-slate-200 bg-white px-4 py-6 space-y-4">
          <Link
            href="/"
            onClick={() => setMobileMenuOpen(false)}
            className="block text-base font-semibold text-slate-800 hover:text-blue-600"
          >
            Home
          </Link>
          <Link
            href="/products"
            onClick={() => setMobileMenuOpen(false)}
            className="block text-base font-semibold text-slate-800 hover:text-blue-600"
          >
            All Products
          </Link>
          <div className="pt-2 border-t border-slate-100">
            <p className="text-xs uppercase font-bold text-slate-400 mb-2">
              Categories
            </p>
            {categories.map((cat) => (
              <Link
                key={cat.id}
                href={`/products?categoryId=${cat.id}`}
                onClick={() => setMobileMenuOpen(false)}
                className="block py-1.5 text-sm text-slate-600 hover:text-blue-600"
              >
                {cat.name}
              </Link>
            ))}
          </div>
        </div>
      )}
    </header>
  );
}


import Link from "next/link";
import type { StoreConfig, StorefrontFooterConfig } from "@/shared/types";
import { Phone, Mail, MapPin, ShieldCheck, Truck, RefreshCcw } from "lucide-react";

export interface StoreFooterContactConfig {
  phone?: string;
  email?: string;
  address?: string;
}

export interface StoreFooterProps {
  store: StoreConfig;
  footer?: StorefrontFooterConfig;
  config?: {
    footer?: StorefrontFooterConfig;
    contact?: StoreFooterContactConfig;
  };
}

export function StoreFooter({ store, footer, config }: StoreFooterProps) {
  // Effective footer: config.footer takes precedence, falls back to direct footer prop
  const effectiveFooter = config?.footer ?? footer;
  const hasCustomColumns = Boolean(
    effectiveFooter?.columns && effectiveFooter.columns.length > 0,
  );

  // Contact info: config.contact first, then store fields as fallback
  const contactPhone = config?.contact?.phone ?? store.contactPhone;
  const contactEmail = config?.contact?.email ?? store.contactEmail;
  const contactAddress = config?.contact?.address;

  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-white border-t border-slate-200 mt-20">
      {/* Value propositions */}
      <div className="border-b border-slate-100 bg-slate-50/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 grid grid-cols-1 md:grid-cols-3 gap-6 text-center md:text-left">
          <div className="flex items-center justify-center md:justify-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-[var(--store-primary)]/10 text-[var(--store-primary)] flex items-center justify-center shrink-0">
              <Truck className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-800">
                Reliable Delivery
              </h4>
              <p className="text-xs text-slate-500">
                Fast doorstep shipping across zones
              </p>
            </div>
          </div>

          <div className="flex items-center justify-center md:justify-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-800">
                100% Authentic
              </h4>
              <p className="text-xs text-slate-500">
                Verified quality guaranteed
              </p>
            </div>
          </div>

          <div className="flex items-center justify-center md:justify-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
              <RefreshCcw className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-800">Easy Returns</h4>
              <p className="text-xs text-slate-500">
                Hassle-free 7-day replacement
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 grid grid-cols-1 md:grid-cols-4 gap-8">
        <div className="md:col-span-2 space-y-4">
          <h3 className="font-bold text-lg text-slate-900">{store.name}</h3>
          <p className="text-sm text-slate-500 max-w-sm">
            {store.description ||
              "Your one-stop destination for quality products with exceptional customer service."}
          </p>
          <div className="space-y-2 text-sm text-slate-600 pt-2">
            {contactPhone && (
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-slate-400" />
                <span>{contactPhone}</span>
              </div>
            )}
            {contactEmail && (
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-slate-400" />
                <span>{contactEmail}</span>
              </div>
            )}
            {contactAddress && (
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-slate-400" />
                <span>{contactAddress}</span>
              </div>
            )}
          </div>
        </div>

        {hasCustomColumns && effectiveFooter?.columns ? (
          effectiveFooter.columns.map((column, colIdx) => (
            <div key={`${column.title}-${colIdx}`}>
              <h4 className="font-bold text-sm text-slate-800 uppercase tracking-wider mb-4">
                {column.title}
              </h4>
              <ul className="space-y-2.5 text-sm text-slate-500">
                {column.links.map((link, linkIdx) => (
                  <li key={`${link.url}-${linkIdx}`}>
                    <Link
                      href={link.url}
                      className="hover:text-[var(--store-primary)] transition-colors"
                    >
                      {link.title}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))
        ) : (
          <>
            <div>
              <h4 className="font-bold text-sm text-slate-800 uppercase tracking-wider mb-4">
                Navigation
              </h4>
              <ul className="space-y-2.5 text-sm text-slate-500">
                <li>
                  <Link href="/" className="hover:text-[var(--store-primary)] transition-colors">
                    Home
                  </Link>
                </li>
                <li>
                  <Link
                    href="/products"
                    className="hover:text-[var(--store-primary)] transition-colors"
                  >
                    Catalog
                  </Link>
                </li>
                <li>
                  <Link
                    href="/cart"
                    className="hover:text-[var(--store-primary)] transition-colors"
                  >
                    Shopping Cart
                  </Link>
                </li>
                <li>
                  <Link
                    href="/checkout"
                    className="hover:text-[var(--store-primary)] transition-colors"
                  >
                    Checkout
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold text-sm text-slate-800 uppercase tracking-wider mb-4">
                Customer Care
              </h4>
              <ul className="space-y-2.5 text-sm text-slate-500">
                <li>
                  <span className="hover:text-[var(--store-primary)] cursor-pointer">
                    Privacy Policy
                  </span>
                </li>
                <li>
                  <span className="hover:text-[var(--store-primary)] cursor-pointer">
                    Terms of Service
                  </span>
                </li>
                <li>
                  <span className="hover:text-[var(--store-primary)] cursor-pointer">
                    Return & Refund
                  </span>
                </li>
                <li>
                  <span className="hover:text-[var(--store-primary)] cursor-pointer">
                    Contact Support
                  </span>
                </li>
              </ul>
            </div>
          </>
        )}
      </div>

      <div className="border-t border-slate-100 py-6 text-center text-xs text-slate-400">
        <p>
          {effectiveFooter?.copyright
            ? effectiveFooter.copyright
            : `© ${currentYear} ${store.name}`}
        </p>
      </div>
    </footer>
  );
}



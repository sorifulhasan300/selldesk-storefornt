import type { StorefrontFooterColumnConfig } from "@/shared/types";

export const DEFAULT_FOOTER_COLUMNS: StorefrontFooterColumnConfig[] = [
  {
    title: "Navigation",
    links: [
      { title: "Home", url: "/" },
      { title: "Catalog", url: "/products" },
      { title: "Shopping Cart", url: "/cart" },
      { title: "Checkout", url: "/checkout" },
    ],
  },
  {
    title: "Customer Care",
    links: [
      { title: "Privacy Policy", url: "/pages/privacy" },
      { title: "Terms of Service", url: "/pages/terms" },
      { title: "Return & Refund", url: "/pages/return" },
      { title: "Contact Support", url: "/contact" },
    ],
  },
];


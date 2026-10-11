export const API_ENDPOINTS = {
  TENANT: {
    INIT: "/storefront/init",
    RESOLVE_HOST: (host: string) =>
      `/storefront/resolve-host?host=${encodeURIComponent(host)}`,
  },
  CATALOG: {
    PRODUCTS: "/storefront/products",
    CATEGORIES: "/storefront/categories",
  },
  PRODUCTS: {
    PRODUCT_BY_SLUG: (slug: string) =>
      `/storefront/products/${encodeURIComponent(slug)}`,
  },
  HOME: {
    SECTIONS: "/storefront/sections",
  },
  CHECKOUT: {
    VALIDATE_COUPON: "/storefront/cart/validate-coupon",
    CREATE_ORDER: "/orders/checkout",
  },
  ORDERS: {
    BY_NUMBER: (orderNumber: string) =>
      `/orders/${encodeURIComponent(orderNumber)}`,
  },
} as const;

export default API_ENDPOINTS;

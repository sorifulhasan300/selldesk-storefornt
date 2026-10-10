export const tags = {
  tenant: (s: string) => `store:${s}`, // umbrella: attached to every fetch
  bootstrap: (s: string) => `store:${s}:bootstrap`,
  sections: (s: string) => `store:${s}:sections`,
  products: (s: string) => `store:${s}:products`,
  product: (s: string, slug: string) => `store:${s}:product:${slug}`,
  categories: (s: string) => `store:${s}:categories`,
} as const;

export const REVALIDATE = {
  bootstrap: 3600,
  sections: 300,
  products: 120,
  product: 300,
  categories: 1800,
} as const;


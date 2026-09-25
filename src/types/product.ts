export interface ProductVariant {
  id: string;
  sku: string;
  price: number;
  salePrice?: number | null;
  stock: number;
  attributes: Record<string, string>;
  attributeValues?: Array<{
    id: string;
    value: string;
    attribute: {
      id: string;
      name: string;
    };
  }>;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  imageUrl?: string | null;
  description?: string | null;
  productCount?: number;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  salePrice?: number | null;
  stock: number;
  images: string[];
  category?: Category | null;
  hasVariants: boolean;
  variants: ProductVariant[];
  sku?: string;
  createdAt?: string;
}

export interface ProductListResponse {
  items: Product[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

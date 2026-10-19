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
  updatedAt?: string;
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
  brand?: { name: string } | null;
  hasVariants: boolean;
  variants: ProductVariant[];
  sku?: string;
  isPreOrder?: boolean;
  preOrder?: boolean;
  createdAt?: string;
  updatedAt?: string;
  specifications?: Record<string, any> | Array<{ label: string; value: any }> | null;
  shortDescription?: string | null;
  videoUrl?: string | null;
}

export interface ProductListResponse {
  items: Product[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

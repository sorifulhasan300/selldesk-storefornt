export interface CartItem {
  id: string; // unique line key: `${productId}-${variantId || 'base'}`
  productId: string;
  variantId?: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
  variantTitle?: string;
  maxStock: number;
}

export interface CouponDiscount {
  code: string;
  type: "PERCENTAGE" | "FIXED";
  amount: number;
  discountCalculated: number;
}

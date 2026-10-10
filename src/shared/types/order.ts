export interface CheckoutItemDto {
  productId: string;
  variantId?: string;
  quantity: number;
}

export interface CheckoutDto {
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  shippingAddress: string;
  city?: string;
  notes?: string;
  paymentMethod: "COD" | "BKASH" | "NAGAD" | "CARD" | string;
  couponCode?: string;
  items: CheckoutItemDto[];
}

export interface CheckoutResponse {
  id: string;
  orderNumber: string;
  totalAmount: number;
  status: string;
  paymentStatus: string;
}


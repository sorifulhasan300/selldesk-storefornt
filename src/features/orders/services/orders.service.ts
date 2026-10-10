import "server-only";
import { serverFetch } from "@/shared/api/server-fetch";

export interface OrderDetails {
  id: string;
  orderNumber: string;
  customerName?: string;
  totalAmount?: number;
  status?: string;
  paymentStatus?: string;
  createdAt?: string;
  items?: Array<{
    productId: string;
    variantId?: string;
    quantity: number;
    price: number;
  }>;
}

export const ordersService = {
  async getOrderByNumber(
    storeSlug: string,
    orderNumber: string,
  ): Promise<OrderDetails> {
    return serverFetch<OrderDetails>(
      `/storefront/orders/${encodeURIComponent(orderNumber)}`,
      storeSlug,
      {
        noStore: true, // A11: User-specific & PII data is never cached
      },
    );
  },
};


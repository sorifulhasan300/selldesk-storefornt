import "server-only";
import { serverFetch } from "@/shared/api/server-fetch";
import { API_ENDPOINTS } from "@/shared/constants";

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
      API_ENDPOINTS.ORDERS.BY_NUMBER(orderNumber),
      storeSlug,
      {
        noStore: true, // A11: User-specific & PII data is never cached
      },
    );
  },
};

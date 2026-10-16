import { createApiClient } from "@/shared/api/client";
import { API_ENDPOINTS } from "@/shared/constants";

export interface OrderTrackingDetails {
  invoiceNo: string | null;
  orderStatus: string;
  paymentStatus: string;
  trackingCode: string | null;
  consignmentId: string | null;
  createdAt: string;
}

function unwrap<T>(response: unknown): T {
  if (response && typeof response === "object" && "data" in response) {
    return (response as { data: T }).data;
  }
  return response as T;
}

export const orderTrackingService = {
  async track(
    storeSlug: string,
    orderNumber: string,
    phone: string,
  ): Promise<OrderTrackingDetails> {
    const response = await createApiClient(storeSlug).post<OrderTrackingDetails>(
      API_ENDPOINTS.ORDERS.TRACK,
      { orderNumber, phone },
    );
    return unwrap<OrderTrackingDetails>(response);
  },
};

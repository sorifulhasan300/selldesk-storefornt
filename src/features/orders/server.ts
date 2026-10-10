import "server-only";
import { notFound } from "next/navigation";
import { ordersService, type OrderDetails } from "./services/orders.service";
import { isNotFoundError } from "@/shared/api/api-error";

export async function getOrderByNumber(
  storeSlug: string,
  orderNumber: string,
): Promise<OrderDetails> {
  try {
    return await ordersService.getOrderByNumber(storeSlug, orderNumber);
  } catch (error) {
    if (isNotFoundError(error)) {
      notFound();
    }
    throw error;
  }
}

export { ordersService };


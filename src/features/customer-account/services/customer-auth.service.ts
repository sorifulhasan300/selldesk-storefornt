import { createApiClient } from "@/shared/api/client";
import { API_ENDPOINTS } from "@/shared/constants";

export interface CustomerSession {
  accessToken: string;
  refreshToken: string;
  customer: {
    id: string;
    name: string;
    phone: string;
  };
}

function unwrap<T>(response: unknown): T {
  if (response && typeof response === "object" && "data" in response) {
    return (response as { data: T }).data;
  }
  return response as T;
}

export const customerAuthService = {
  async sendOtp(storeSlug: string, phone: string): Promise<void> {
    const response = await createApiClient(storeSlug).post(
      API_ENDPOINTS.CUSTOMER_AUTH.SEND_OTP,
      { phone },
    );
    unwrap(response);
  },

  async resendOtp(storeSlug: string, phone: string): Promise<void> {
    const response = await createApiClient(storeSlug).post(
      API_ENDPOINTS.CUSTOMER_AUTH.RESEND_OTP,
      { phone },
    );
    unwrap(response);
  },

  async verifyOtp(
    storeSlug: string,
    phone: string,
    code: string,
  ): Promise<CustomerSession> {
    const response = await createApiClient(storeSlug).post<CustomerSession>(
      API_ENDPOINTS.CUSTOMER_AUTH.VERIFY_OTP,
      { phone, code },
    );
    return unwrap<CustomerSession>(response);
  },

  async logout(storeSlug: string, refreshToken: string): Promise<void> {
    const response = await createApiClient(storeSlug).post(
      API_ENDPOINTS.CUSTOMER_AUTH.LOGOUT,
      { refreshToken },
    );
    unwrap(response);
  },
};

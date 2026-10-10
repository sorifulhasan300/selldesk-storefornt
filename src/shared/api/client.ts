import axios, { type AxiosInstance } from "axios";
import { env } from "@/shared/config/env";
import { UUID_REGEX } from "@/shared/config/constants";
import { ApiError } from "./api-error";

export function createApiClient(storeSlug?: string): AxiosInstance {
  const isUuid = storeSlug ? UUID_REGEX.test(storeSlug.trim()) : false;

  const client = axios.create({
    baseURL: env.NEXT_PUBLIC_API_URL,
    timeout: 15000,
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      ...(storeSlug ? { "x-store-slug": storeSlug.trim() } : {}),
      ...(isUuid && storeSlug ? { "x-store-id": storeSlug.trim() } : {}),
    },
  });

  client.interceptors.response.use(
    (response) => {
      const data = response.data;
      if (data && typeof data === "object" && "data" in data && "success" in data) {
        return data.data;
      }
      return data;
    },
    (error) => {
      const status = error.response?.status ?? 0;
      const data = error.response?.data;
      const message =
        status >= 400 && status < 500
          ? (Array.isArray(data?.message)
              ? data.message.join(", ")
              : data?.message) ||
            error.message ||
            "Request failed"
          : "Something went wrong. Please try again.";
      return Promise.reject(
        new ApiError(status, message, data?.code, data?.details),
      );
    },
  );

  return client;
}


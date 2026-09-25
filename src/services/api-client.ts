import axios, { AxiosInstance } from "axios";

const API_BASE_URL =
  process.env.INTERNAL_API_URL ||
  process.env.NEXT_PUBLIC_API_URL ||
  "http://api.selldesk.test:5000/api/v1";

/**
 * Universal Axios client for client-side interactions and mutations
 */
export function createApiClient(storeSlug?: string): AxiosInstance {
  const client = axios.create({
    baseURL: API_BASE_URL,
    timeout: 15000,
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      ...(storeSlug ? { "x-store-slug": storeSlug } : {}),
    },
  });

  client.interceptors.response.use(
    (response) => response.data,
    (error) => {
      const message =
        error.response?.data?.message ||
        error.message ||
        "An unexpected error occurred.";
      return Promise.reject(new Error(message));
    },
  );

  return client;
}

/**
 * Server-side native fetch with ISR caching & tag revalidation
 */
export async function serverFetch<T>(
  endpoint: string,
  storeSlug: string,
  options: {
    revalidate?: number | false;
    tags?: string[];
  } = {},
): Promise<T> {
  const cleanEndpoint = endpoint.startsWith("/") ? endpoint : `/${endpoint}`;
  const url = `${API_BASE_URL}${cleanEndpoint}`;

  try {
    const res = await fetch(url, {
      headers: {
        "Content-Type": "application/json",
        "x-store-slug": storeSlug,
      },
      next: {
        revalidate: options.revalidate !== undefined ? options.revalidate : 60,
        tags: options.tags || [`tenant:${storeSlug}`],
      },
    });

    if (!res.ok) {
      throw new Error(
        `[Fetch Error ${res.status}] Failed request to ${endpoint}`,
      );
    }

    const json = await res.json();
    return (json.data ?? json) as T;
  } catch (error: any) {
    console.error(`[serverFetch Error] ${endpoint}:`, error.message);
    throw error;
  }
}

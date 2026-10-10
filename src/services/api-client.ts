import axios, { AxiosInstance } from "axios";

const API_BASE_URL =
  process.env.INTERNAL_API_URL ||
  process.env.NEXT_PUBLIC_API_URL ||
  "http://api.selldesk.test:5000/api/v1";

const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

/**
 * Universal Axios client for client-side interactions and mutations
 */
export function createApiClient(storeSlug?: string): AxiosInstance {
  const isUuid = storeSlug ? UUID_REGEX.test(storeSlug.trim()) : false;

  const client = axios.create({
    baseURL: API_BASE_URL,
    timeout: 15000,
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      ...(storeSlug ? { "x-store-slug": storeSlug.trim() } : {}),
      ...(isUuid && storeSlug ? { "x-store-id": storeSlug.trim() } : {}),
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

  const isUuid = storeSlug ? UUID_REGEX.test(storeSlug.trim()) : false;
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    "x-store-slug": storeSlug.trim(),
  };
  if (isUuid) {
    headers["x-store-id"] = storeSlug.trim();
  }

  try {
    const res = await fetch(url, {
      headers,
      next: {
        revalidate: options.revalidate !== undefined ? options.revalidate : 60,
        tags: options.tags || [`tenant:${storeSlug}`],
      },
    });

    if (!res.ok) {
      let errorMessage = `Failed request to ${endpoint}`;
      try {
        const errorJson = await res.json();
        errorMessage =
          (Array.isArray(errorJson.message)
            ? errorJson.message.join(", ")
            : errorJson.message) ||
          errorJson.error ||
          errorMessage;
      } catch {
        // Response body wasn't JSON
      }
      throw new Error(`[Fetch Error ${res.status}] ${errorMessage}`);
    }

    const json = await res.json();
    return (json.data ?? json) as T;
  } catch (error: any) {
    console.error(`[serverFetch Error] ${endpoint}:`, error.message);
    throw error;
  }
}

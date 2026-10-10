import "server-only";
import { env } from "@/shared/config/env";
import { UUID_REGEX } from "@/shared/config/constants";
import { ApiError } from "./api-error";
import { tags as tagReg } from "./tags";

type ServerFetchOptions = {
  revalidate?: number | false;
  tags?: string[];
  noStore?: boolean;
  timeoutMs?: number;
};

export async function serverFetch<T>(
  endpoint: string,
  storeSlug: string,
  opts: ServerFetchOptions = {},
): Promise<T> {
  const cleanEndpoint = endpoint.startsWith("/") ? endpoint : `/${endpoint}`;
  const url = `${env.SERVER_API_URL}${cleanEndpoint}`;

  const isUuid = storeSlug ? UUID_REGEX.test(storeSlug.trim()) : false;
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    "x-store-slug": storeSlug.trim(),
  };
  if (isUuid) {
    headers["x-store-id"] = storeSlug.trim();
  }

  const res = await fetch(url, {
    headers,
    signal: AbortSignal.timeout(opts.timeoutMs ?? 8000),
    ...(opts.noStore
      ? { cache: "no-store" as const }
      : {
          next: {
            revalidate: opts.revalidate !== undefined ? opts.revalidate : 60,
            tags: [tagReg.tenant(storeSlug), ...(opts.tags ?? [])],
          },
        }),
  });

  if (!res.ok) {
    const body = await res.json().catch(() => null);
    const message =
      (Array.isArray(body?.message)
        ? body.message.join(", ")
        : body?.message) ||
      body?.error ||
      `Request failed with status ${res.status}`;
    throw new ApiError(res.status, message, body?.code, body?.details);
  }

  const json = await res.json();
  return (json && typeof json === "object" && "data" in json && "success" in json
    ? json.data
    : (json?.data ?? json)) as T;
}


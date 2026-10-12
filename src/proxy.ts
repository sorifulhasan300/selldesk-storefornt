import { NextResponse, type NextRequest } from "next/server";
import { API_ENDPOINTS } from "@/shared/constants";
import { BUILDER_ORIGINS } from "@/shared/config/builder-origins";
import { RESERVED_SUBDOMAINS, SLUG_REGEX } from "@/shared/config/constants";

const ROOT_DOMAIN = (
  process.env.NEXT_PUBLIC_ROOT_DOMAIN ||
  process.env.NEXT_PUBLIC_BASE_DOMAIN ||
  "selldesk.test"
)
  .split(":")[0]
  .toLowerCase()
  .replace(/\.$/, "");
const API_BASE_URL =
  process.env.SERVER_API_URL ||
  process.env.INTERNAL_API_URL ||
  process.env.NEXT_PUBLIC_API_URL ||
  "http://api.selldesk.test:5000/api/v1";
const IS_PROD = process.env.NODE_ENV === "production";

const notFound = () =>
  new NextResponse("Store not found", {
    status: 404,
    headers: { "x-robots-tag": "noindex" },
  });

function normalizeHost(raw: string | null): string | null {
  if (!raw) return null;
  const match = /^([a-z0-9.-]+)(?::\d{1,5})?$/i.exec(raw.trim());
  if (!match) return null;

  const host = match[1].toLowerCase().replace(/\.$/, "");
  if (
    !host ||
    host.startsWith(".") ||
    host.endsWith(".") ||
    host.includes("..") ||
    !/^[a-z0-9.-]+$/.test(host)
  ) {
    return null;
  }
  return host;
}

function withTenantHeaders(req: NextRequest, slug: string, host: string) {
  const headers = new Headers(req.headers);
  headers.delete("x-store-slug");
  headers.delete("x-tenant-host");
  headers.set("x-store-slug", slug);
  headers.set("x-tenant-host", host);
  return headers;
}

async function resolveCustomDomain(host: string): Promise<string | null | NextResponse> {
  let response: Response;
  try {
    const endpoint = API_ENDPOINTS.TENANT.RESOLVE_HOST(host);
    response = await fetch(`${API_BASE_URL.replace(/\/$/, "")}${endpoint}`, {
      headers: { "x-store-slug": host, Accept: "application/json" },
      next: { revalidate: 300 },
      signal: AbortSignal.timeout(3000),
    });
  } catch {
    return new NextResponse("Store lookup unavailable", {
      status: 503,
      headers: { "x-robots-tag": "noindex" },
    });
  }

  if (response.status === 404) return null;
  if (!response.ok) {
    return new NextResponse("Store lookup failed", {
      status: 502,
      headers: { "x-robots-tag": "noindex" },
    });
  }

  let payload: unknown;
  try {
    payload = await response.json();
  } catch {
    return new NextResponse("Invalid store lookup response", {
      status: 502,
      headers: { "x-robots-tag": "noindex" },
    });
  }

  if (typeof payload !== "object" || payload === null) return null;
  const envelope = payload as Record<string, unknown>;
  const result =
    typeof envelope.data === "object" && envelope.data !== null
      ? (envelope.data as Record<string, unknown>)
      : envelope;
  const slug =
    typeof result.slug === "string"
      ? result.slug
      : typeof result.storeSlug === "string"
        ? result.storeSlug
        : null;
  return slug && SLUG_REGEX.test(slug) ? slug : null;
}

export async function proxy(req: NextRequest) {
  const host = normalizeHost(req.headers.get("host"));
  if (!host) return notFound();

  const pathname = req.nextUrl.pathname;
  const isDirectStorePath = pathname.startsWith("/store/");
  if (IS_PROD && isDirectStorePath) return notFound();

  let requestedStoreSlug: string | null = null;
  if (!IS_PROD && isDirectStorePath) {
    requestedStoreSlug = pathname.split("/")[2] ?? null;
    if (
      !requestedStoreSlug ||
      !SLUG_REGEX.test(requestedStoreSlug) ||
      RESERVED_SUBDOMAINS.has(requestedStoreSlug)
    ) {
      return notFound();
    }
  }

  let slug: string | null = null;
  if (host.endsWith(`.${ROOT_DOMAIN}`)) {
    const label = host.slice(0, -(ROOT_DOMAIN.length + 1));
    if (
      !label.includes(".") &&
      SLUG_REGEX.test(label) &&
      !RESERVED_SUBDOMAINS.has(label)
    ) {
      slug = label;
    }
  } else if (!IS_PROD && host.endsWith(".localhost")) {
    const label = host.slice(0, -".localhost".length);
    if (SLUG_REGEX.test(label) && !RESERVED_SUBDOMAINS.has(label)) {
      slug = label;
    }
  } else if (host !== ROOT_DOMAIN && host !== "localhost") {
    const resolvedSlug = await resolveCustomDomain(host);
    if (resolvedSlug instanceof NextResponse) return resolvedSlug;
    slug = resolvedSlug;
  }

  if (!IS_PROD && requestedStoreSlug) {
    const cleanPath =
      pathname.slice(`/store/${requestedStoreSlug}`.length) || "/";
    const url = req.nextUrl.clone();

    if (!slug && (host === ROOT_DOMAIN || host === "localhost")) {
      url.hostname = `${requestedStoreSlug}.${ROOT_DOMAIN}`;
      url.pathname = cleanPath;
      return NextResponse.redirect(url);
    }

    if (slug !== requestedStoreSlug) return notFound();
    url.pathname = cleanPath;
    return NextResponse.redirect(url);
  }

  if (!slug) return notFound();

  const url = req.nextUrl.clone();
  url.pathname = `/store/${slug}${pathname === "/" ? "" : pathname}`;
  const response = NextResponse.rewrite(url, {
    request: { headers: withTenantHeaders(req, slug, host) },
  });
  const frameAncestors =
    req.nextUrl.searchParams.get("preview") === "true"
      ? ["'self'", ...BUILDER_ORIGINS].join(" ")
      : "'none'";
  response.headers.set(
    "Content-Security-Policy",
    `frame-ancestors ${frameAncestors}`,
  );
  return response;
}

export const config = {
  matcher: [
    "/((?!api(?:/|$)|_next(?:/|$)|images(?:/|$)|assets(?:/|$)|fonts(?:/|$)|favicon\\.ico$|robots\\.txt$|sitemap\\.xml$|.*\\.[^/]+$).*)",
  ],
};

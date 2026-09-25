import { NextRequest, NextResponse } from "next/server";

// Platform-reserved subdomains that should never resolve as a storefront tenant
const RESERVED_SUBDOMAINS = new Set([
  "www",
  "api",
  "app",
  "admin",
  "dashboard",
  "mail",
  "assets",
  "static",
  "status",
]);

export const config = {
  matcher: [
    /*
     * Match all paths except:
     * - api/revalidate (ISR webhook)
     * - _next/static, _next/image (Next.js assets)
     * - favicon.ico, sitemap.xml, robots.txt
     */
    "/((?!api/revalidate|_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml).*)",
  ],
};

export function middleware(req: NextRequest) {
  const url = req.nextUrl;
  const host = req.headers.get("host")?.toLowerCase() || "";

  // Base domain config (e.g., selldesk.test:3001)
  const baseDomain =
    process.env.NEXT_PUBLIC_BASE_DOMAIN?.toLowerCase() || "selldesk.test:3001";
  const cleanHost = host.split(":")[0];
  const cleanBase = baseDomain.split(":")[0];

  let storeSlug: string | null = null;

  // 1. Path-based Routing: /store/:slug/*
  if (url.pathname.startsWith("/store/")) {
    const parts = url.pathname.split("/");
    const pathSlug = parts[2];
    if (pathSlug && pathSlug.trim() !== "") {
      storeSlug = pathSlug.trim();
      // Strip '/store/[slug]' from the path for the internal rewrite
      const remainingPath = "/" + parts.slice(3).join("/");
      const rewriteUrl = new URL(
        `/_tenant/${storeSlug}${remainingPath}`,
        req.url,
      );
      rewriteUrl.search = url.search;

      const requestHeaders = new Headers(req.headers);
      requestHeaders.set("x-store-slug", storeSlug);
      requestHeaders.set("x-tenant-host", host);

      const response = NextResponse.rewrite(rewriteUrl, {
        request: { headers: requestHeaders },
      });
      response.headers.set("x-store-slug", storeSlug);
      return response;
    }
  }

  // 2. Subdomain Routing: [storename].selldesk.test or [storename].localhost
  if (cleanHost.endsWith(`.${cleanBase}`) || cleanHost.endsWith(".localhost")) {
    const subCandidate = cleanHost
      .replace(`.${cleanBase}`, "")
      .replace(".localhost", "")
      .split(".")[0];

    if (subCandidate && !RESERVED_SUBDOMAINS.has(subCandidate)) {
      storeSlug = subCandidate;
    }
  }

  // 3. Custom Domain Routing (Fallback for verified CNAME / custom domains)
  if (!storeSlug && cleanHost !== cleanBase && cleanHost !== "localhost") {
    storeSlug = cleanHost;
  }

  // 4. Naked / Default Root Domain fallback
  if (!storeSlug) {
    // If user lands on root domain without /store/ prefix, show the store fallback page
    return NextResponse.rewrite(new URL("/not-found", req.url));
  }

  // 5. Internal rewrite to dynamic route segment: /_tenant/[storeSlug]/*
  const rewriteUrl = new URL(`/_tenant/${storeSlug}${url.pathname}`, req.url);
  rewriteUrl.search = url.search;

  const requestHeaders = new Headers(req.headers);
  requestHeaders.set("x-store-slug", storeSlug);
  requestHeaders.set("x-tenant-host", host);

  const response = NextResponse.rewrite(rewriteUrl, {
    request: { headers: requestHeaders },
  });
  response.headers.set("x-store-slug", storeSlug);
  return response;
}

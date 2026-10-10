import { NextResponse, type NextRequest } from "next/server";
import { RESERVED_SUBDOMAINS, SLUG_REGEX } from "@/shared/config/constants";

const ROOT =
  process.env.NEXT_PUBLIC_ROOT_DOMAIN ||
  process.env.NEXT_PUBLIC_BASE_DOMAIN?.split(":")[0] ||
  "selldesk.test";
const IS_PROD = process.env.NODE_ENV === "production";

const notFound = () =>
  new NextResponse("Store not found", {
    status: 404,
    headers: { "x-robots-tag": "noindex" },
  });

function normalizeHost(raw: string | null): string | null {
  if (!raw) return null;
  const h = raw.toLowerCase().split(":")[0].replace(/\.$/, "");
  return /^[a-z0-9.-]+$/.test(h) ? h : null;
}

export async function proxy(req: NextRequest) {
  const host = normalizeHost(req.headers.get("host"));
  if (!host) return notFound();
  if (IS_PROD && req.nextUrl.pathname.startsWith("/store/")) return notFound();

  let slug: string | null = null;
  if (host.endsWith(`.${ROOT}`)) {
    const label = host.slice(0, -(ROOT.length + 1));
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
  } else if (!IS_PROD && req.nextUrl.pathname.startsWith("/store/")) {
    const parts = req.nextUrl.pathname.split("/");
    const pathSlug = parts[2];
    if (pathSlug && SLUG_REGEX.test(pathSlug)) {
      slug = pathSlug;
    }
  } else if (host !== ROOT && host !== "localhost") {
    slug = host;
  }

  if (!slug) return notFound();

  const headers = new Headers(req.headers);
  headers.delete("x-store-slug");
  headers.delete("x-tenant-host");
  headers.set("x-store-slug", slug);
  headers.set("x-tenant-host", host);

  const url = req.nextUrl.clone();
  if (!url.pathname.startsWith(`/store/${slug}`)) {
    url.pathname = `/store/${slug}${url.pathname === "/" ? "" : url.pathname}`;
  }
  return NextResponse.rewrite(url, { request: { headers } });
}

export const middleware = proxy;

export const config = {
  matcher: [
    "/((?!api/|_next/|favicon\\.ico|robots\\.txt|sitemap\\.xml|.*\\..*).*)",
  ],
};


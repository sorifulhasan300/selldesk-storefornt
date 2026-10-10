import { createHash, timingSafeEqual } from "node:crypto";
import { revalidateTag } from "next/cache";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { tags } from "@/shared/api/tags";

const Body = z.object({
  storeSlug: z.string().regex(/^[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?$/),
  scope: z
    .enum(["all", "bootstrap", "sections", "products", "categories", "product"])
    .default("all"),
  productSlug: z.string().max(200).optional(),
});

const safeEqual = (a: string, b: string) => {
  if (!a || !b) return false;
  return timingSafeEqual(
    createHash("sha256").update(a).digest(),
    createHash("sha256").update(b).digest(),
  );
};

export async function POST(req: NextRequest) {
  const expected =
    process.env.REVALIDATE_SECRET || process.env.REVALIDATION_SECRET;
  if (!expected) {
    return NextResponse.json(
      { message: "Server misconfigured" },
      { status: 500 },
    ); // fail closed
  }

  const secret = req.headers.get("x-revalidate-secret") ?? "";
  if (!safeEqual(secret, expected)) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const parsed = Body.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ message: "Invalid body" }, { status: 400 });
  }

  const { storeSlug, scope, productSlug } = parsed.data;

  const tag =
    scope === "all"
      ? tags.tenant(storeSlug)
      : scope === "product" && productSlug
      ? tags.product(storeSlug, productSlug)
      : scope !== "product"
      ? tags[scope](storeSlug)
      : null;

  if (!tag) {
    return NextResponse.json(
      { message: "productSlug required" },
      { status: 400 },
    );
  }

  revalidateTag(tag, "max");
  return NextResponse.json({ revalidated: true, tag });
}

import { NextRequest, NextResponse } from "next/server";
import { revalidateTag } from "next/cache";

export async function POST(req: NextRequest) {
  const secret = req.headers.get("x-revalidate-secret");
  const expectedSecret =
    process.env.REVALIDATION_SECRET || "selldesk_secure_isr_secret_2026";

  if (secret !== expectedSecret) {
    return NextResponse.json(
      { message: "Invalid secret token" },
      { status: 401 },
    );
  }

  try {
    const body = await req.json();
    const { tag, storeSlug } = body;

    if (tag) {
      (revalidateTag as any)(tag);
      return NextResponse.json({
        revalidated: true,
        tag,
        timestamp: Date.now(),
      });
    }

    if (storeSlug) {
      (revalidateTag as any)(`store:${storeSlug}:bootstrap`);
      (revalidateTag as any)(`store:${storeSlug}:products`);
      return NextResponse.json({
        revalidated: true,
        storeSlug,
        timestamp: Date.now(),
      });
    }

    return NextResponse.json(
      { message: "Missing tag or storeSlug in request body" },
      { status: 400 },
    );
  } catch (error: any) {
    return NextResponse.json(
      { message: "Error revalidating", error: error.message },
      { status: 500 },
    );
  }
}

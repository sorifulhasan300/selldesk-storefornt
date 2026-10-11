import { Metadata } from "next";
import { getBootstrap } from "@/features/tenant/server";
import { CartView } from "@/features/cart";

interface CartPageProps {
  params: Promise<{ storeSlug: string }>;
}

export async function generateMetadata({
  params,
}: CartPageProps): Promise<Metadata> {
  const { storeSlug } = await params;
  return {
    title: "Shopping Cart",
    description: `Review your shopping cart items for ${storeSlug}`,
  };
}

export default async function CartPage({ params }: CartPageProps) {
  const { storeSlug } = await params;
  const bootstrap = await getBootstrap(storeSlug);
  const currency = bootstrap.store?.currency || "USD";

  return (
    <div className="space-y-6">
      <CartView storeSlug={storeSlug} currency={currency} />
    </div>
  );
}

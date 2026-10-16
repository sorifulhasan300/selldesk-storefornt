import { getBootstrap } from "@/features/tenant/server";
import { WishlistView } from "@/features/wishlist";

export const metadata = {
  title: "Wishlist",
};

export default async function WishlistPage({
  params,
}: {
  params: Promise<{ storeSlug: string }>;
}) {
  const { storeSlug } = await params;
  const bootstrap = await getBootstrap(storeSlug);

  return (
    <WishlistView
      storeSlug={storeSlug}
      currency={bootstrap.store.currency || "USD"}
    />
  );
}

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
    <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6">
      <WishlistView
        storeSlug={storeSlug}
        currency={bootstrap.store.currency || "USD"}
      />
    </div>
  );
}

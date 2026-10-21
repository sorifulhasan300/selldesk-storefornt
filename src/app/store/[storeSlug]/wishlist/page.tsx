import { redirect } from "next/navigation";
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

  const wishlistConfig = bootstrap.config?.wishlist ?? bootstrap.wishlist;
  if (wishlistConfig?.active === false) {
    redirect("/");
  }

  return (
    <div className="w-full mx-auto px-4 sm:px-6 lg:px-8 max-w-[var(--store-content-max-w,1200px)] py-6">
      <WishlistView
        storeSlug={storeSlug}
        currency={bootstrap.store.currency || "USD"}
        cardConfig={bootstrap.config?.productCard}
      />
    </div>
  );
}

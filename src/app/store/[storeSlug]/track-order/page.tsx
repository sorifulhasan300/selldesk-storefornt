import { OrderTrackingPage } from "@/features/orders";

export const metadata = {
  title: "Track your order",
};

export default async function TrackOrderPage({
  params,
}: {
  params: Promise<{ storeSlug: string }>;
}) {
  const { storeSlug } = await params;
  return (
    <div className="w-full mx-auto px-4 sm:px-6 lg:px-8 max-w-[var(--store-content-max-w,1200px)] py-6">
      <OrderTrackingPage storeSlug={storeSlug} />
    </div>
  );
}

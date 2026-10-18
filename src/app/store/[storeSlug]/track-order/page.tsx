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
    <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6">
      <OrderTrackingPage storeSlug={storeSlug} />
    </div>
  );
}

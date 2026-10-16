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
  return <OrderTrackingPage storeSlug={storeSlug} />;
}

import { getBootstrap } from "@/features/tenant/server";
import { CheckoutForm } from "@/features/checkout";

interface CheckoutPageProps {
  params: Promise<{ storeSlug: string }>;
}

export default async function CheckoutPage({ params }: CheckoutPageProps) {
  const { storeSlug } = await params;
  const bootstrap = await getBootstrap(storeSlug);

  const deliveryCharge = bootstrap.deliveryCharge || {
    insideCity: 60,
    outsideCity: 120,
  };
  const currency = bootstrap.store?.currency || "USD";

  return (
    <div className="space-y-6">
      <div className="border-b border-slate-200/80 pb-4">
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900">
          Checkout
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Complete your order with secure doorstep delivery
        </p>
      </div>

      <CheckoutForm
        storeSlug={storeSlug}
        currency={currency}
        deliveryChargeConfig={deliveryCharge}
      />
    </div>
  );
}

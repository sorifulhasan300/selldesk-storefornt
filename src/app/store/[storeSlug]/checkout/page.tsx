import { StorefrontService } from "@/services/storefront.service";
import { CheckoutForm } from "@/components/checkout/checkout-form";

interface CheckoutPageProps {
  params: Promise<{ storeSlug: string }>;
}

export default async function CheckoutPage({ params }: CheckoutPageProps) {
  const { storeSlug } = await params;

  let deliveryCharge = { insideCity: 60, outsideCity: 120 };
  let currency = "USD";

  try {
    const bootstrap = await StorefrontService.getBootstrap(storeSlug);
    if (bootstrap.deliveryCharge) {
      deliveryCharge = bootstrap.deliveryCharge;
    }
    if (bootstrap.store?.currency) {
      currency = bootstrap.store.currency;
    }
  } catch (error) {
    // Development fallback
  }

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

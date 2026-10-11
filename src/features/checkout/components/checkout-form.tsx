"use client";

import Link from "next/link";
import { StoreDeliveryCharge } from "@/shared/types";
import { formatCurrency } from "@/shared/lib/utils";
import { Loader2, ArrowRight, ShoppingBag } from "lucide-react";
import { useCheckoutForm } from "../hooks/use-checkout-form";
import { CheckoutCustomerFields } from "./checkout-customer-fields";
import { CheckoutDeliveryZone } from "./checkout-delivery-zone";
import { CheckoutPaymentMethods } from "./checkout-payment-methods";
import { CheckoutOrderSummary } from "./checkout-order-summary";

interface CheckoutFormProps {
  storeSlug: string;
  currency?: string;
  deliveryChargeConfig?: StoreDeliveryCharge;
}

export function CheckoutForm({
  storeSlug,
  currency = "USD",
  deliveryChargeConfig,
}: CheckoutFormProps) {
  const {
    items,
    subtotal,
    discount,
    coupon,
    total,
    loading,
    validatingCoupon,
    fieldErrors,
    customerName,
    setCustomerName,
    customerPhone,
    setCustomerPhone,
    shippingAddress,
    setShippingAddress,
    cityZone,
    setCityZone,
    insideFee,
    outsideFee,
    currentDeliveryFee,
    paymentMethod,
    setPaymentMethod,
    notes,
    setNotes,
    couponCode,
    setCouponCode,
    handleApplyCoupon,
    handleRemoveCoupon,
    handleSubmit,
  } = useCheckoutForm({ storeSlug, deliveryChargeConfig });

  if (items.length === 0) {
    return (
      <div className="py-20 text-center max-w-md mx-auto space-y-4">
        <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 mx-auto">
          <ShoppingBag className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-bold text-slate-800">Your bag is empty</h2>
        <p className="text-slate-500 text-sm">
          Please add items to your cart before proceeding to checkout.
        </p>
        <Link
          href="/products"
          className="inline-flex items-center gap-2 px-6 py-3 bg-[var(--store-primary)] text-white font-bold text-sm rounded-xl hover:opacity-90 transition-opacity"
        >
          <span>Explore Products</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 py-4">
      {/* Checkout Form */}
      <form onSubmit={handleSubmit} className="lg:col-span-7 space-y-8">
        <CheckoutCustomerFields
          customerName={customerName}
          onCustomerNameChange={setCustomerName}
          customerPhone={customerPhone}
          onCustomerPhoneChange={setCustomerPhone}
          shippingAddress={shippingAddress}
          onShippingAddressChange={setShippingAddress}
          notes={notes}
          onNotesChange={setNotes}
          fieldErrors={fieldErrors}
          disabled={loading}
        />

        <CheckoutDeliveryZone
          cityZone={cityZone}
          onZoneSelect={setCityZone}
          insideFee={insideFee}
          outsideFee={outsideFee}
          currency={currency}
          errorMessage={fieldErrors.cityZone}
          disabled={loading}
        />

        <CheckoutPaymentMethods
          paymentMethod={paymentMethod}
          onPaymentMethodChange={setPaymentMethod}
          disabled={loading}
        />

        <button
          type="submit"
          disabled={loading}
          className="w-full py-4 bg-[var(--store-primary)] hover:opacity-90 text-white font-bold text-base rounded-2xl shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
        >
          {loading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>Placing Order...</span>
            </>
          ) : (
            <span>Confirm Order ({formatCurrency(total, currency)})</span>
          )}
        </button>
      </form>

      {/* Order Summary */}
      <div className="lg:col-span-5 space-y-6">
        <CheckoutOrderSummary
          items={items}
          currency={currency}
          subtotal={subtotal}
          discount={discount}
          coupon={coupon}
          cityZone={cityZone}
          deliveryFee={currentDeliveryFee}
          total={total}
          loading={loading}
          couponCode={couponCode}
          onCouponCodeChange={setCouponCode}
          validatingCoupon={validatingCoupon}
          onApplyCoupon={handleApplyCoupon}
          onRemoveCoupon={handleRemoveCoupon}
        />
      </div>
    </div>
  );
}

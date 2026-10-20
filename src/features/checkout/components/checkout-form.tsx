"use client";

import { useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { StoreDeliveryCharge, StorefrontCheckoutConfig } from "@/shared/types";
import { formatCurrency } from "@/shared/lib/utils";
import { Loader2, ArrowRight, ShoppingBag } from "lucide-react";
import { useCheckoutForm } from "../hooks/use-checkout-form";
import { CheckoutCustomerFields } from "./checkout-customer-fields";
import { CheckoutDeliveryZone } from "./checkout-delivery-zone";
import { CheckoutPaymentMethods } from "./checkout-payment-methods";
import { CheckoutOrderSummary } from "./checkout-order-summary";
import { Button } from "@/shared/ui/button";

interface CheckoutFormProps {
  storeSlug: string;
  currency?: string;
  deliveryChargeConfig?: StoreDeliveryCharge;
  checkoutConfig?: StorefrontCheckoutConfig;
}

export function CheckoutForm({
  storeSlug,
  currency = "USD",
  deliveryChargeConfig,
  checkoutConfig,
}: CheckoutFormProps) {
  const [agreedToPolicy, setAgreedToPolicy] = useState(false);
  const [policyError, setPolicyError] = useState(false);

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
    district,
    setDistrict,
    cityZone,
    setCityZone,
    zones,
    isFreeDelivery,
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

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (checkoutConfig?.showAgreement !== false && !agreedToPolicy) {
      setPolicyError(true);
      toast.error("Please accept the terms and policies to complete your order.");
      return;
    }
    setPolicyError(false);
    handleSubmit(e);
  };

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
          className="inline-flex items-center gap-2 rounded-xl bg-(--store-primary) px-6 py-3 text-sm font-bold text-white transition-opacity hover:opacity-90"
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
      <form onSubmit={handleFormSubmit} className="lg:col-span-7 space-y-8">
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
          checkoutConfig={checkoutConfig}
        />

        <CheckoutDeliveryZone
          cityZone={cityZone}
          onZoneSelect={setCityZone}
          district={district}
          onDistrictChange={setDistrict}
          zones={zones}
          isFreeDelivery={isFreeDelivery}
          insideFee={insideFee}
          outsideFee={outsideFee}
          currency={currency}
          errorMessage={fieldErrors.cityZone}
          disabled={loading}
          checkoutConfig={checkoutConfig}
        />

        <CheckoutPaymentMethods
          paymentMethod={paymentMethod}
          onPaymentMethodChange={setPaymentMethod}
          disabled={loading}
        />

        {checkoutConfig?.showAgreement !== false && (
          <div className="space-y-1.5">
            <label className="flex items-start gap-2.5 cursor-pointer select-none">
              <input
                type="checkbox"
                id="policy-agreement"
                checked={agreedToPolicy}
                onChange={(e) => {
                  setAgreedToPolicy(e.target.checked);
                  if (e.target.checked) setPolicyError(false);
                }}
                disabled={loading}
                className="mt-0.5 size-4 rounded border-slate-300 text-(--store-primary) accent-(--store-primary) focus:ring-(--store-primary) cursor-pointer"
                required
              />
              <span className="text-xs text-slate-600 leading-relaxed">
                I agree to the{" "}
                <Link
                  href="/pages/terms"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-medium text-slate-900 underline hover:text-(--store-primary) transition-colors"
                >
                  Terms & Conditions
                </Link>
                ,{" "}
                <Link
                  href="/pages/privacy"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-medium text-slate-900 underline hover:text-(--store-primary) transition-colors"
                >
                  Privacy Policy
                </Link>{" "}
                and{" "}
                <Link
                  href="/pages/return"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-medium text-slate-900 underline hover:text-(--store-primary) transition-colors"
                >
                  Return & Refund Policy
                </Link>
              </span>
            </label>
            {policyError && (
              <p className="text-xs text-rose-600 font-medium pl-6.5">
                You must accept the terms and policies to proceed.
              </p>
            )}
          </div>
        )}

        <Button
          type="submit"
          size="lg"
          disabled={loading}
          className="h-12 w-full rounded-2xl text-base font-bold shadow-md"
        >
          {loading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>Placing Order...</span>
            </>
          ) : (
            <span>
              {`${checkoutConfig?.placeOrderLabel || "Confirm Order"} (${formatCurrency(total, currency)})`}
            </span>
          )}
        </Button>
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
          checkoutConfig={checkoutConfig}
        />
      </div>
    </div>
  );
}

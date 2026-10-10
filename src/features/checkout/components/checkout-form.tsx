"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useCart } from "@/features/cart";
import { StoreDeliveryCharge, CouponDiscount } from "@/shared/types";
import { checkoutService } from "../services/checkout.service";
import { formatCurrency } from "@/shared/lib/utils";
import { toast } from "sonner";
import { Truck, ShieldCheck, Tag, Loader2 } from "lucide-react";

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
  const router = useRouter();
  const { items, subtotal, discount, coupon, applyCoupon, clearCart } =
    useCart(storeSlug);

  const [loading, setLoading] = useState(false);
  const [couponCode, setCouponCode] = useState("");
  const [validatingCoupon, setValidatingCoupon] = useState(false);

  // Form states
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [shippingAddress, setShippingAddress] = useState("");
  const [city, setCity] = useState("inside"); // 'inside' or 'outside'
  const [paymentMethod, setPaymentMethod] = useState("COD");
  const [notes, setNotes] = useState("");

  const insideFee = deliveryChargeConfig?.insideCity ?? 50;
  const outsideFee = deliveryChargeConfig?.outsideCity ?? 100;
  const currentDeliveryFee = city === "inside" ? insideFee : outsideFee;

  const total = Math.max(0, subtotal - discount + currentDeliveryFee);

  const handleApplyCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponCode.trim()) return;

    setValidatingCoupon(true);
    try {
      const result = await checkoutService.validateCoupon(
        storeSlug,
        couponCode.trim(),
        subtotal,
      );
      applyCoupon(result);
      toast.success(`Coupon applied: ${couponCode.toUpperCase()}`);
    } catch (err: any) {
      toast.error(err.message || "Invalid or expired coupon code");
    } finally {
      setValidatingCoupon(false);
    }
  };

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();

    if (items.length === 0) {
      toast.error("Your cart is empty");
      return;
    }

    setLoading(true);
    try {
      const payload = {
        customerName: customerName.trim(),
        customerPhone: customerPhone.trim(),
        shippingAddress: shippingAddress.trim(),
        city: city === "inside" ? "Inside City" : "Outside City",
        notes: notes.trim() || undefined,
        paymentMethod,
        couponCode: coupon?.code,
        items: items.map((i) => ({
          productId: i.productId,
          variantId: i.variantId,
          quantity: i.quantity,
        })),
      };

      const res = await checkoutService.checkout(storeSlug, payload);
      toast.success("Order placed successfully!");
      clearCart();
      router.push(`/orders/${res.orderNumber || res.id || "success"}`);
    } catch (err: any) {
      toast.error(err.message || "Failed to place order. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="py-20 text-center max-w-md mx-auto">
        <h2 className="text-2xl font-bold text-slate-800">Your bag is empty</h2>
        <p className="text-slate-500 mt-2 text-sm">
          Please add items to your cart before proceeding to checkout.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 py-4">
      {/* Checkout Form */}
      <form onSubmit={handlePlaceOrder} className="lg:col-span-7 space-y-8">
        {/* Contact & Delivery Details */}
        <div className="bg-white border border-slate-200/80 rounded-2xl p-6 space-y-5">
          <h2 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
            <Truck className="w-5 h-5 text-blue-600" /> Shipping & Customer
            Details
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Full Name *
              </label>
              <input
                required
                type="text"
                placeholder="e.g. John Doe"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Phone Number *
              </label>
              <input
                required
                type="tel"
                placeholder="e.g. 01700000000"
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value)}
                className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Delivery Area / Zone *
            </label>
            <div className="grid grid-cols-2 gap-4">
              <label
                className={`border rounded-xl p-3 flex items-center justify-between cursor-pointer transition-all ${
                  city === "inside"
                    ? "border-blue-600 bg-blue-50/50 ring-1 ring-blue-500"
                    : "border-slate-200 hover:border-slate-300"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <input
                    type="radio"
                    name="city"
                    value="inside"
                    checked={city === "inside"}
                    onChange={() => setCity("inside")}
                    className="text-blue-600"
                  />
                  <span className="text-sm font-semibold text-slate-800">
                    Inside City
                  </span>
                </div>
                <span className="text-xs font-bold text-slate-600">
                  {formatCurrency(insideFee, currency)}
                </span>
              </label>

              <label
                className={`border rounded-xl p-3 flex items-center justify-between cursor-pointer transition-all ${
                  city === "outside"
                    ? "border-blue-600 bg-blue-50/50 ring-1 ring-blue-500"
                    : "border-slate-200 hover:border-slate-300"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <input
                    type="radio"
                    name="city"
                    value="outside"
                    checked={city === "outside"}
                    onChange={() => setCity("outside")}
                    className="text-blue-600"
                  />
                  <span className="text-sm font-semibold text-slate-800">
                    Outside City
                  </span>
                </div>
                <span className="text-xs font-bold text-slate-600">
                  {formatCurrency(outsideFee, currency)}
                </span>
              </label>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Full Shipping Address *
            </label>
            <textarea
              required
              rows={3}
              placeholder="House, Road, Area, Landmark"
              value={shippingAddress}
              onChange={(e) => setShippingAddress(e.target.value)}
              className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Order Notes (Optional)
            </label>
            <input
              type="text"
              placeholder="Special delivery instructions"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full border border-slate-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            />
          </div>
        </div>

        {/* Payment Methods */}
        <div className="bg-white border border-slate-200/80 rounded-2xl p-6 space-y-4">
          <h2 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-emerald-600" /> Payment Method
          </h2>

          <div className="space-y-3">
            <label
              className={`border rounded-xl p-4 flex items-center justify-between cursor-pointer transition-all ${
                paymentMethod === "COD"
                  ? "border-blue-600 bg-blue-50/40 ring-1 ring-blue-500"
                  : "border-slate-200 hover:border-slate-300"
              }`}
            >
              <div className="flex items-center gap-3">
                <input
                  type="radio"
                  name="payment"
                  value="COD"
                  checked={paymentMethod === "COD"}
                  onChange={() => setPaymentMethod("COD")}
                />
                <div>
                  <h4 className="text-sm font-bold text-slate-800">
                    Cash on Delivery (COD)
                  </h4>
                  <p className="text-xs text-slate-500">
                    Pay with cash when your package arrives at your door.
                  </p>
                </div>
              </div>
            </label>

            <label
              className={`border rounded-xl p-4 flex items-center justify-between cursor-pointer transition-all ${
                paymentMethod === "BKASH"
                  ? "border-blue-600 bg-blue-50/40 ring-1 ring-blue-500"
                  : "border-slate-200 hover:border-slate-300"
              }`}
            >
              <div className="flex items-center gap-3">
                <input
                  type="radio"
                  name="payment"
                  value="BKASH"
                  checked={paymentMethod === "BKASH"}
                  onChange={() => setPaymentMethod("BKASH")}
                />
                <div>
                  <h4 className="text-sm font-bold text-slate-800">
                    bKash / Digital Mobile Wallet
                  </h4>
                  <p className="text-xs text-slate-500">
                    Instant automated mobile payment gateway.
                  </p>
                </div>
              </div>
            </label>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white font-bold text-base rounded-2xl shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
        >
          {loading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" /> Placing Order...
            </>
          ) : (
            `Confirm Order (${formatCurrency(total, currency)})`
          )}
        </button>
      </form>

      {/* Order Summary & Coupon Card */}
      <div className="lg:col-span-5 space-y-6">
        <div className="bg-white border border-slate-200/80 rounded-2xl p-6 space-y-5">
          <h3 className="font-bold text-base text-slate-900 border-b border-slate-100 pb-3">
            Order Items ({items.length})
          </h3>

          <div className="divide-y divide-slate-100 max-h-72 overflow-y-auto pr-1">
            {items.map((item) => (
              <div key={item.id} className="py-3 flex items-center gap-3.5">
                <div className="relative w-14 h-14 rounded-lg overflow-hidden bg-slate-100 shrink-0 border border-slate-100">
                  <Image
                    src={item.image}
                    alt={item.name}
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-semibold text-slate-800 truncate">
                    {item.name}
                  </h4>
                  {item.variantTitle && (
                    <p className="text-xs text-slate-400">
                      {item.variantTitle}
                    </p>
                  )}
                  <p className="text-xs text-slate-500 mt-0.5">
                    Qty: {item.quantity} ×{" "}
                    {formatCurrency(item.price, currency)}
                  </p>
                </div>
                <span className="text-sm font-bold text-slate-900">
                  {formatCurrency(item.price * item.quantity, currency)}
                </span>
              </div>
            ))}
          </div>

          {/* Coupon Code Input */}
          <div className="pt-2 border-t border-slate-100">
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Tag className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                <input
                  type="text"
                  placeholder="Promo Code"
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value)}
                  className="w-full border border-slate-200 rounded-xl pl-9 pr-3 py-2 text-xs uppercase font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>
              <button
                type="button"
                onClick={handleApplyCoupon}
                disabled={validatingCoupon || !couponCode.trim()}
                className="px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-slate-800 disabled:opacity-40"
              >
                {validatingCoupon ? "..." : "Apply"}
              </button>
            </div>
            {coupon && (
              <p className="text-xs text-emerald-600 font-semibold mt-1.5 flex items-center gap-1">
                Coupon applied: {coupon.code} (-
                {formatCurrency(discount, currency)})
              </p>
            )}
          </div>

          {/* Cost Breakdown */}
          <div className="pt-4 border-t border-slate-100 space-y-2 text-sm">
            <div className="flex justify-between text-slate-600">
              <span>Subtotal</span>
              <span>{formatCurrency(subtotal, currency)}</span>
            </div>
            {discount > 0 && (
              <div className="flex justify-between text-emerald-600 font-semibold">
                <span>Discount</span>
                <span>-{formatCurrency(discount, currency)}</span>
              </div>
            )}
            <div className="flex justify-between text-slate-600">
              <span>
                Delivery Fee (
                {city === "inside" ? "Inside City" : "Outside City"})
              </span>
              <span>{formatCurrency(currentDeliveryFee, currency)}</span>
            </div>
            <div className="flex justify-between text-base font-extrabold text-slate-900 pt-2 border-t border-slate-100">
              <span>Total Amount</span>
              <span className="text-blue-600">
                {formatCurrency(total, currency)}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}


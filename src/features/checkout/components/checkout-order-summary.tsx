"use client";

import Image from "next/image";
import { CartItem, CouponDiscount } from "@/shared/types";
import { formatCurrency } from "@/shared/lib/utils";
import { Tag, Loader2, X } from "lucide-react";

interface CheckoutOrderSummaryProps {
  items: CartItem[];
  currency?: string;
  subtotal: number;
  discount: number;
  coupon: CouponDiscount | null;
  cityZone: "inside" | "outside" | null;
  deliveryFee: number;
  total: number;
  loading: boolean;
  couponCode: string;
  onCouponCodeChange: (val: string) => void;
  validatingCoupon: boolean;
  onApplyCoupon: (code: string) => void;
  onRemoveCoupon: () => void;
}

export function CheckoutOrderSummary({
  items,
  currency = "USD",
  subtotal,
  discount,
  coupon,
  cityZone,
  deliveryFee,
  total,
  loading,
  couponCode,
  onCouponCodeChange,
  validatingCoupon,
  onApplyCoupon,
  onRemoveCoupon,
}: CheckoutOrderSummaryProps) {
  return (
    <div className="bg-white border border-slate-200/80 rounded-2xl p-6 space-y-5 shadow-xs">
      <h3 className="font-bold text-base text-slate-900 border-b border-slate-100 pb-3">
        Order Items ({items.length})
      </h3>

      {/* Item list */}
      <div className="divide-y divide-slate-100 max-h-72 overflow-y-auto pr-1">
        {items.map((item) => (
          <div key={item.id} className="py-3 flex items-center gap-3.5">
            <div className="relative w-14 h-14 rounded-lg overflow-hidden bg-slate-100 shrink-0 border border-slate-100">
              <Image
                src={item.image}
                alt={item.name}
                fill
                sizes="56px"
                className="object-cover"
              />
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="text-sm font-semibold text-slate-800 truncate">
                {item.name}
              </h4>
              {item.variantTitle && (
                <p className="text-xs text-slate-400">{item.variantTitle}</p>
              )}
              <p className="text-xs text-slate-500 mt-0.5">
                Qty: {item.quantity} × {formatCurrency(item.price, currency)}
              </p>
            </div>
            <span className="text-sm font-bold text-slate-900">
              {formatCurrency(item.price * item.quantity, currency)}
            </span>
          </div>
        ))}
      </div>

      {/* Coupon section */}
      <div className="pt-2 border-t border-slate-100">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Tag className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
            <input
              type="text"
              disabled={validatingCoupon || loading}
              placeholder="Promo Code"
              value={couponCode}
              onChange={(e) => onCouponCodeChange(e.target.value)}
              className="w-full border border-slate-200 rounded-xl pl-9 pr-3 py-2 text-xs uppercase font-semibold focus:outline-none focus:ring-2 focus:ring-[var(--store-primary)]/20 disabled:bg-slate-50"
            />
          </div>
          <button
            type="button"
            onClick={() => onApplyCoupon(couponCode)}
            disabled={validatingCoupon || !couponCode.trim() || loading}
            className="px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-slate-800 disabled:opacity-40 cursor-pointer flex items-center gap-1.5 transition-colors"
          >
            {validatingCoupon ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              "Apply"
            )}
          </button>
        </div>

        {coupon && (
          <div className="mt-2 flex items-center justify-between text-xs text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-200">
            <span>
              Applied: <strong>{coupon.code}</strong> (-
              {formatCurrency(discount, currency)})
            </span>
            <button
              type="button"
              onClick={onRemoveCoupon}
              className="text-emerald-700 hover:text-rose-600 transition-colors p-0.5 cursor-pointer"
              title="Remove coupon"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>

      {/* Cost breakdown */}
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
            Delivery Fee{" "}
            {cityZone
              ? `(${cityZone === "inside" ? "Inside City" : "Outside City"})`
              : ""}
          </span>
          <span>
            {cityZone ? (
              formatCurrency(deliveryFee, currency)
            ) : (
              <span className="text-xs text-slate-400 italic">
                Select delivery zone
              </span>
            )}
          </span>
        </div>
        <div className="flex justify-between text-base font-extrabold text-slate-900 pt-2 border-t border-slate-100">
          <span>Total Amount</span>
          <span className="text-[var(--store-primary)]">
            {formatCurrency(total, currency)}
          </span>
        </div>
      </div>
    </div>
  );
}


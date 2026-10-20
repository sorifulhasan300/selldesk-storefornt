"use client";

import Image from "next/image";
import { CartItem, CouponDiscount, StorefrontCheckoutConfig } from "@/shared/types";
import { formatCurrency } from "@/shared/lib/utils";
import { Tag, Loader2, X } from "lucide-react";
import { Button } from "@/shared/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";
import { Input } from "@/shared/ui/input";
import { Separator } from "@/shared/ui/separator";

interface CheckoutOrderSummaryProps {
  items: CartItem[];
  currency?: string;
  subtotal: number;
  discount: number;
  coupon: CouponDiscount | null;
  cityZone: "inside" | "outside" | string | null;
  deliveryFee: number;
  total: number;
  loading: boolean;
  couponCode: string;
  onCouponCodeChange: (val: string) => void;
  validatingCoupon: boolean;
  onApplyCoupon: (code: string) => void;
  onRemoveCoupon: () => void;
  checkoutConfig?: StorefrontCheckoutConfig;
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
  checkoutConfig,
}: CheckoutOrderSummaryProps) {
  return (
    <Card>
      <CardHeader className="pb-4">
        <CardTitle>
          {`${checkoutConfig?.orderSummaryLabel || "Order Summary"} (${items.length})`}
        </CardTitle>
      </CardHeader>
      <Separator />
      <CardContent className="space-y-5 pt-6">
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
        {checkoutConfig?.showCoupon !== false && (
          <div className="pt-2 border-t border-slate-100">
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Tag className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                <Input
                  type="text"
                  disabled={validatingCoupon || loading}
                  placeholder={checkoutConfig?.couponLabel || "Promo Code"}
                  value={couponCode}
                  onChange={(e) => onCouponCodeChange(e.target.value)}
                  className="h-9 rounded-xl pl-9 pr-3 text-xs font-semibold uppercase"
                />
              </div>
              <Button
                size="sm"
                type="button"
                onClick={() => onApplyCoupon(couponCode)}
                disabled={validatingCoupon || !couponCode.trim() || loading}
                className="rounded-xl bg-slate-900 text-xs font-bold text-white hover:bg-slate-800"
              >
                {validatingCoupon ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  "Apply"
                )}
              </Button>
            </div>

            {coupon && (
              <div className="mt-2 flex items-center justify-between text-xs text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-200">
                <span>
                  Applied: <strong>{coupon.code}</strong> (-
                  {formatCurrency(discount, currency)})
                </span>
                <Button
                  aria-label="Remove coupon"
                  size="icon"
                  variant="ghost"
                  type="button"
                  onClick={onRemoveCoupon}
                  className="size-7 text-emerald-700 hover:text-rose-600"
                  title="Remove coupon"
                >
                  <X className="size-3.5" />
                </Button>
              </div>
            )}
          </div>
        )}

        {/* Cost breakdown */}
        <Separator />
        <div className="space-y-2 text-sm">
          <div className="flex justify-between text-slate-600">
            <span>{checkoutConfig?.subtotalLabel || "Subtotal"}</span>
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
              {checkoutConfig?.deliveryChargeLabel || "Delivery Fee"}{" "}
              {cityZone
                ? `(${cityZone === "inside" ? "Inside City" : cityZone === "outside" ? "Outside City" : cityZone})`
                : ""}
            </span>
            <span>
              {cityZone ? (
                deliveryFee === 0 ? (
                  <span className="font-bold text-emerald-600">FREE</span>
                ) : (
                  formatCurrency(deliveryFee, currency)
                )
              ) : (
                <span className="text-xs text-slate-400 italic">
                  Select delivery zone
                </span>
              )}
            </span>
          </div>
          <Separator className="my-3" />
          <div className="flex justify-between text-base font-extrabold text-slate-900">
            <span>{checkoutConfig?.totalLabel || "Total Amount"}</span>
            <span className="text-(--store-primary)">
              {formatCurrency(total, currency)}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

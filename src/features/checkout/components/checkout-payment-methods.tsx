"use client";

import { ShieldCheck } from "lucide-react";
import { cn } from "@/shared/lib/utils";
import { Card } from "@/shared/ui/card";

interface CheckoutPaymentMethodsProps {
  paymentMethod: string;
  onPaymentMethodChange: (method: string) => void;
  disabled?: boolean;
}

export function CheckoutPaymentMethods({
  paymentMethod,
  onPaymentMethodChange,
  disabled,
}: CheckoutPaymentMethodsProps) {
  return (
    <Card className="space-y-4 p-6">
      <h2 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
        <ShieldCheck className="w-5 h-5 text-emerald-600" />
        <span>Payment Method</span>
      </h2>

      <div className="space-y-3">
        <label className="block cursor-pointer">
          <Card
            className={cn(
              "flex items-center justify-between rounded-xl p-4 transition-all focus-within:ring-2 focus-within:ring-(--store-primary)/30",
              paymentMethod === "COD"
                ? "border-(--store-primary) bg-(--store-primary)/10 ring-1 ring-(--store-primary)"
                : "hover:border-slate-300",
              disabled && "cursor-not-allowed opacity-50",
            )}
          >
            <div className="flex items-center gap-3">
              <input
                type="radio"
                name="payment"
                value="COD"
                disabled={disabled}
                checked={paymentMethod === "COD"}
                onChange={() => onPaymentMethodChange("COD")}
                className="sr-only"
              />
              <div>
                <h4 className="text-sm font-bold text-slate-800">
                  Cash on Delivery (COD)
                </h4>
                <p className="text-xs text-slate-500">
                  Pay in cash when your order arrives safely at your doorstep.
                </p>
              </div>
            </div>
          </Card>
        </label>

        <label className="block cursor-pointer">
          <Card
            className={cn(
              "flex items-center justify-between rounded-xl p-4 transition-all focus-within:ring-2 focus-within:ring-(--store-primary)/30",
              paymentMethod === "BKASH"
                ? "border-(--store-primary) bg-(--store-primary)/10 ring-1 ring-(--store-primary)"
                : "hover:border-slate-300",
              disabled && "cursor-not-allowed opacity-50",
            )}
          >
            <div className="flex items-center gap-3">
              <input
                type="radio"
                name="payment"
                value="BKASH"
                disabled={disabled}
                checked={paymentMethod === "BKASH"}
                onChange={() => onPaymentMethodChange("BKASH")}
                className="sr-only"
              />
              <div>
                <h4 className="text-sm font-bold text-slate-800">
                  bKash / Mobile Wallet
                </h4>
                <p className="text-xs text-slate-500">
                  Instant digital mobile wallet checkout.
                </p>
              </div>
            </div>
          </Card>
        </label>
      </div>
    </Card>
  );
}

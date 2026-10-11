"use client";

import { ShieldCheck } from "lucide-react";
import { cn } from "@/shared/lib/utils";

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
    <div className="bg-white border border-slate-200/80 rounded-2xl p-6 space-y-4 shadow-xs">
      <h2 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
        <ShieldCheck className="w-5 h-5 text-emerald-600" />
        <span>Payment Method</span>
      </h2>

      <div className="space-y-3">
        <label
          className={cn(
            "border rounded-xl p-4 flex items-center justify-between cursor-pointer transition-all",
            paymentMethod === "COD"
              ? "border-[var(--store-primary)] bg-[var(--store-primary)]/10 ring-1 ring-[var(--store-primary)]"
              : "border-slate-200 hover:border-slate-300",
            disabled && "opacity-50 cursor-not-allowed",
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
              className="accent-[var(--store-primary)] text-[var(--store-primary)] cursor-pointer"
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
        </label>

        <label
          className={cn(
            "border rounded-xl p-4 flex items-center justify-between cursor-pointer transition-all",
            paymentMethod === "BKASH"
              ? "border-[var(--store-primary)] bg-[var(--store-primary)]/10 ring-1 ring-[var(--store-primary)]"
              : "border-slate-200 hover:border-slate-300",
            disabled && "opacity-50 cursor-not-allowed",
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
              className="accent-[var(--store-primary)] text-[var(--store-primary)] cursor-pointer"
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
        </label>
      </div>
    </div>
  );
}


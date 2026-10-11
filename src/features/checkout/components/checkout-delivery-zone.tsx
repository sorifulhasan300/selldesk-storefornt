"use client";

import { formatCurrency, cn } from "@/shared/lib/utils";
import { Card } from "@/shared/ui/card";

interface CheckoutDeliveryZoneProps {
  cityZone: "inside" | "outside" | null;
  onZoneSelect: (zone: "inside" | "outside") => void;
  insideFee: number;
  outsideFee: number;
  currency?: string;
  errorMessage?: string;
  disabled?: boolean;
}

export function CheckoutDeliveryZone({
  cityZone,
  onZoneSelect,
  insideFee,
  outsideFee,
  currency = "USD",
  errorMessage,
  disabled,
}: CheckoutDeliveryZoneProps) {
  return (
    <Card className="space-y-4 p-6">
      <div>
        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
          Delivery Area / Zone *
        </label>
        <p className="text-xs text-slate-500">
          Select your shipping destination to calculate accurate delivery charges.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <label
          htmlFor="delivery-zone-inside"
          className={cn(
            "flex cursor-pointer items-center justify-between rounded-xl border p-4 transition-all focus-within:ring-2 focus-within:ring-(--store-primary)/30",
            cityZone === "inside"
              ? "border-(--store-primary) bg-(--store-primary)/10 ring-1 ring-(--store-primary)"
              : "border-slate-200 hover:border-slate-300",
            disabled && "opacity-50 cursor-not-allowed",
          )}
        >
          <div className="flex items-center gap-2.5">
            <input
              id="delivery-zone-inside"
              type="radio"
              name="delivery-zone"
              value="inside"
              disabled={disabled}
              checked={cityZone === "inside"}
              onChange={() => onZoneSelect("inside")}
              className="sr-only"
            />
            <span className="text-sm font-semibold text-slate-800">
              Inside City
            </span>
          </div>
          <span className="text-xs font-bold text-slate-700">
            {formatCurrency(insideFee, currency)}
          </span>
        </label>

        <label
          htmlFor="delivery-zone-outside"
          className={cn(
            "flex cursor-pointer items-center justify-between rounded-xl border p-4 transition-all focus-within:ring-2 focus-within:ring-(--store-primary)/30",
            cityZone === "outside"
              ? "border-(--store-primary) bg-(--store-primary)/10 ring-1 ring-(--store-primary)"
              : "border-slate-200 hover:border-slate-300",
            disabled && "opacity-50 cursor-not-allowed",
          )}
        >
          <div className="flex items-center gap-2.5">
            <input
              id="delivery-zone-outside"
              type="radio"
              name="delivery-zone"
              value="outside"
              disabled={disabled}
              checked={cityZone === "outside"}
              onChange={() => onZoneSelect("outside")}
              className="sr-only"
            />
            <span className="text-sm font-semibold text-slate-800">
              Outside City
            </span>
          </div>
          <span className="text-xs font-bold text-slate-700">
            {formatCurrency(outsideFee, currency)}
          </span>
        </label>
      </div>

      {errorMessage && (
        <p className="text-xs text-rose-600 font-semibold">{errorMessage}</p>
      )}
    </Card>
  );
}

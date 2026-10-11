"use client";

import { formatCurrency, cn } from "@/shared/lib/utils";

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
    <div className="bg-white border border-slate-200/80 rounded-2xl p-6 space-y-4 shadow-xs">
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
          className={cn(
            "border rounded-xl p-4 flex items-center justify-between cursor-pointer transition-all",
            cityZone === "inside"
              ? "border-[var(--store-primary)] bg-[var(--store-primary)]/10 ring-1 ring-[var(--store-primary)]"
              : "border-slate-200 hover:border-slate-300",
            disabled && "opacity-50 cursor-not-allowed",
          )}
        >
          <div className="flex items-center gap-2.5">
            <input
              type="radio"
              name="delivery-zone"
              value="inside"
              disabled={disabled}
              checked={cityZone === "inside"}
              onChange={() => onZoneSelect("inside")}
              className="accent-[var(--store-primary)] text-[var(--store-primary)] cursor-pointer"
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
          className={cn(
            "border rounded-xl p-4 flex items-center justify-between cursor-pointer transition-all",
            cityZone === "outside"
              ? "border-[var(--store-primary)] bg-[var(--store-primary)]/10 ring-1 ring-[var(--store-primary)]"
              : "border-slate-200 hover:border-slate-300",
            disabled && "opacity-50 cursor-not-allowed",
          )}
        >
          <div className="flex items-center gap-2.5">
            <input
              type="radio"
              name="delivery-zone"
              value="outside"
              disabled={disabled}
              checked={cityZone === "outside"}
              onChange={() => onZoneSelect("outside")}
              className="accent-[var(--store-primary)] text-[var(--store-primary)] cursor-pointer"
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
    </div>
  );
}


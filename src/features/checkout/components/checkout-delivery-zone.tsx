"use client";

import { formatCurrency, cn } from "@/shared/lib/utils";
import { Card } from "@/shared/ui/card";
import { DeliveryZone } from "@/shared/types";
import { BANGLADESH_DISTRICTS } from "../constants/districts";
import { Sparkles, MapPin, CheckCircle2 } from "lucide-react";

interface CheckoutDeliveryZoneProps {
  cityZone: string | null;
  onZoneSelect: (zone: string) => void;
  insideFee?: number;
  outsideFee?: number;
  currency?: string;
  errorMessage?: string;
  disabled?: boolean;
  // Dynamic zones & district support:
  district?: string;
  onDistrictChange?: (district: string) => void;
  zones?: DeliveryZone[];
  isFreeDelivery?: boolean;
}

export function CheckoutDeliveryZone({
  cityZone,
  onZoneSelect,
  insideFee = 60,
  outsideFee = 120,
  currency = "USD",
  errorMessage,
  disabled,
  district = "Dhaka",
  onDistrictChange,
  zones,
  isFreeDelivery = false,
}: CheckoutDeliveryZoneProps) {
  const displayZones: DeliveryZone[] =
    zones && zones.length > 0
      ? zones
      : [
          {
            name: "Inside Dhaka",
            charge: insideFee,
            districts: ["Dhaka"],
          },
          {
            name: "Outside Dhaka",
            charge: outsideFee,
            districts: [],
          },
        ];

  return (
    <Card className="space-y-4 p-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
            Delivery Area / Zone *
          </label>
          <p className="text-xs text-slate-500">
            Select your district or delivery zone to calculate shipping charges.
          </p>
        </div>

        {isFreeDelivery && (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 shrink-0">
            <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
            <span>Free Delivery Applied</span>
          </span>
        )}
      </div>

      {/* Free Delivery Congratulatory Banner */}
      {isFreeDelivery && (
        <div className="rounded-xl bg-emerald-500/10 border border-emerald-500/20 p-3 flex items-center gap-3">
          <div className="size-8 rounded-lg bg-emerald-500/20 text-emerald-600 flex items-center justify-center shrink-0">
            <CheckCircle2 className="size-4" />
          </div>
          <div>
            <p className="text-xs font-semibold text-emerald-900">
              Free Delivery Unlocked!
            </p>
            <p className="text-[11px] text-emerald-700">
              Your cart qualifies for free shipping. Delivery fee is ৳0.
            </p>
          </div>
        </div>
      )}

      {/* District Dropdown Selector */}
      {onDistrictChange && (
        <div className="space-y-1.5">
          <label
            htmlFor="delivery-district-select"
            className="block text-xs font-semibold text-slate-700 flex items-center gap-1.5"
          >
            <MapPin className="size-3.5 text-slate-400" />
            <span>Select Your District</span>
          </label>
          <div className="relative">
            <select
              id="delivery-district-select"
              value={district}
              disabled={disabled}
              onChange={(e) => onDistrictChange(e.target.value)}
              className="w-full h-10 px-3 pr-8 rounded-xl border border-slate-200 bg-white text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-(--store-primary)/30 focus:border-(--store-primary) disabled:opacity-50 transition-all cursor-pointer"
            >
              <option value="">-- Choose District --</option>
              {BANGLADESH_DISTRICTS.map((dist) => (
                <option key={dist} value={dist}>
                  {dist}
                </option>
              ))}
            </select>
          </div>
        </div>
      )}

      {/* Dynamic Zone Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {displayZones.map((zone) => {
          const isSelected =
            cityZone?.toLowerCase() === zone.name.toLowerCase() ||
            (cityZone === "inside" && /inside/i.test(zone.name)) ||
            (cityZone === "outside" && /outside/i.test(zone.name));

          return (
            <label
              key={zone.name}
              htmlFor={`delivery-zone-${zone.name.toLowerCase().replace(/\s+/g, "-")}`}
              className={cn(
                "flex cursor-pointer items-center justify-between rounded-xl border p-4 transition-all focus-within:ring-2 focus-within:ring-(--store-primary)/30",
                isSelected
                  ? "border-(--store-primary) bg-(--store-primary)/10 ring-1 ring-(--store-primary)"
                  : "border-slate-200 hover:border-slate-300 bg-white",
                disabled && "opacity-50 cursor-not-allowed",
              )}
            >
              <div className="flex items-center gap-2.5">
                <input
                  id={`delivery-zone-${zone.name.toLowerCase().replace(/\s+/g, "-")}`}
                  type="radio"
                  name="delivery-zone"
                  value={zone.name}
                  disabled={disabled}
                  checked={isSelected}
                  onChange={() => onZoneSelect(zone.name)}
                  className="sr-only"
                />
                <div>
                  <span className="text-sm font-semibold text-slate-800 block">
                    {zone.name}
                  </span>
                  {zone.districts && zone.districts.length > 0 && (
                    <span className="text-[11px] text-slate-400 block mt-0.5 truncate max-w-[140px]">
                      {zone.districts.join(", ")}
                    </span>
                  )}
                </div>
              </div>

              <div className="text-right">
                {isFreeDelivery ? (
                  <div className="flex flex-col items-end">
                    <span className="text-xs font-bold text-emerald-600">
                      FREE
                    </span>
                    <span className="text-[10px] text-slate-400 line-through">
                      {formatCurrency(zone.charge, currency)}
                    </span>
                  </div>
                ) : (
                  <span className="text-xs font-bold text-slate-700">
                    {formatCurrency(zone.charge, currency)}
                  </span>
                )}
              </div>
            </label>
          );
        })}
      </div>

      {errorMessage && (
        <p className="text-xs text-rose-600 font-semibold">{errorMessage}</p>
      )}
    </Card>
  );
}

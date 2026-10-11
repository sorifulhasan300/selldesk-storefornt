"use client";

import { Truck } from "lucide-react";

interface CheckoutCustomerFieldsProps {
  customerName: string;
  onCustomerNameChange: (val: string) => void;
  customerPhone: string;
  onCustomerPhoneChange: (val: string) => void;
  shippingAddress: string;
  onShippingAddressChange: (val: string) => void;
  notes: string;
  onNotesChange: (val: string) => void;
  fieldErrors: Record<string, string>;
  disabled?: boolean;
}

export function CheckoutCustomerFields({
  customerName,
  onCustomerNameChange,
  customerPhone,
  onCustomerPhoneChange,
  shippingAddress,
  onShippingAddressChange,
  notes,
  onNotesChange,
  fieldErrors,
  disabled,
}: CheckoutCustomerFieldsProps) {
  return (
    <div className="bg-white border border-slate-200/80 rounded-2xl p-6 space-y-5 shadow-xs">
      <h2 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
        <Truck className="w-5 h-5 text-[var(--store-primary)]" />
        <span>Shipping & Customer Details</span>
      </h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
            Full Name *
          </label>
          <input
            required
            type="text"
            disabled={disabled}
            placeholder="e.g. John Doe"
            value={customerName}
            onChange={(e) => onCustomerNameChange(e.target.value)}
            className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--store-primary)]/20 disabled:bg-slate-50"
          />
          {fieldErrors.customerName && (
            <p className="text-xs text-rose-600 mt-1">{fieldErrors.customerName}</p>
          )}
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
            Phone Number *
          </label>
          <input
            required
            type="tel"
            disabled={disabled}
            placeholder="e.g. 01712345678"
            value={customerPhone}
            onChange={(e) => onCustomerPhoneChange(e.target.value)}
            className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--store-primary)]/20 disabled:bg-slate-50"
          />
          {fieldErrors.customerPhone && (
            <p className="text-xs text-rose-600 mt-1">{fieldErrors.customerPhone}</p>
          )}
        </div>
      </div>

      <div>
        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
          Full Shipping Address *
        </label>
        <textarea
          required
          rows={3}
          disabled={disabled}
          placeholder="House, Road, Area, Landmark"
          value={shippingAddress}
          onChange={(e) => onShippingAddressChange(e.target.value)}
          className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--store-primary)]/20 disabled:bg-slate-50"
        />
        {fieldErrors.shippingAddress && (
          <p className="text-xs text-rose-600 mt-1">{fieldErrors.shippingAddress}</p>
        )}
      </div>

      <div>
        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
          Order Notes (Optional)
        </label>
        <input
          type="text"
          disabled={disabled}
          placeholder="Special delivery instructions"
          value={notes}
          onChange={(e) => onNotesChange(e.target.value)}
          className="w-full border border-slate-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--store-primary)]/20 disabled:bg-slate-50"
        />
        {fieldErrors.notes && (
          <p className="text-xs text-rose-600 mt-1">{fieldErrors.notes}</p>
        )}
      </div>
    </div>
  );
}


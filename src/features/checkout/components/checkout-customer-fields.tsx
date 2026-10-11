"use client";

import { Truck } from "lucide-react";
import { Card } from "@/shared/ui/card";
import { Input } from "@/shared/ui/input";
import { Textarea } from "@/shared/ui/textarea";

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
    <Card className="space-y-5 p-6">
      <h2 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
        <Truck className="w-5 h-5 text-(--store-primary)" />
        <span>Shipping & Customer Details</span>
      </h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label htmlFor="customer-name" className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
            Full Name *
          </label>
          <Input
            id="customer-name"
            required
            type="text"
            disabled={disabled}
            placeholder="e.g. John Doe"
            value={customerName}
            onChange={(e) => onCustomerNameChange(e.target.value)}
            aria-invalid={Boolean(fieldErrors.customerName)}
            aria-describedby={fieldErrors.customerName ? "customer-name-error" : undefined}
          />
          {fieldErrors.customerName && (
            <p id="customer-name-error" className="text-xs text-rose-600 mt-1">{fieldErrors.customerName}</p>
          )}
        </div>

        <div>
          <label htmlFor="customer-phone" className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
            Phone Number *
          </label>
          <Input
            id="customer-phone"
            required
            type="tel"
            disabled={disabled}
            placeholder="e.g. 01712345678"
            value={customerPhone}
            onChange={(e) => onCustomerPhoneChange(e.target.value)}
            aria-invalid={Boolean(fieldErrors.customerPhone)}
            aria-describedby={fieldErrors.customerPhone ? "customer-phone-error" : undefined}
          />
          {fieldErrors.customerPhone && (
            <p id="customer-phone-error" className="text-xs text-rose-600 mt-1">{fieldErrors.customerPhone}</p>
          )}
        </div>
      </div>

      <div>
        <label htmlFor="shipping-address" className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
          Full Shipping Address *
        </label>
        <Textarea
          id="shipping-address"
          required
          rows={3}
          disabled={disabled}
          placeholder="House, Road, Area, Landmark"
          value={shippingAddress}
          onChange={(e) => onShippingAddressChange(e.target.value)}
          aria-invalid={Boolean(fieldErrors.shippingAddress)}
          aria-describedby={fieldErrors.shippingAddress ? "shipping-address-error" : undefined}
        />
        {fieldErrors.shippingAddress && (
          <p id="shipping-address-error" className="text-xs text-rose-600 mt-1">{fieldErrors.shippingAddress}</p>
        )}
      </div>

      <div>
        <label htmlFor="order-notes" className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
          Order Notes (Optional)
        </label>
        <Textarea
          id="order-notes"
          rows={2}
          disabled={disabled}
          placeholder="Special delivery instructions"
          value={notes}
          onChange={(e) => onNotesChange(e.target.value)}
          aria-invalid={Boolean(fieldErrors.notes)}
          aria-describedby={fieldErrors.notes ? "order-notes-error" : undefined}
        />
        {fieldErrors.notes && (
          <p id="order-notes-error" className="text-xs text-rose-600 mt-1">{fieldErrors.notes}</p>
        )}
      </div>
    </Card>
  );
}

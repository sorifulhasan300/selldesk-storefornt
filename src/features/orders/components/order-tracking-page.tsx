"use client";

import { useState, type FormEvent } from "react";
import type { OrderTrackingDetails } from "../services/order-tracking.service";
import { orderTrackingService } from "../services/order-tracking.service";

export function OrderTrackingPage({ storeSlug }: { storeSlug: string }) {
  const [orderNumber, setOrderNumber] = useState("");
  const [phone, setPhone] = useState("");
  const [tracking, setTracking] = useState<OrderTrackingDetails | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError("");
    setTracking(null);
    try {
      setTracking(
        await orderTrackingService.track(
          storeSlug,
          orderNumber.trim(),
          phone.trim(),
        ),
      );
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "We could not find an order matching those details.",
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="mx-auto max-w-lg space-y-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
      <div>
        <h1 className="text-2xl font-black text-slate-900">Track your order</h1>
        <p className="mt-2 text-sm text-slate-600">
          Enter your order number and the phone number used at checkout.
        </p>
      </div>
      <form onSubmit={submit} className="space-y-4">
        <label className="block space-y-1.5 text-sm font-medium text-slate-700">
          Order number
          <input
            required
            maxLength={80}
            value={orderNumber}
            onChange={(event) => setOrderNumber(event.target.value)}
            className="h-11 w-full rounded-lg border border-slate-300 px-3 text-sm outline-none focus:border-(--store-primary) focus:ring-2 focus:ring-(--store-primary)/20"
          />
        </label>
        <label className="block space-y-1.5 text-sm font-medium text-slate-700">
          Mobile number
          <input
            type="tel"
            autoComplete="tel"
            required
            value={phone}
            onChange={(event) => setPhone(event.target.value)}
            placeholder="017XXXXXXXX"
            className="h-11 w-full rounded-lg border border-slate-300 px-3 text-sm outline-none focus:border-(--store-primary) focus:ring-2 focus:ring-(--store-primary)/20"
          />
        </label>
        {error && (
          <p role="alert" className="text-sm text-rose-600">
            {error}
          </p>
        )}
        <button
          type="submit"
          disabled={busy}
          className="w-full rounded-lg bg-(--store-primary) px-4 py-3 text-sm font-bold text-white hover:opacity-90 disabled:opacity-60"
        >
          {busy ? "Checking..." : "Find my order"}
        </button>
      </form>

      {tracking && (
        <div
          role="status"
          className="space-y-3 rounded-xl border border-slate-200 bg-slate-50 p-4"
        >
          <p className="font-bold text-slate-900">
            Order {tracking.invoiceNo ?? orderNumber}
          </p>
          <dl className="grid grid-cols-2 gap-x-4 gap-y-3 text-sm">
            <dt className="text-slate-500">Order status</dt>
            <dd className="text-right font-semibold text-slate-800">
              {tracking.orderStatus.replaceAll("_", " ")}
            </dd>
            <dt className="text-slate-500">Payment status</dt>
            <dd className="text-right font-semibold text-slate-800">
              {tracking.paymentStatus.replaceAll("_", " ")}
            </dd>
            {(tracking.trackingCode || tracking.consignmentId) && (
              <>
                <dt className="text-slate-500">Tracking reference</dt>
                <dd className="text-right font-semibold text-slate-800">
                  {tracking.trackingCode ?? tracking.consignmentId}
                </dd>
              </>
            )}
          </dl>
        </div>
      )}
    </section>
  );
}

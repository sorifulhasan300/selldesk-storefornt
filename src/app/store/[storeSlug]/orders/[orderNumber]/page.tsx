import Link from "next/link";
import { CheckCircle2, ArrowRight, Package, Truck } from "lucide-react";

interface OrderConfirmationProps {
  params: Promise<{ storeSlug: string; orderNumber: string }>;
}

export default async function OrderConfirmationPage({
  params,
}: OrderConfirmationProps) {
  const { orderNumber } = await params;

  return (
    <div className="py-12 max-w-lg mx-auto text-center space-y-6">
      <div className="w-20 h-20 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto shadow-sm">
        <CheckCircle2 className="w-10 h-10" />
      </div>

      <div className="space-y-2">
        <span className="text-xs uppercase font-extrabold tracking-wider text-emerald-600">
          Order Confirmed
        </span>
        <h1 className="text-3xl font-black text-slate-900">
          Thank you for your order!
        </h1>
        <p className="text-sm text-slate-500">
          We have received your order and are currently preparing it for
          shipment.
        </p>
      </div>

      <div className="bg-white border border-slate-200/80 rounded-2xl p-6 text-left space-y-4 shadow-xs">
        <div className="flex justify-between items-center pb-3 border-b border-slate-100">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
            Order Reference
          </span>
          <span className="font-mono font-bold text-slate-900 text-sm">
            #{orderNumber}
          </span>
        </div>

        <div className="flex items-start gap-3">
          <Truck className="w-5 h-5 text-[var(--store-primary)] shrink-0 mt-0.5" />
          <div className="text-xs text-slate-600">
            <p className="font-bold text-slate-800">
              Estimated Delivery: 2-3 Business Days
            </p>
            <p className="text-slate-400 mt-0.5">
              You will receive an SMS confirmation once the rider is dispatched.
            </p>
          </div>
        </div>

        <div className="flex items-start gap-3">
          <Package className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div className="text-xs text-slate-600">
            <p className="font-bold text-slate-800">Payment on Delivery</p>
            <p className="text-slate-400 mt-0.5">
              Please have the exact cash amount or mobile payment ready upon
              receipt.
            </p>
          </div>
        </div>
      </div>

      <div className="pt-4 flex flex-col sm:flex-row gap-3">
        <Link
          href="/products"
          className="flex-1 py-3 px-4 bg-slate-900 hover:bg-slate-800 text-white font-bold text-sm rounded-xl flex items-center justify-center gap-2 transition-colors"
        >
          <span>Continue Shopping</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
}

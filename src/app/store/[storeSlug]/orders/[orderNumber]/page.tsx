import Link from "next/link";
import { CheckCircle2, ArrowRight, Package, Truck } from "lucide-react";
import { Badge } from "@/shared/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";
import { Separator } from "@/shared/ui/separator";

interface OrderConfirmationProps {
  params: Promise<{ storeSlug: string; orderNumber: string }>;
}

export default async function OrderConfirmationPage({
  params,
}: OrderConfirmationProps) {
  const { orderNumber } = await params;

  return (
    <div className="w-full mx-auto px-4 sm:px-6 lg:px-8 max-w-[var(--store-content-max-w,1200px)] py-6">
      <div className="py-12 max-w-lg mx-auto text-center space-y-6">
        <div className="w-20 h-20 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto shadow-sm">
          <CheckCircle2 className="w-10 h-10" />
        </div>

        <div className="space-y-2">
          <Badge variant="secondary" className="bg-emerald-50 text-emerald-700">
            Order Confirmed
          </Badge>
          <h1 className="text-3xl font-black text-slate-900">
            Thank you for your order!
          </h1>
          <p className="text-sm text-slate-500">
            We have received your order and are currently preparing it for
            shipment.
          </p>
        </div>

        <Card className="text-left">
          <CardHeader className="pb-4">
            <CardTitle>Order Details</CardTitle>
          </CardHeader>
          <Separator />
          <CardContent className="space-y-4 pt-6">
            <div className="flex items-center justify-between pb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Order Reference
              </span>
              <span className="font-mono text-sm font-bold text-slate-900">
                #{orderNumber}
              </span>
            </div>
            <div className="flex items-start gap-3">
              <Truck className="mt-0.5 h-5 w-5 shrink-0 text-(--store-primary)" />
              <div className="text-xs text-slate-600">
                <p className="font-bold text-slate-800">
                  Estimated Delivery: 2-3 Business Days
                </p>
                <p className="mt-0.5 text-slate-400">
                  You will receive an SMS confirmation once the rider is dispatched.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Package className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" />
              <div className="text-xs text-slate-600">
                <p className="font-bold text-slate-800">Payment on Delivery</p>
                <p className="mt-0.5 text-slate-400">
                  Please have the exact cash amount or mobile payment ready upon
                  receipt.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

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
    </div>
  );
}

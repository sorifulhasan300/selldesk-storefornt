import { Truck, ShieldCheck, RefreshCcw } from "lucide-react";

export function ProductTrustBadges() {
  return (
    <div className="grid grid-cols-3 gap-3 pt-6 border-t border-slate-100 text-center">
      <div className="p-3 rounded-xl bg-white border border-slate-100 flex flex-col items-center">
        <Truck className="w-5 h-5 text-[var(--store-primary)] mb-1" />
        <span className="text-[11px] font-bold text-slate-800">
          Fast Delivery
        </span>
      </div>
      <div className="p-3 rounded-xl bg-white border border-slate-100 flex flex-col items-center">
        <ShieldCheck className="w-5 h-5 text-emerald-600 mb-1" />
        <span className="text-[11px] font-bold text-slate-800">
          Authentic Quality
        </span>
      </div>
      <div className="p-3 rounded-xl bg-white border border-slate-100 flex flex-col items-center">
        <RefreshCcw className="w-5 h-5 text-amber-600 mb-1" />
        <span className="text-[11px] font-bold text-slate-800">
          7 Days Return
        </span>
      </div>
    </div>
  );
}


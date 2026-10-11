import Link from "next/link";
import { PackageX, ArrowLeft, Home } from "lucide-react";

export default function TenantNotFound() {
  return (
    <div className="py-20 px-4 flex flex-col items-center justify-center text-center">
      <div className="max-w-md w-full bg-white border border-slate-200/80 rounded-3xl p-8 sm:p-10 shadow-xs space-y-6">
        <div className="w-16 h-16 rounded-2xl bg-slate-100 text-slate-600 flex items-center justify-center mx-auto shadow-xs">
          <PackageX className="w-8 h-8" />
        </div>

        <div className="space-y-2">
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Item or Page Not Found
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
            The requested product, category, or page could not be found or may have been removed.
          </p>
        </div>

        <div className="pt-2 flex flex-col sm:flex-row gap-3">
          <Link
            href="/products"
            className="flex-1 py-3 px-4 bg-[var(--store-primary)] hover:opacity-90 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 transition-all shadow-xs"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Browse Products</span>
          </Link>
          <Link
            href="/"
            className="flex-1 py-3 px-4 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs rounded-xl flex items-center justify-center gap-2 transition-colors"
          >
            <Home className="w-4 h-4" />
            <span>Store Home</span>
          </Link>
        </div>
      </div>
    </div>
  );
}


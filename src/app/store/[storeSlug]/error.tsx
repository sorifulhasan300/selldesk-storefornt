"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertTriangle, RefreshCw, Home } from "lucide-react";

interface TenantErrorProps {
  error: Error & { digest?: string; code?: string; status?: number };
  reset: () => void;
}

export default function TenantError({ error, reset }: TenantErrorProps) {
  useEffect(() => {
    // Structured error logging without leaking raw sensitive data
    if (process.env.NODE_ENV === "development") {
      console.error("[TenantError]", error);
    }
  }, [error]);

  const isNetworkOrTimeout =
    error.name === "TimeoutError" ||
    error.message?.toLowerCase().includes("timeout") ||
    error.message?.toLowerCase().includes("network");

  const title = isNetworkOrTimeout
    ? "Temporary Connection Issue"
    : "Something went wrong";

  const message = isNetworkOrTimeout
    ? "We were unable to connect to the store servers. Please check your connection and try again."
    : "An unexpected error occurred while loading this page. Our team has been notified.";

  return (
    <div className="py-16 px-4 flex flex-col items-center justify-center text-center">
      <div className="max-w-md w-full bg-white border border-slate-200/80 rounded-3xl p-8 sm:p-10 shadow-xs space-y-6">
        <div className="w-16 h-16 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto shadow-xs">
          <AlertTriangle className="w-8 h-8" />
        </div>

        <div className="space-y-2">
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            {title}
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
            {message}
          </p>
        </div>

        <div className="pt-2 flex flex-col sm:flex-row gap-3">
          <button
            onClick={() => reset()}
            className="flex-1 py-3 px-4 bg-[var(--store-primary)] hover:opacity-90 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer shadow-xs active:scale-95"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Try Again</span>
          </button>
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


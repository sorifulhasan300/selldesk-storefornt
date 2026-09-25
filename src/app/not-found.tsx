import Link from "next/link";
import { Store, ArrowRight } from "lucide-react";

export default function GlobalNotFound() {
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-3xl p-8 border border-slate-200 text-center shadow-sm">
        <div className="w-16 h-16 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto mb-4">
          <Store className="w-8 h-8" />
        </div>
        <h1 className="text-2xl font-black text-slate-900">Store Not Found</h1>
        <p className="text-sm text-slate-500 mt-2">
          The requested store domain or path does not exist or may have been
          deactivated.
        </p>
        <div className="mt-6 pt-6 border-t border-slate-100 flex flex-col gap-3">
          <Link
            href="http://selldesk.test:3002"
            className="w-full py-3 px-4 bg-slate-900 hover:bg-slate-800 text-white font-bold text-sm rounded-xl flex items-center justify-center gap-2 transition-colors"
          >
            Visit SellDesk Platform <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}

"use client";

import { LayoutGrid } from "lucide-react";

interface SectionEmptyPlaceholderProps {
  itemType: string;
}

export function SectionEmptyPlaceholder({
  itemType,
}: SectionEmptyPlaceholderProps) {
  return (
    <button
      type="button"
      className="flex min-h-40 w-full flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-slate-300 bg-slate-50/80 px-6 py-8 text-center transition-colors hover:border-sky-400 hover:bg-sky-50/70 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-500"
    >
      <span className="flex size-12 items-center justify-center rounded-xl bg-white text-sky-600 shadow-sm ring-1 ring-slate-200">
        <LayoutGrid className="size-6" aria-hidden="true" />
      </span>
      <span className="space-y-1">
        <span className="block text-sm font-semibold text-slate-800">
          No {itemType.toLowerCase()} items yet
        </span>
        <span className="block text-sm text-slate-500">
          Click to configure {itemType.toLowerCase()} items in the sidebar
          inspector.
        </span>
      </span>
    </button>
  );
}

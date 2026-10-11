import type { TextareaHTMLAttributes } from "react";

import { cn } from "@/shared/lib/utils";

export interface TextareaProps
  extends TextareaHTMLAttributes<HTMLTextAreaElement> {}

export function Textarea({ className, ...props }: TextareaProps) {
  return (
    <textarea
      className={cn(
        "flex min-h-20 w-full rounded-md border border-slate-200 bg-transparent px-3 py-2 text-sm shadow-xs outline-none transition-colors placeholder:text-slate-400 focus-visible:border-[var(--store-primary)] focus-visible:ring-2 focus-visible:ring-[var(--store-primary)]/25 disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-red-600 aria-invalid:ring-2 aria-invalid:ring-red-600/20",
        className,
      )}
      {...props}
    />
  );
}

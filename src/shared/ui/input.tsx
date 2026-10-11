import type { InputHTMLAttributes } from "react";

import { cn } from "@/shared/lib/utils";

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {}

export function Input({ className, type, ...props }: InputProps) {
  return (
    <input
      type={type}
      className={cn(
        "flex h-10 w-full rounded-md border border-slate-200 bg-transparent px-3 py-2 text-sm shadow-xs outline-none transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-slate-400 focus-visible:border-[var(--store-primary)] focus-visible:ring-2 focus-visible:ring-[var(--store-primary)]/25 disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-red-600 aria-invalid:ring-2 aria-invalid:ring-red-600/20",
        className,
      )}
      {...props}
    />
  );
}

import type { HTMLAttributes } from "react";

import { cn } from "@/shared/lib/utils";

type BadgeVariant = "default" | "secondary" | "outline" | "destructive";

const variantClasses: Record<BadgeVariant, string> = {
  default: "border-transparent bg-[var(--store-primary)] text-white",
  secondary: "border-transparent bg-slate-100 text-slate-900",
  outline:
    "border-[var(--store-primary)] text-[var(--store-primary)]",
  destructive: "border-transparent bg-red-600 text-white",
};

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
}

export function Badge({
  className,
  variant = "default",
  ...props
}: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus-visible:ring-2 focus-visible:ring-[var(--store-primary)] focus-visible:ring-offset-2",
        variantClasses[variant],
        className,
      )}
      {...props}
    />
  );
}

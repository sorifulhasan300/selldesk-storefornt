import type { ButtonHTMLAttributes } from "react";

import { cn } from "@/shared/lib/utils";

type ButtonVariant =
  | "default"
  | "outline"
  | "ghost"
  | "secondary"
  | "destructive";
type ButtonSize = "sm" | "default" | "lg" | "icon";

const variantClasses: Record<ButtonVariant, string> = {
  default:
    "bg-[var(--store-primary)] text-white shadow-xs hover:opacity-90 active:opacity-80 focus-visible:ring-[var(--store-primary)]",
  outline:
    "border border-[var(--store-primary)] bg-transparent text-[var(--store-primary)] hover:bg-[var(--store-primary)]/10 active:bg-[var(--store-primary)]/15 focus-visible:ring-[var(--store-primary)]",
  ghost:
    "bg-transparent text-[var(--store-primary)] hover:bg-[var(--store-primary)]/10 active:bg-[var(--store-primary)]/15 focus-visible:ring-[var(--store-primary)]",
  secondary:
    "bg-slate-100 text-slate-900 hover:bg-slate-200 active:bg-slate-300 focus-visible:ring-[var(--store-primary)]",
  destructive:
    "bg-red-600 text-white shadow-xs hover:bg-red-700 active:bg-red-800 focus-visible:ring-red-600",
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: "h-8 rounded-md px-3 text-xs",
  default: "h-9 rounded-md px-4 py-2 text-sm",
  lg: "h-10 rounded-md px-6 text-base",
  icon: "size-9 rounded-md p-0",
};

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
}

export function Button({
  className,
  variant = "default",
  size = "default",
  type = "button",
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      className={cn(
        "inline-flex shrink-0 items-center justify-center gap-2 whitespace-nowrap font-medium transition-colors outline-none focus-visible:ring-2 focus-visible:ring-offset-2 cursor-pointer disabled:pointer-events-none disabled:opacity-50",
        variantClasses[variant],
        sizeClasses[size],
        className,
      )}
      {...props}
    />
  );
}

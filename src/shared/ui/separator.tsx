import type { HTMLAttributes } from "react";

import { cn } from "@/shared/lib/utils";

export interface SeparatorProps extends HTMLAttributes<HTMLDivElement> {
  decorative?: boolean;
  orientation?: "horizontal" | "vertical";
}

export function Separator({
  className,
  decorative = true,
  orientation = "horizontal",
  ...props
}: SeparatorProps) {
  return (
    <div
      role={decorative ? "none" : "separator"}
      aria-orientation={decorative ? undefined : orientation}
      data-orientation={orientation}
      className={cn(
        "shrink-0 bg-slate-200",
        orientation === "horizontal" ? "h-px w-full" : "h-full w-px",
        className,
      )}
      {...props}
    />
  );
}

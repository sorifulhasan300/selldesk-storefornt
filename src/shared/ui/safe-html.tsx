import type { HTMLAttributes } from "react";
import type { SanitizedHtml } from "@/shared/lib/sanitize-html";
import { cn } from "@/shared/lib/utils";

export interface SafeHtmlProps
  extends Omit<
    HTMLAttributes<HTMLElement>,
    "children" | "dangerouslySetInnerHTML"
  > {
  html: SanitizedHtml;
  as?: "div" | "p" | "span";
}

/**
 * Renders server-sanitized HTML produced exclusively by `sanitizeHtml()`.
 */
export function SafeHtml({
  html,
  as: Component = "div",
  className,
  ...props
}: SafeHtmlProps) {
  return (
    <Component
      className={cn(className)}
      dangerouslySetInnerHTML={{ __html: html }}
      {...props}
    />
  );
}

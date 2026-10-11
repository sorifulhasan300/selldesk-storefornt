"use client";

import * as DialogPrimitive from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import type { ComponentProps } from "react";

import { cn } from "@/shared/lib/utils";

const Sheet = DialogPrimitive.Root;
const SheetTrigger = DialogPrimitive.Trigger;
const SheetClose = DialogPrimitive.Close;
const SheetPortal = DialogPrimitive.Portal;

type SheetOverlayProps = ComponentProps<typeof DialogPrimitive.Overlay>;

function SheetOverlay({ className, ...props }: SheetOverlayProps) {
  return (
    <DialogPrimitive.Overlay
      data-slot="sheet-overlay"
      className={cn(
        "fixed inset-0 z-50 bg-black/50 transition-opacity duration-300 data-[state=closed]:opacity-0",
        className,
      )}
      {...props}
    />
  );
}

type SheetSide = "top" | "right" | "bottom" | "left";
type SheetContentProps = ComponentProps<typeof DialogPrimitive.Content> & {
  side?: SheetSide;
};

const sideClasses: Record<SheetSide, string> = {
  top: "inset-x-0 top-0 max-h-[80vh] w-full border-b data-[state=closed]:-translate-y-full",
  right:
    "inset-y-0 right-0 h-full w-3/4 border-l data-[state=closed]:translate-x-full sm:max-w-sm",
  bottom:
    "inset-x-0 bottom-0 max-h-[80vh] w-full border-t data-[state=closed]:translate-y-full",
  left: "inset-y-0 left-0 h-full w-3/4 border-r data-[state=closed]:-translate-x-full sm:max-w-sm",
};

function SheetContent({
  className,
  children,
  side = "right",
  ...props
}: SheetContentProps) {
  return (
    <SheetPortal>
      <SheetOverlay />
      <DialogPrimitive.Content
        data-slot="sheet-content"
        className={cn(
          "fixed z-50 flex flex-col gap-4 overflow-y-auto border-slate-200 bg-[var(--store-bg,#ffffff)] p-6 text-[var(--store-text,#0f172a)] shadow-lg transition-transform duration-300 ease-in-out data-[state=open]:translate-x-0 data-[state=open]:translate-y-0",
          sideClasses[side],
          className,
        )}
        {...props}
      >
        {children}
        <DialogPrimitive.Close
          aria-label="Close"
          className="absolute top-4 right-4 rounded-sm p-1 text-slate-500 opacity-70 transition-opacity hover:bg-[var(--store-primary)]/10 hover:text-[var(--store-primary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--store-primary)] disabled:pointer-events-none"
        >
          <X className="size-4" />
        </DialogPrimitive.Close>
      </DialogPrimitive.Content>
    </SheetPortal>
  );
}

function SheetHeader({
  className,
  ...props
}: ComponentProps<"div">) {
  return (
    <div
      data-slot="sheet-header"
      className={cn("flex flex-col gap-1.5 text-left", className)}
      {...props}
    />
  );
}

function SheetFooter({
  className,
  ...props
}: ComponentProps<"div">) {
  return (
    <div
      data-slot="sheet-footer"
      className={cn("mt-auto flex flex-col gap-2", className)}
      {...props}
    />
  );
}

function SheetTitle({
  className,
  ...props
}: ComponentProps<typeof DialogPrimitive.Title>) {
  return (
    <DialogPrimitive.Title
      data-slot="sheet-title"
      className={cn("text-lg font-semibold", className)}
      {...props}
    />
  );
}

function SheetDescription({
  className,
  ...props
}: ComponentProps<typeof DialogPrimitive.Description>) {
  return (
    <DialogPrimitive.Description
      data-slot="sheet-description"
      className={cn("text-sm text-slate-500", className)}
      {...props}
    />
  );
}

export {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetOverlay,
  SheetPortal,
  SheetTitle,
  SheetTrigger,
};

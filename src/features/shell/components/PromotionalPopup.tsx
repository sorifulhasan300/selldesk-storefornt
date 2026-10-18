"use client";

import React, { useState, useSyncExternalStore } from "react";
import Image from "next/image";
import Link from "next/link";
import { X } from "lucide-react";
import type { StorefrontPopupConfig } from "@/shared/types";

const POPUP_DISMISSED_KEY = "selldesk_popup_dismissed_until";

const subscribeNoop = () => () => {};

function getDismissedSnapshot(): boolean {
  if (typeof window === "undefined") return true;
  try {
    const dismissedUntil = localStorage.getItem(POPUP_DISMISSED_KEY);
    if (dismissedUntil) {
      const timestamp = Number(dismissedUntil);
      if (!isNaN(timestamp) && Date.now() < timestamp) {
        return true;
      }
    }
  } catch {
    // Ignore storage errors in restricted browser contexts
  }
  return false;
}

function getServerSnapshot(): boolean {
  return true;
}

export interface PromotionalPopupProps {
  popup?: StorefrontPopupConfig | null;
}

export function PromotionalPopup({ popup }: PromotionalPopupProps) {
  const isDismissed = useSyncExternalStore(
    subscribeNoop,
    getDismissedSnapshot,
    getServerSnapshot,
  );
  const [isDismissedByUser, setIsDismissedByUser] = useState(false);

  const handleDismiss = () => {
    setIsDismissedByUser(true);
    try {
      const intervalMinutes =
        typeof popup?.intervalMinutes === "number" && popup.intervalMinutes >= 0
          ? popup.intervalMinutes
          : 10;
      const cooldownMs = intervalMinutes * 60 * 1000;
      localStorage.setItem(
        POPUP_DISMISSED_KEY,
        String(Date.now() + cooldownMs),
      );
    } catch {
      // Graceful fallback if localStorage is unavailable
    }
  };

  if (isDismissed || isDismissedByUser || !popup || popup.active !== true) {
    return null;
  }

  const imageUrl = popup.image?.thumbs?.large || popup.image?.url;
  if (!imageUrl) {
    return null;
  }

  const imageElement = (
    <div className="relative w-full aspect-[4/3] sm:aspect-[16/10] overflow-hidden bg-muted/20">
      <Image
        src={imageUrl}
        alt="Special Promotional Offer"
        fill
        priority
        className="object-cover transition-transform duration-300 hover:scale-102"
        sizes="(max-width: 640px) 92vw, 560px"
      />
    </div>
  );

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
      aria-label="Promotional Announcement"
      onClick={handleDismiss}
    >
      <div
        className="relative max-w-lg w-full overflow-hidden rounded-2xl bg-card border border-border/50 shadow-2xl animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={handleDismiss}
          className="absolute top-3 right-3 z-20 size-8 rounded-full bg-background/80 hover:bg-background text-foreground flex items-center justify-center shadow-md backdrop-blur-xs transition-colors cursor-pointer"
          aria-label="Close promotional popup"
        >
          <X className="size-4" />
        </button>

        {popup.link ? (
          <Link
            href={popup.link}
            onClick={handleDismiss}
            className="block w-full focus:outline-hidden"
          >
            {imageElement}
          </Link>
        ) : (
          imageElement
        )}
      </div>
    </div>
  );
}


"use client";

import React from "react";
import {
  Pencil,
  Copy,
  ChevronUp,
  ChevronDown,
  Trash2,
} from "lucide-react";
import { cn } from "@/lib/utils";

export interface SectionPreviewToolbarProps {
  type?: string;
  isFirst?: boolean;
  isLast?: boolean;
  onEdit: () => void;
  onDuplicate: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onRemove: () => void;
  className?: string;
}

/**
 * Resolves uppercase display badge (e.g. CATEGORIES, PRODUCTS, BANNERS)
 * matching the user's uploaded visual builder screenshot.
 */
export function getSectionDisplayBadge(type?: string): string {
  const clean = (type || "").toLowerCase().replace(/[-_]/g, "");
  if (clean.includes("cat")) return "CATEGORIES";
  if (clean.includes("prod")) return "PRODUCTS";
  if (clean.includes("banner") || clean.includes("hero")) return "BANNERS";
  if (clean.includes("video")) return "VIDEOS";
  if (clean.includes("review") || clean.includes("testim")) return "REVIEWS";
  if (clean.includes("brand")) return "BRANDS";
  return (type || "SECTION").toUpperCase();
}

/**
 * SectionPreviewToolbar
 * Floating live-action toolbar pill displayed on section hover in the storefront live preview.
 * Provides instant Edit, Duplicate, Move Up, Move Down, and Delete controls.
 */
export function SectionPreviewToolbar({
  type,
  isFirst = false,
  isLast = false,
  onEdit,
  onDuplicate,
  onMoveUp,
  onMoveDown,
  onRemove,
  className,
}: SectionPreviewToolbarProps) {
  const badge = getSectionDisplayBadge(type);

  return (
    <div
      onClick={(e) => e.stopPropagation()}
      className={cn(
        "flex items-center gap-1.5 rounded-lg border border-sky-200/90 bg-white/95 px-2.5 py-1 shadow-md backdrop-blur-xs transition-all dark:border-sky-900/60 dark:bg-neutral-900/95 select-none",
        className,
      )}
    >
      {/* 1 ── Section Type Badge ───────────────────────────────────── */}
      <span className="text-[11px] font-bold tracking-wider text-sky-600 uppercase">
        {badge}
      </span>

      {/* 2 ── Subtle Vertical Divider ──────────────────────────────── */}
      <span className="h-3 w-px bg-gray-200 dark:bg-neutral-700 mx-0.5" />

      {/* 3 ── Action Buttons ───────────────────────────────────────── */}
      <div className="flex items-center gap-0.5">
        {/* Edit Button */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onEdit();
          }}
          title="Edit Section"
          aria-label="Edit Section"
          className="rounded p-1 text-gray-500 transition-colors hover:bg-sky-50 hover:text-sky-600 dark:text-gray-400 dark:hover:bg-neutral-800 dark:hover:text-sky-400 cursor-pointer"
        >
          <Pencil className="size-3.5" />
        </button>

        {/* Duplicate Button */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onDuplicate();
          }}
          title="Duplicate Section"
          aria-label="Duplicate Section"
          className="rounded p-1 text-gray-500 transition-colors hover:bg-sky-50 hover:text-sky-600 dark:text-gray-400 dark:hover:bg-neutral-800 dark:hover:text-sky-400 cursor-pointer"
        >
          <Copy className="size-3.5" />
        </button>

        {/* Move Up Button */}
        <button
          type="button"
          disabled={isFirst}
          onClick={(e) => {
            e.stopPropagation();
            onMoveUp();
          }}
          title={isFirst ? "Already at the top" : "Move Up"}
          aria-label="Move Up"
          className={cn(
            "rounded p-1 text-gray-500 transition-colors hover:bg-sky-50 hover:text-sky-600 dark:text-gray-400 dark:hover:bg-neutral-800 dark:hover:text-sky-400",
            isFirst ? "opacity-30 cursor-not-allowed" : "cursor-pointer",
          )}
        >
          <ChevronUp className="size-3.5" />
        </button>

        {/* Move Down Button */}
        <button
          type="button"
          disabled={isLast}
          onClick={(e) => {
            e.stopPropagation();
            onMoveDown();
          }}
          title={isLast ? "Already at the bottom" : "Move Down"}
          aria-label="Move Down"
          className={cn(
            "rounded p-1 text-gray-500 transition-colors hover:bg-sky-50 hover:text-sky-600 dark:text-gray-400 dark:hover:bg-neutral-800 dark:hover:text-sky-400",
            isLast ? "opacity-30 cursor-not-allowed" : "cursor-pointer",
          )}
        >
          <ChevronDown className="size-3.5" />
        </button>

        {/* Delete Button */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }}
          title="Delete Section"
          aria-label="Delete Section"
          className="rounded p-1 text-red-500 transition-colors hover:bg-red-50 hover:text-red-600 dark:text-red-400 dark:hover:bg-red-950/30 dark:hover:text-red-300 cursor-pointer"
        >
          <Trash2 className="size-3.5" />
        </button>
      </div>
    </div>
  );
}

export default SectionPreviewToolbar;


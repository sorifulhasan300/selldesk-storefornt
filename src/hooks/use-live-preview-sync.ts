"use client";

import { useState, useEffect } from "react";
import { HomePageSection } from "@/types";

/**
 * useLivePreviewSync Hook
 *
 * Synchronizes homepage section blocks in real-time when running inside
 * an administrative visual builder iframe via window.postMessage.
 *
 * @param initialSections Server-rendered sections fetched from bootstrap API
 * @param isPreview Boolean flag indicating if ?preview=true is active
 */
export function useLivePreviewSync(
  initialSections: HomePageSection[] = [],
  isPreview: boolean = false,
) {
  const [sections, setSections] = useState<HomePageSection[]>(initialSections);

  // Sync if initial server props update
  useEffect(() => {
    setSections(initialSections);
  }, [initialSections]);

  // Listen for live iframe preview sync messages
  useEffect(() => {
    if (!isPreview || typeof window === "undefined") return;

    const handleMessage = (event: MessageEvent) => {
      try {
        if (!event.data || typeof event.data !== "object") return;

        const { type, payload } = event.data;

        if (type === "SELLDESK_PREVIEW_SYNC") {
          let updatedSections: HomePageSection[] | null = null;

          if (Array.isArray(payload)) {
            updatedSections = payload;
          } else if (payload && Array.isArray(payload.sections)) {
            updatedSections = payload.sections;
          } else if (payload && Array.isArray(payload.homePageSections)) {
            updatedSections = payload.homePageSections;
          } else if (payload && Array.isArray(payload.data)) {
            updatedSections = payload.data;
          }

          if (updatedSections) {
            setSections(updatedSections);
          }
        }

        if (type === "SELECT_SECTION") {
          const sectionId = event.data.sectionId || payload?.sectionId;

          // Remove any previous active highlights
          document
            .querySelectorAll("[data-selldesk-selected='true']")
            .forEach((node) => {
              if (node instanceof HTMLElement) {
                node.removeAttribute("data-selldesk-selected");
                node.style.outline = "";
                node.style.outlineOffset = "";
                node.style.boxShadow = "";
                node.style.borderRadius = "";
              }
            });

          if (sectionId) {
            const target =
              document.getElementById(sectionId) ||
              document.querySelector(`[data-section-id="${sectionId}"]`);

            if (target instanceof HTMLElement) {
              target.scrollIntoView({ behavior: "smooth", block: "center" });
              target.setAttribute("data-selldesk-selected", "true");
              // Highlight with primary brand border ring (#7C5CFC)
              target.style.outline = "3px solid #7C5CFC";
              target.style.outlineOffset = "4px";
              target.style.borderRadius = "12px";
              target.style.boxShadow = "0 0 0 6px rgba(124, 92, 252, 0.2)";
              target.style.transition =
                "outline 0.3s cubic-bezier(0.4, 0, 0.2, 1), box-shadow 0.3s ease";
            }
          }
        }
      } catch (err) {
        console.error("[useLivePreviewSync] Error processing postMessage:", err);
      }
    };

    window.addEventListener("message", handleMessage);

    // Handshake: Notify parent builder window that preview iframe listener is ready
    if (window.parent && window.parent !== window) {
      window.parent.postMessage({ type: "SELLDESK_PREVIEW_READY" }, "*");
    }

    return () => {
      window.removeEventListener("message", handleMessage);
    };
  }, [isPreview]);

  return {
    sections,
    setSections,
    isPreview,
  };
}


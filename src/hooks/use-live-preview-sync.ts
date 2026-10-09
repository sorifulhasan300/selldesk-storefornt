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


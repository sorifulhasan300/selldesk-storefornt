"use client";

import { useState, useEffect, useCallback, useSyncExternalStore } from "react";
import { HomePageSection } from "@/shared/types";

const emptySubscribe = () => () => {};

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
  const [prevInitialSections, setPrevInitialSections] = useState(initialSections);
  const [selectedSectionId, setSelectedSectionId] = useState<string | null>(null);

  // Sync if initial server props update during render
  if (prevInitialSections !== initialSections) {
    setPrevInitialSections(initialSections);
    setSections(initialSections);
  }

  // Determine if running inside builder or ?preview=true URL param via hydration-safe store
  const isClientPreview = useSyncExternalStore(
    emptySubscribe,
    () => {
      if (typeof window === "undefined") return false;
      const urlParams = new URLSearchParams(window.location.search);
      const hasPreview = urlParams.get("preview") === "true";
      const isInIframe = Boolean(window.parent && window.parent !== window);
      return hasPreview || isInIframe;
    },
    () => false,
  );

  const isPreviewActive = isPreview || isClientPreview;

  // Dispatch live builder action (e.g. SELECT, DUPLICATE, MOVE, REMOVE) to parent admin
  const sendBuilderAction = useCallback(
    (actionType: string, sectionId: string) => {
      if (typeof window !== "undefined" && window.parent) {
        window.parent.postMessage(
          {
            type: actionType,
            sectionId,
          },
          "*",
        );
      }
    },
    [],
  );

  // Listen for live iframe preview sync messages
  useEffect(() => {
    if (!isPreviewActive || typeof window === "undefined") return;

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
          const sectionId = event.data.sectionId || payload?.sectionId || null;
          setSelectedSectionId(sectionId);

          if (sectionId) {
            const target =
              document.getElementById(sectionId) ||
              document.querySelector(`[data-section-id="${sectionId}"]`);

            if (target instanceof HTMLElement) {
              target.scrollIntoView({ behavior: "smooth", block: "center" });
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
  }, [isPreviewActive]);

  return {
    sections,
    setSections,
    isPreview: isPreviewActive,
    selectedSectionId,
    sendBuilderAction,
  };
}

export default useLivePreviewSync;

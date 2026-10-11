"use client";

import { useState, useEffect, useCallback, useRef, useSyncExternalStore } from "react";
import { z } from "zod";
import { HomePageSection, SectionStyles } from "@/shared/types";

const emptySubscribe = () => () => {};
const MAX_PREVIEW_SECTIONS = 60;
const PREVIEW_READY_MESSAGE = {
  source: "selldesk",
  version: 1,
  type: "SELLDESK_PREVIEW_READY",
} as const;

const BUILDER_ORIGINS = (process.env.NEXT_PUBLIC_BUILDER_ORIGINS ?? "")
  .split(",")
  .map((origin) => origin.trim())
  .filter((origin) => {
    try {
      const url = new URL(origin);
      return (
        (url.protocol === "https:" || url.protocol === "http:") &&
        url.origin === origin
      );
    } catch {
      return false;
    }
  });

const SectionSchema = z
  .object({
    id: z.string().optional(),
    type: z.string().optional(),
    key: z.string().optional(),
    title: z.string().optional(),
    subtitle: z.string().optional(),
    isActive: z.boolean().optional(),
    order: z.number().optional(),
    sortOrder: z.number().optional(),
    config: z.record(z.string(), z.unknown()).optional(),
    styles: z
      .custom<SectionStyles>(
        (styles) =>
          typeof styles === "object" && styles !== null && !Array.isArray(styles),
      )
      .optional(),
    data: z.unknown().optional(),
  })
  .strip();

const SectionsSchema = z.array(SectionSchema).max(MAX_PREVIEW_SECTIONS);
const MessageEnvelopeSchema = z
  .object({
    source: z.literal("selldesk").optional(),
    version: z.literal(1).optional(),
    type: z.string(),
    seq: z.number().int().nonnegative().optional(),
    payload: z.unknown().optional(),
    sections: z.unknown().optional(),
    sectionId: z.string().min(1).max(100).optional(),
  })
  .passthrough();

function getRecord(value: unknown): Record<string, unknown> | null {
  return typeof value === "object" && value !== null && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : null;
}

function normalizeSyncMessage(
  message: unknown,
  nextLegacySeq: number,
): { sections: HomePageSection[]; seq: number } | null {
  const envelope = MessageEnvelopeSchema.safeParse(message);
  if (!envelope.success || envelope.data.type !== "SELLDESK_PREVIEW_SYNC") {
    return null;
  }

  const payloadRecord = getRecord(envelope.data.payload);
  const rawSections = Array.isArray(envelope.data.payload)
    ? envelope.data.payload
    : payloadRecord?.sections ??
      payloadRecord?.homePageSections ??
      payloadRecord?.data ??
      envelope.data.sections;
  const sections = SectionsSchema.safeParse(rawSections);
  if (!sections.success) return null;

  return {
    sections: sections.data,
    seq: envelope.data.seq ?? nextLegacySeq,
  };
}

function normalizeSelectMessage(message: unknown): string | null {
  const envelope = MessageEnvelopeSchema.safeParse(message);
  if (!envelope.success || envelope.data.type !== "SELECT_SECTION") {
    return null;
  }

  const payload = getRecord(envelope.data.payload);
  const sectionId = envelope.data.sectionId ?? payload?.sectionId;
  return typeof sectionId === "string" && sectionId.length > 0 && sectionId.length <= 100
    ? sectionId
    : null;
}

const ACTION_TYPES = new Set([
  "SELECT_SECTION",
  "DUPLICATE_SECTION",
  "MOVE_SECTION_UP",
  "MOVE_SECTION_DOWN",
  "REMOVE_SECTION",
]);

/**
 * Synchronizes homepage sections with a trusted Admin Homepage Builder iframe.
 */
export function useLivePreviewSync(
  initialSections: HomePageSection[] = [],
  isPreview: boolean = false,
) {
  const [sections, setSections] = useState<HomePageSection[]>(initialSections);
  const [prevInitialSections, setPrevInitialSections] = useState(initialSections);
  const [selectedSectionId, setSelectedSectionId] = useState<string | null>(null);
  const [hasTrustedParent, setHasTrustedParent] = useState(false);
  const parentOrigin = useRef<string | null>(null);
  const lastSeq = useRef(-1);

  if (prevInitialSections !== initialSections) {
    setPrevInitialSections(initialSections);
    setSections(initialSections);
  }

  const isClientPreview = useSyncExternalStore(
    emptySubscribe,
    () => {
      if (typeof window === "undefined" || BUILDER_ORIGINS.length === 0) {
        return false;
      }
      const hasPreview =
        new URLSearchParams(window.location.search).get("preview") === "true";
      return hasPreview && window.parent !== window;
    },
    () => false,
  );
  const isPreviewRequested = isPreview && isClientPreview;
  const isPreviewActive = isPreviewRequested && hasTrustedParent;

  const sendBuilderAction = useCallback(
    (actionType: string, sectionId: string) => {
      const origin = parentOrigin.current;
      if (
        !origin ||
        !ACTION_TYPES.has(actionType) ||
        typeof window === "undefined" ||
        window.parent === window
      ) {
        return;
      }
      window.parent.postMessage(
        {
          source: "selldesk",
          version: 1,
          type: actionType,
          sectionId,
        },
        origin,
      );
    },
    [],
  );

  useEffect(() => {
    if (!isPreviewRequested || typeof window === "undefined") return;

    const handleMessage = (event: MessageEvent<unknown>) => {
      if (
        event.source !== window.parent ||
        !BUILDER_ORIGINS.includes(event.origin)
      ) {
        return;
      }

      const sync = normalizeSyncMessage(event.data, lastSeq.current + 1);
      if (sync) {
        if (sync.seq <= lastSeq.current) return;
        lastSeq.current = sync.seq;
        parentOrigin.current = event.origin;
        setHasTrustedParent(true);
        setSections(sync.sections);
        return;
      }

      const sectionId = normalizeSelectMessage(event.data);
      if (!sectionId) return;

      parentOrigin.current = event.origin;
      setHasTrustedParent(true);
      setSelectedSectionId(sectionId);
      document
        .querySelector<HTMLElement>(
          `[data-section-id="${CSS.escape(sectionId)}"]`,
        )
        ?.scrollIntoView({ behavior: "smooth", block: "center" });
    };

    window.addEventListener("message", handleMessage);

    let tries = 0;
    const sendReady = () => {
      if (lastSeq.current >= 0 || tries >= 10) {
        clearInterval(readyInterval);
        return;
      }
      tries += 1;
      BUILDER_ORIGINS.forEach((origin) => {
        window.parent.postMessage(PREVIEW_READY_MESSAGE, origin);
      });
    };

    const readyInterval = window.setInterval(sendReady, 500);
    sendReady();

    return () => {
      window.removeEventListener("message", handleMessage);
      window.clearInterval(readyInterval);
    };
  }, [isPreviewRequested]);

  return {
    sections,
    setSections,
    isPreview: isPreviewActive,
    selectedSectionId,
    sendBuilderAction,
  };
}

export default useLivePreviewSync;

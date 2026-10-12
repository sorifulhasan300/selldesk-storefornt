"use client";

import { useState, useEffect, useCallback, useRef, useSyncExternalStore } from "react";
import { z } from "zod";
import { BUILDER_ORIGINS } from "@/shared/config/builder-origins";
import { HomePageSection, SectionStyles } from "@/shared/types";

const emptySubscribe = () => () => {};
const MAX_PREVIEW_SECTIONS = 60;
const PREVIEW_READY_MESSAGE = {
  source: "selldesk",
  version: 1,
  type: "SELLDESK_PREVIEW_READY",
} as const;

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
    source: z.literal("selldesk"),
    version: z.literal(1),
    type: z.string(),
    seq: z.number().int().nonnegative().optional(),
    payload: z.unknown().optional(),
    sectionId: z.string().min(1).max(100).nullable().optional(),
  })
  .passthrough();

function getRecord(value: unknown): Record<string, unknown> | null {
  return typeof value === "object" && value !== null && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : null;
}

function normalizeSyncMessage(
  message: unknown,
): { sections: HomePageSection[]; seq: number; isHydrated: boolean } | null {
  const envelope = MessageEnvelopeSchema.safeParse(message);
  if (
    !envelope.success ||
    (envelope.data.type !== "SELLDESK_PREVIEW_SYNC" &&
      envelope.data.type !== "SELLDESK_PREVIEW_HYDRATE" &&
      envelope.data.type !== "UPDATE_HOME_SECTIONS") ||
    envelope.data.seq === undefined
  ) {
    return null;
  }

  const payloadRecord = getRecord(envelope.data.payload);
  const rawSections = Array.isArray(envelope.data.payload)
    ? envelope.data.payload
    : payloadRecord?.sections ??
      payloadRecord?.homePageSections ??
      payloadRecord?.data;
  const sections = SectionsSchema.safeParse(rawSections);
  if (!sections.success) return null;

  return {
    sections: sections.data,
    seq: envelope.data.seq,
    isHydrated: envelope.data.type === "SELLDESK_PREVIEW_HYDRATE",
  };
}

function hasSectionData(data: unknown): boolean {
  return data !== null && data !== undefined &&
    (!Array.isArray(data) || data.length > 0);
}

function preserveHydratedSectionData(
  incoming: HomePageSection[],
  current: HomePageSection[],
): HomePageSection[] {
  const currentById = new Map(
    current.filter((section) => section.id).map((section) => [section.id, section]),
  );

  return incoming.map((section) => {
    if (!section.id || hasSectionData(section.data)) return section;

    const previous = currentById.get(section.id);
    if (
      !previous ||
      previous.type !== section.type ||
      previous.key !== section.key ||
      !hasSectionData(previous.data)
    ) {
      return section;
    }

    return { ...section, data: previous.data };
  });
}

function normalizeSelectMessage(
  message: unknown,
): { sectionId: string | null } | null {
  const envelope = MessageEnvelopeSchema.safeParse(message);
  if (!envelope.success || envelope.data.type !== "SELECT_SECTION") {
    return null;
  }

  if (envelope.data.sectionId === undefined) return null;
  return { sectionId: envelope.data.sectionId };
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
) {
  const [sections, setSections] = useState<HomePageSection[]>(initialSections);
  const [prevInitialSections, setPrevInitialSections] = useState(initialSections);
  const [selectedSectionId, setSelectedSectionId] = useState<string | null>(null);
  const [hasTrustedParent, setHasTrustedParent] = useState(false);
  const parentOrigin = useRef<string | null>(null);
  const hasTrustedParentRef = useRef(false);
  const lastSeq = useRef(-1);

  if (prevInitialSections !== initialSections) {
    setPrevInitialSections(initialSections);
    setSections(initialSections);
  }

  const isClientPreview = useSyncExternalStore(
    emptySubscribe,
    () => {
      if (typeof window === "undefined") return false;
      return (
        new URLSearchParams(window.location.search).get("preview") === "true" &&
        window.parent !== window
      );
    },
    () => false,
  );
  const isPreviewRequested = isClientPreview;
  const isPreviewActive = isPreviewRequested && hasTrustedParent;

  const sendBuilderAction = useCallback(
    (actionType: string, sectionId: string) => {
      if (
        !ACTION_TYPES.has(actionType) ||
        !sectionId ||
        sectionId.length > 100 ||
        typeof window === "undefined" ||
        window.parent === window ||
        !parentOrigin.current
      ) {
        return;
      }

      const message = {
        source: "selldesk",
        version: 1,
        type: actionType,
        sectionId,
      };
      try {
        window.parent.postMessage(message, parentOrigin.current);
      } catch (error) {
        console.error("[useLivePreviewSync] Could not send action to builder", error);
      }
    },
    [],
  );

  useEffect(() => {
    if (
      !isPreviewRequested ||
      typeof window === "undefined" ||
      window.parent === window
    ) {
      return;
    }

    const handleMessage = (event: MessageEvent<unknown>) => {
      if (
        event.source !== window.parent ||
        !BUILDER_ORIGINS.includes(event.origin)
      ) {
        return;
      }

      const sync = normalizeSyncMessage(event.data);
      if (sync) {
        if (sync.seq <= lastSeq.current) return;
        lastSeq.current = sync.seq;
        parentOrigin.current = event.origin;
        hasTrustedParentRef.current = true;
        setHasTrustedParent(true);
        setSections((current) =>
          sync.isHydrated
            ? sync.sections
            : preserveHydratedSectionData(sync.sections, current),
        );
        return;
      }

      const selection = normalizeSelectMessage(event.data);
      if (!selection) return;

      parentOrigin.current = event.origin;
      hasTrustedParentRef.current = true;
      setHasTrustedParent(true);
      setSelectedSectionId(selection.sectionId);
      if (selection.sectionId) {
        document
          .querySelector<HTMLElement>(
            `[data-section-id="${CSS.escape(selection.sectionId)}"]`,
          )
          ?.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    };

    window.addEventListener("message", handleMessage);

    let readyInterval: number | null = null;
    const sendReady = () => {
      if (hasTrustedParentRef.current) {
        if (readyInterval !== null) {
          window.clearInterval(readyInterval);
          readyInterval = null;
        }
        return;
      }

      for (const origin of BUILDER_ORIGINS) {
        try {
          window.parent.postMessage(PREVIEW_READY_MESSAGE, origin);
        } catch (error) {
          console.error(
            `[useLivePreviewSync] Could not send ready message to ${origin}`,
            error,
          );
        }
      }
    };

    readyInterval = window.setInterval(sendReady, 500);
    sendReady();

    return () => {
      window.removeEventListener("message", handleMessage);
      if (readyInterval !== null) window.clearInterval(readyInterval);
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

import "server-only";
import sanitizeHtmlLib from "sanitize-html";

declare const sanitizedHtmlBrand: unique symbol;

/** Branded HTML string produced exclusively by `sanitizeHtml()`. */
export type SanitizedHtml = string & {
  readonly [sanitizedHtmlBrand]: true;
};

const ALLOWED_TAGS = [
  "p",
  "br",
  "strong",
  "em",
  "ul",
  "ol",
  "li",
  "h1",
  "h2",
  "h3",
  "h4",
  "h5",
  "h6",
  "a",
  "img",
  "table",
  "thead",
  "tbody",
  "tr",
  "th",
  "td",
  "span",
];

const ALLOWED_ATTRIBUTES: Record<string, sanitizeHtmlLib.AllowedAttribute[]> = {
  a: ["href", "target", "rel"],
  img: ["src", "alt", "title", "width", "height", "loading"],
  th: ["colspan", "rowspan", "scope"],
  td: ["colspan", "rowspan"],
};

const ALLOWED_TARGETS = new Set(["_blank", "_self"]);

function isHttpsUrl(value: string | undefined): boolean {
  if (!value) return false;
  // Strip ASCII control characters before URL parsing to defeat whitespace-obfuscated schemes.
  const normalized = value.replace(/[\u0000-\u0020\u007F]+/g, "");
  try {
    return new URL(normalized).protocol === "https:";
  } catch {
    return false;
  }
}

const SANITIZE_OPTIONS: sanitizeHtmlLib.IOptions = {
  allowedTags: ALLOWED_TAGS,
  allowedAttributes: ALLOWED_ATTRIBUTES,
  disallowedTagsMode: "discard",
  nonTextTags: ["script", "style", "textarea", "option", "xmp", "noscript"],
  allowedSchemes: [],
  allowedSchemesByTag: {
    a: ["http", "https", "mailto"],
    img: ["https"],
  },
  allowProtocolRelative: false,
  transformTags: {
    a: (_tagName, attribs) => {
      const nextAttribs: sanitizeHtmlLib.Attributes = {
        ...attribs,
        rel: "noopener noreferrer nofollow",
      };
      if (nextAttribs.target && !ALLOWED_TARGETS.has(nextAttribs.target)) {
        delete nextAttribs.target;
      }
      return {
        tagName: "a",
        attribs: nextAttribs,
      };
    },
    img: (_tagName, attribs) => {
      const nextAttribs: sanitizeHtmlLib.Attributes = { ...attribs };
      if (!isHttpsUrl(nextAttribs.src)) {
        delete nextAttribs.src;
      }
      return {
        tagName: "img",
        attribs: nextAttribs,
      };
    },
  },
  exclusiveFilter: (frame) => frame.tag === "img" && !frame.attribs.src,
};

/**
 * Sanitizes untrusted merchant HTML against a strict tag, attribute, and URI scheme allowlist.
 * Must run on the server; returns a branded `SanitizedHtml` string for `SafeHtml`.
 */
export function sanitizeHtml(dirty: string | null | undefined): SanitizedHtml {
  if (!dirty) {
    return "" as SanitizedHtml;
  }
  return sanitizeHtmlLib(dirty, SANITIZE_OPTIONS) as SanitizedHtml;
}

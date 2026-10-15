import type { CSSProperties } from "react";
import { Phone } from "lucide-react";
import { cn } from "@/shared/lib/utils";
import type { StorefrontTopbarConfig } from "@/shared/types";

const COLOR_REGEX =
  /^(#[0-9a-f]{3,8}|rgba?\([\d\s.,%]+\)|hsla?\([\d\s.,%]+\)|transparent)$/i;

function safeColor(value: unknown): string | undefined {
  if (typeof value !== "string") return undefined;
  const color = value.trim();
  return COLOR_REGEX.test(color) ? color : undefined;
}

function safeExternalHref(value: unknown): string | undefined {
  if (typeof value !== "string") return undefined;
  try {
    const url = new URL(value);
    return url.protocol === "https:" || url.protocol === "http:"
      ? url.toString()
      : undefined;
  } catch {
    return undefined;
  }
}

export interface AnnouncementBarProps {
  announcementText?: string | null;
  phone?: string | null;
  topbar?: StorefrontTopbarConfig | null;
  socialLinks?: Record<string, string | undefined> | null;
  className?: string;
}

export function AnnouncementBar({
  announcementText,
  phone,
  topbar,
  socialLinks,
  className,
}: AnnouncementBarProps) {
  const text = announcementText ?? topbar?.announcementText;
  const contactPhone = phone ?? topbar?.phone;

  if (topbar?.isActive === false || !text || !text.trim()) {
    return null;
  }

  const sanitizedPhone = contactPhone?.replace(/[^\d+]/g, "");
  const facebookHref = safeExternalHref(socialLinks?.facebook);
  const instagramHref = safeExternalHref(socialLinks?.instagram);
  const youtubeHref = safeExternalHref(socialLinks?.youtube);
  const twitterHref = safeExternalHref(socialLinks?.twitter);
  const showSocialLinks = topbar?.showSocialLinks !== false;
  const hasSocialLinks =
    showSocialLinks &&
    Boolean(facebookHref || instagramHref || youtubeHref || twitterHref);
  const customStyle: CSSProperties = {};
  const bgColor = safeColor(topbar?.bgColor);
  const textColor = safeColor(topbar?.textColor);

  if (bgColor) customStyle.backgroundColor = bgColor;
  if (textColor) customStyle.color = textColor;

  return (
    <aside
      aria-label="Announcement"
      className={cn(
        !bgColor && "bg-[var(--store-primary)]",
        !textColor && "text-white",
        "text-xs sm:text-sm font-medium transition-colors",
        className,
      )}
      style={customStyle}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2 flex items-center justify-between gap-4">
        <p className="flex-1 text-center sm:text-left truncate">
          {text}
        </p>
        {(contactPhone || hasSocialLinks) && (
          <div className="hidden sm:flex shrink-0 items-center gap-4">
            {contactPhone && (
              <a
                href={
                  sanitizedPhone
                    ? `tel:${sanitizedPhone}`
                    : `tel:${contactPhone}`
                }
                className="inline-flex items-center gap-1.5 opacity-90 hover:opacity-100 hover:underline transition-all text-xs"
              >
                <Phone className="w-3.5 h-3.5 shrink-0" />
                <span>{contactPhone}</span>
              </a>
            )}
            {hasSocialLinks && (
              <div className="flex items-center gap-2.5 opacity-90">
                {facebookHref && (
                  <a
                    href={facebookHref}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="Facebook"
                    className="hover:opacity-100 transition-opacity"
                  >
                    <svg
                      viewBox="0 0 24 24"
                      fill="currentColor"
                      aria-hidden="true"
                      className="w-3.5 h-3.5"
                    >
                      <path d="M13.5 21v-8h2.7l.4-3h-3.1V8.1c0-.9.3-1.5 1.6-1.5h1.7V3.9c-.8-.1-1.6-.2-2.6-.2-2.8 0-4.7 1.7-4.7 4.9V10H7v3h2.5v8h4z" />
                    </svg>
                  </a>
                )}
                {instagramHref && (
                  <a
                    href={instagramHref}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="Instagram"
                    className="hover:opacity-100 transition-opacity"
                  >
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      aria-hidden="true"
                      className="w-3.5 h-3.5"
                    >
                      <rect x="3" y="3" width="18" height="18" rx="5" />
                      <circle cx="12" cy="12" r="4" />
                      <circle cx="18" cy="6" r="1" fill="currentColor" stroke="none" />
                    </svg>
                  </a>
                )}
                {youtubeHref && (
                  <a
                    href={youtubeHref}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="YouTube"
                    className="hover:opacity-100 transition-opacity"
                  >
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinejoin="round"
                      aria-hidden="true"
                      className="w-3.5 h-3.5"
                    >
                      <rect x="2" y="5" width="20" height="14" rx="4" />
                      <path d="m10 9 5 3-5 3z" fill="currentColor" stroke="none" />
                    </svg>
                  </a>
                )}
                {twitterHref && (
                  <a
                    href={twitterHref}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="X (Twitter)"
                    className="hover:opacity-100 transition-opacity"
                  >
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      aria-hidden="true"
                      className="w-3.5 h-3.5"
                    >
                      <path d="m4 4 16 16M20 4 4 20" />
                    </svg>
                  </a>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </aside>
  );
}

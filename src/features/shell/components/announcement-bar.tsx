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
  const href = value.trim();
  if (!href) return undefined;
  const normalizedHref = /^https?:\/\//i.test(href) ? href : `https://${href}`;
  try {
    const url = new URL(normalizedHref);
    return url.protocol === "https:" || url.protocol === "http:"
      ? url.toString()
      : undefined;
  } catch {
    return undefined;
  }
}

type SocialPlatform =
  | "Facebook"
  | "Instagram"
  | "YouTube"
  | "TikTok"
  | "X (Twitter)"
  | "WhatsApp"
  | "LinkedIn";

function SocialIcon({ platform }: { platform: SocialPlatform }) {
  const commonProps = {
    viewBox: "0 0 24 24",
    fill: "currentColor",
    "aria-hidden": true as const,
    className: "w-3.5 h-3.5",
  };

  switch (platform) {
    case "Facebook":
      return (
        <svg {...commonProps}>
          <path d="M13.5 21v-8h2.7l.4-3h-3.1V8.1c0-.9.3-1.5 1.6-1.5h1.7V3.9c-.8-.1-1.6-.2-2.6-.2-2.8 0-4.7 1.7-4.7 4.9V10H7v3h2.5v8h4z" />
        </svg>
      );
    case "Instagram":
      return (
        <svg
          {...commonProps}
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <rect x="3" y="3" width="18" height="18" rx="5" />
          <circle cx="12" cy="12" r="4" />
          <circle
            cx="18"
            cy="6"
            r="1"
            fill="currentColor"
            stroke="none"
          />
        </svg>
      );
    case "YouTube":
      return (
        <svg
          {...commonProps}
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinejoin="round"
        >
          <rect x="2" y="5" width="20" height="14" rx="4" />
          <path d="m10 9 5 3-5 3z" fill="currentColor" stroke="none" />
        </svg>
      );
    case "TikTok":
      return (
        <svg {...commonProps}>
          <path d="M19.6 7.3a7.1 7.1 0 0 1-4.2-1.4v8.5a5.8 5.8 0 1 1-5-5.7v3.1a2.7 2.7 0 1 0 1.9 2.6V3h3.1c.2 2 1.8 3.6 4.2 3.9z" />
        </svg>
      );
    case "X (Twitter)":
      return (
        <svg
          {...commonProps}
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path d="m4 4 16 16M20 4 4 20" />
        </svg>
      );
    case "WhatsApp":
      return (
        <svg
          {...commonProps}
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M20.5 11.5a8.5 8.5 0 0 1-12.6 7.4L3 20l1.2-4.7A8.5 8.5 0 1 1 20.5 11.5Z" />
          <path d="M8.5 8.3c.2-.5.4-.5.7-.5h.5c.2 0 .4.1.5.4l.7 1.6c.1.2.1.4-.1.6l-.5.6c-.2.2-.2.4 0 .6.5.8 1.2 1.5 2 2 .2.1.4.1.6-.1l.7-.8c.2-.2.4-.2.6-.1l1.5.7c.3.1.4.3.4.5 0 .3-.2 1.2-.8 1.6-.5.4-1.2.5-2 .2-.8-.3-1.8-.7-3-1.8s-1.9-2.2-2.2-3c-.3-.8-.2-1.5.2-2 .2-.3.4-.5.7-.5Z" />
        </svg>
      );
    case "LinkedIn":
      return (
        <svg {...commonProps}>
          <path d="M5.2 8.7a1.8 1.8 0 1 0 0-3.6 1.8 1.8 0 0 0 0 3.6ZM3.7 10h3v10h-3zM9 10h2.9v1.4h.1a3.2 3.2 0 0 1 2.9-1.6c3.1 0 3.7 2 3.7 4.6V20h-3v-5c0-1.2 0-2.7-1.7-2.7s-2 1.3-2 2.6V20H9z" />
        </svg>
      );
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
  const showPhone = topbar?.showPhone !== false;

  if (topbar?.isActive === false || !text || !text.trim()) {
    return null;
  }

  const sanitizedPhone = contactPhone?.replace(/[^\d+]/g, "");
  const facebookHref = safeExternalHref(socialLinks?.facebook);
  const instagramHref = safeExternalHref(socialLinks?.instagram);
  const youtubeHref = safeExternalHref(socialLinks?.youtube);
  const tiktokHref = safeExternalHref(socialLinks?.tiktok);
  const twitterHref =
    safeExternalHref(socialLinks?.twitter) ||
    safeExternalHref(socialLinks?.x);
  const whatsappHref = safeExternalHref(socialLinks?.whatsapp);
  const linkedinHref = safeExternalHref(socialLinks?.linkedin);
  const showSocialLinks = topbar?.showSocialLinks !== false;
  const availableSocialLinks: Array<{
    platform: SocialPlatform;
    href: string | undefined;
  }> = [
    { platform: "Facebook", href: facebookHref },
    { platform: "Instagram", href: instagramHref },
    { platform: "YouTube", href: youtubeHref },
    { platform: "TikTok", href: tiktokHref },
    { platform: "X (Twitter)", href: twitterHref },
    { platform: "WhatsApp", href: whatsappHref },
    { platform: "LinkedIn", href: linkedinHref },
  ];
  const visibleSocialLinks = showSocialLinks
    ? availableSocialLinks.filter(
        (link): link is { platform: SocialPlatform; href: string } =>
          Boolean(link.href),
      )
    : [];
  const hasSocialLinks = visibleSocialLinks.length > 0;
  const hasVisiblePhone = showPhone && Boolean(contactPhone);
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
      <div className="w-full mx-auto px-4 sm:px-6 lg:px-8 max-w-[var(--store-content-max-w,1200px)] py-2 flex items-center justify-between gap-4">
        <p className="flex-1 text-center sm:text-left truncate">
          {text}
        </p>
        {(hasVisiblePhone || hasSocialLinks) && (
          <div className="hidden sm:flex shrink-0 items-center gap-4">
            {hasVisiblePhone && contactPhone && (
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
                {visibleSocialLinks.map(({ platform, href }) => (
                  <a
                    key={platform}
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={platform}
                    className="hover:opacity-100 transition-opacity"
                  >
                    <SocialIcon platform={platform} />
                  </a>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </aside>
  );
}

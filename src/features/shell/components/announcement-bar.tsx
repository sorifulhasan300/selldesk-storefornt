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

export interface AnnouncementBarProps {
  announcementText?: string | null;
  phone?: string | null;
  topbar?: StorefrontTopbarConfig | null;
  className?: string;
}

export function AnnouncementBar({
  announcementText,
  phone,
  topbar,
  className,
}: AnnouncementBarProps) {
  const text = announcementText ?? topbar?.announcementText;
  const contactPhone = phone ?? topbar?.phone;

  if (topbar?.isActive === false || !text || !text.trim()) {
    return null;
  }

  const sanitizedPhone = contactPhone?.replace(/[^\d+]/g, "");
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
        {contactPhone && (
          <a
            href={sanitizedPhone ? `tel:${sanitizedPhone}` : `tel:${contactPhone}`}
            className="hidden sm:inline-flex items-center gap-1.5 shrink-0 opacity-90 hover:opacity-100 hover:underline transition-all text-xs"
          >
            <Phone className="w-3.5 h-3.5 shrink-0" />
            <span>{contactPhone}</span>
          </a>
        )}
      </div>
    </aside>
  );
}

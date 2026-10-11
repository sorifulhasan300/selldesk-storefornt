import { Phone } from "lucide-react";
import { cn } from "@/shared/lib/utils";
import type { StorefrontTopbarConfig } from "@/shared/types";

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

  if (!text || !text.trim()) {
    return null;
  }

  const sanitizedPhone = contactPhone?.replace(/[^\d+]/g, "");

  return (
    <aside
      aria-label="Announcement"
      className={cn(
        "bg-[var(--store-primary)] text-white text-xs sm:text-sm font-medium transition-colors",
        className,
      )}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2 flex items-center justify-between gap-4">
        <p className="flex-1 text-center sm:text-left truncate">
          {text}
        </p>
        {contactPhone && (
          <a
            href={sanitizedPhone ? `tel:${sanitizedPhone}` : `tel:${contactPhone}`}
            className="hidden sm:inline-flex items-center gap-1.5 shrink-0 text-white/90 hover:text-white hover:underline transition-all text-xs"
          >
            <Phone className="w-3.5 h-3.5 shrink-0" />
            <span>{contactPhone}</span>
          </a>
        )}
      </div>
    </aside>
  );
}


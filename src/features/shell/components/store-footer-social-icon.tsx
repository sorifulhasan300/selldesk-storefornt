import {
  MessagesSquare,
  Send,
  X,
  type LucideIcon,
} from "lucide-react";

export const SOCIAL_NETWORKS = [
  "facebook",
  "instagram",
  "youtube",
  "tiktok",
  "whatsapp",
  "messenger",
  "x",
  "linkedin",
  "telegram",
] as const;

export type SocialNetwork = (typeof SOCIAL_NETWORKS)[number];

export const SOCIAL_LABELS: Record<SocialNetwork, string> = {
  facebook: "Facebook",
  instagram: "Instagram",
  youtube: "YouTube",
  tiktok: "TikTok",
  whatsapp: "WhatsApp",
  messenger: "Messenger",
  x: "X",
  linkedin: "LinkedIn",
  telegram: "Telegram",
};

export const SOCIAL_COLORS: Record<SocialNetwork, string> = {
  facebook: "#1877f2",
  instagram: "#e4405f",
  youtube: "#ff0000",
  tiktok: "#111111",
  whatsapp: "#25d366",
  messenger: "#0866ff",
  x: "#000000",
  linkedin: "#0a66c2",
  telegram: "#26a5e4",
};

const ADDITIONAL_SOCIAL_ICONS: Partial<Record<SocialNetwork, LucideIcon>> = {
  messenger: MessagesSquare,
  x: X,
  telegram: Send,
};

export function SocialIcon({ network, size }: { network: SocialNetwork; size: number }) {
  const iconSize = Math.max(14, Math.round(size * 0.5));

  if (network === "facebook") {
    return (
      <svg aria-hidden="true" width={iconSize} height={iconSize} viewBox="0 0 24 24" fill="currentColor">
        <path d="M13.5 21v-8.2h2.8l.4-3.2h-3.2V7.5c0-.9.3-1.5 1.6-1.5h1.7V3.1c-.3 0-1.3-.1-2.5-.1-2.5 0-4.2 1.5-4.2 4.3v2.3H7.3v3.2h2.8V21h3.4Z" />
      </svg>
    );
  }

  if (network === "instagram") {
    return (
      <svg aria-hidden="true" width={iconSize} height={iconSize} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <rect x="3" y="3" width="18" height="18" rx="5" />
        <circle cx="12" cy="12" r="4" />
        <circle cx="18" cy="6" r="1" fill="currentColor" stroke="none" />
      </svg>
    );
  }

  if (network === "youtube") {
    return (
      <svg aria-hidden="true" width={iconSize} height={iconSize} viewBox="0 0 24 24" fill="currentColor">
        <path d="M23.5 6.2a3 3 0 0 0-2.1-2.1C19.5 3.6 12 3.6 12 3.6s-7.5 0-9.4.5A3 3 0 0 0 .5 6.2 31 31 0 0 0 24 12a31 31 0 0 0-.5-5.8ZM9.6 15.6V8.4l6.2 3.6-6.2 3.6Z" />
      </svg>
    );
  }

  if (network === "tiktok") {
    return (
      <svg aria-hidden="true" width={iconSize} height={iconSize} viewBox="0 0 24 24" fill="currentColor">
        <path d="M19.6 7.2a6.7 6.7 0 0 1-4.1-1.4v8.1a6 6 0 1 1-5.2-5.9v3.3a2.7 2.7 0 1 0 1.9 2.6V2.5h3.3c.2 2 1.4 3.8 3.3 4.5.3.1.6.2.9.2v3.3c-.1 0-.1 0-.1 0Z" />
      </svg>
    );
  }

  if (network === "whatsapp") {
    return (
      <svg aria-hidden="true" width={iconSize} height={iconSize} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M20.5 11.8a8.5 8.5 0 0 1-12.6 7.4L3 20.5l1.4-4.7a8.5 8.5 0 1 1 16.1-4Z" />
        <path d="M8.6 8.3c.2-.4.4-.4.7-.4h.5c.2 0 .4.1.5.4l.7 1.7c.1.2.1.4-.1.6l-.5.6c-.2.2-.2.4 0 .6.5.9 1.2 1.6 2.1 2.1.2.1.4.1.6-.1l.7-.8c.2-.2.4-.2.6-.1l1.6.8c.3.1.4.3.4.5 0 .4-.2 1-.6 1.3-.4.4-1 .6-1.6.5-1-.1-2.5-.8-3.9-2.1-1.2-1.1-2-2.5-2.2-3.4-.2-.8.2-1.5.5-1.9Z" />
      </svg>
    );
  }

  const Icon = ADDITIONAL_SOCIAL_ICONS[network];
  if (Icon) {
    return <Icon aria-hidden="true" width={iconSize} height={iconSize} />;
  }

  return (
    <span aria-hidden="true" className="text-xs font-bold leading-none">
      in
    </span>
  );
}


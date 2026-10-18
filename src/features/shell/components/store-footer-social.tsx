import type { StorefrontFooterConfig } from "@/shared/types";
import {
  SocialIcon,
  SOCIAL_NETWORKS,
  SOCIAL_COLORS,
  SOCIAL_LABELS,
  type SocialNetwork,
} from "./store-footer-social-icon";

export { SOCIAL_NETWORKS };
export type { SocialNetwork };

export function SocialLinks({
  links,
  style,
}: {
  links: Partial<Record<SocialNetwork, string>>;
  style: StorefrontFooterConfig["socialIconStyle"];
}) {
  const size = style?.size ?? 36;
  const gap = style?.gap ?? 8;
  const shape = style?.shape ?? "circle";
  const iconOnly = shape === "icon";
  const shapeClass =
    shape === "circle"
      ? "rounded-full"
      : shape === "rounded"
        ? "rounded-md"
        : "rounded-none";
  const isCustomColor = style?.mode === "custom";

  return (
    <div className="flex flex-wrap items-center" style={{ gap: `${gap}px` }}>
      {SOCIAL_NETWORKS.map((network) => {
        const href = links[network];
        if (!href) return null;

        const color = SOCIAL_COLORS[network];
        return (
          <a
            key={network}
            href={href}
            target="_blank"
            rel="noreferrer"
            aria-label={SOCIAL_LABELS[network]}
            className={`inline-flex shrink-0 items-center justify-center transition-opacity hover:opacity-75 ${
              iconOnly ? "" : shapeClass
            }`}
            style={{
              width: `${size}px`,
              height: `${size}px`,
              backgroundColor: iconOnly
                ? "transparent"
                : isCustomColor
                  ? style?.color ?? "currentColor"
                  : color,
              color: isCustomColor
                ? iconOnly
                  ? style?.color ?? "currentColor"
                  : "white"
                : iconOnly
                  ? "currentColor"
                  : "white",
            }}
          >
            <SocialIcon network={network} size={size} />
          </a>
        );
      })}
    </div>
  );
}


import Image from "next/image";
import { VideoItem } from "@/shared/types";
import { Play } from "lucide-react";
import { cn } from "@/shared/lib/utils";

export type VideoThumbnailShape = "portrait" | "landscape" | "square";

export interface VideoReelCardProps {
  video: VideoItem;
  thumbnailShape?: VideoThumbnailShape;
  cardWidth?: number;
  cardGap?: number;
  cardRadius?: number;
  onClick: () => void;
  isPortrait?: boolean;
}

export function VideoReelCard({
  video,
  thumbnailShape,
  cardWidth,
  cardGap,
  cardRadius,
  onClick,
  isPortrait,
}: VideoReelCardProps) {
  const thumbnail =
    video.thumbnailUrl ||
    "https://images.unsplash.com/photo-1536240478700-b869070f9279?w=600&auto=format&fit=crop&q=80";

  const shape: VideoThumbnailShape =
    thumbnailShape || (isPortrait === false ? "square" : "portrait");

  const aspectClass =
    shape === "landscape"
      ? "aspect-[16/9]"
      : shape === "square"
      ? "aspect-square"
      : "aspect-[9/16]";

  const defaultWidthClass =
    shape === "landscape"
      ? "w-[280px] sm:w-[320px]"
      : "w-[180px] sm:w-[220px]";

  const inlineStyles: React.CSSProperties = {};
  if (cardWidth !== undefined && cardWidth > 0) {
    inlineStyles.width = `${cardWidth}px`;
  }
  if (cardRadius !== undefined && cardRadius >= 0) {
    inlineStyles.borderRadius = `${cardRadius}px`;
  }

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onClick();
        }
      }}
      style={inlineStyles}
      className={cn(
        "group/card relative flex-none overflow-hidden cursor-pointer snap-start bg-slate-900 border border-slate-200/80 shadow-xs hover:shadow-xl hover:scale-[1.02] transition-all duration-300",
        aspectClass,
        !cardWidth && defaultWidthClass,
        cardRadius === undefined && "rounded-2xl",
      )}
    >
      <Image
        src={thumbnail}
        alt={video.caption || "Video reel thumbnail"}
        fill
        sizes="(max-width: 768px) 70vw, 360px"
        className="object-cover group-hover/card:scale-105 transition-transform duration-500"
      />

      <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent" />

      <div className="absolute inset-0 flex items-center justify-center">
        <div className="w-12 h-12 rounded-full bg-white/30 backdrop-blur-md flex items-center justify-center text-white group-hover/card:scale-110 group-hover/card:bg-[var(--store-primary)] transition-all duration-300 shadow-md">
          <Play className="w-5 h-5 fill-current ml-0.5" />
        </div>
      </div>

      <div className="absolute bottom-3 left-3 right-3 text-white space-y-1">
        <span className="inline-block px-2 py-0.5 rounded-full bg-[var(--store-primary)]/80 text-[10px] font-bold uppercase tracking-wider backdrop-blur-xs">
          Short
        </span>
        <p className="text-xs font-semibold line-clamp-2 leading-snug">
          {video.caption}
        </p>
      </div>
    </div>
  );
}



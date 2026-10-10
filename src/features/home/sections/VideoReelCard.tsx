import Image from "next/image";
import { VideoItem } from "@/shared/types";
import { Play } from "lucide-react";

interface VideoReelCardProps {
  video: VideoItem;
  isPortrait: boolean;
  onClick: () => void;
}

export function VideoReelCard({
  video,
  isPortrait,
  onClick,
}: VideoReelCardProps) {
  const thumbnail =
    video.thumbnailUrl ||
    "https://images.unsplash.com/photo-1536240478700-b869070f9279?w=600&auto=format&fit=crop&q=80";

  return (
    <div
      onClick={onClick}
      className={`group/card relative flex-none ${
        isPortrait
          ? "w-[180px] sm:w-[220px] aspect-[9/16]"
          : "w-[180px] sm:w-[220px] aspect-square"
      } rounded-2xl overflow-hidden cursor-pointer snap-start bg-slate-900 border border-slate-200/80 shadow-xs hover:shadow-xl hover:scale-[1.02] transition-all duration-300`}
    >
      <Image
        src={thumbnail}
        alt={video.caption || "Video reel thumbnail"}
        fill
        sizes="(max-width: 768px) 50vw, 220px"
        className="object-cover group-hover/card:scale-105 transition-transform duration-500"
      />

      <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent" />

      <div className="absolute inset-0 flex items-center justify-center">
        <div className="w-12 h-12 rounded-full bg-white/30 backdrop-blur-md flex items-center justify-center text-white group-hover/card:scale-110 group-hover/card:bg-blue-600 transition-all duration-300 shadow-md">
          <Play className="w-5 h-5 fill-current ml-0.5" />
        </div>
      </div>

      <div className="absolute bottom-3 left-3 right-3 text-white space-y-1">
        <span className="inline-block px-2 py-0.5 rounded-full bg-blue-600/80 text-[10px] font-bold uppercase tracking-wider backdrop-blur-xs">
          Short
        </span>
        <p className="text-xs font-semibold line-clamp-2 leading-snug">
          {video.caption}
        </p>
      </div>
    </div>
  );
}


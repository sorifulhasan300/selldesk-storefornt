import { VideoItem } from "@/types";
import { X } from "lucide-react";

interface VideoReelModalProps {
  video: VideoItem;
  onClose: () => void;
}

export function VideoReelModal({ video, onClose }: VideoReelModalProps) {
  const isYoutube =
    video.videoId &&
    !video.videoId.startsWith("vid-") &&
    video.videoId.length === 11;

  return (
    <div
      className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-sm sm:max-w-md bg-black rounded-3xl overflow-hidden shadow-2xl aspect-[9/16] flex flex-col justify-between"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 p-2 rounded-full bg-black/50 text-white hover:bg-white hover:text-slate-900 transition-colors cursor-pointer"
          aria-label="Close video reel"
        >
          <X className="w-5 h-5" />
        </button>

        {isYoutube ? (
          <iframe
            src={`https://www.youtube.com/embed/${video.videoId}?autoplay=1&mute=0&loop=1&playsinline=1`}
            title={video.caption || "Reel Player"}
            className="w-full h-full border-0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        ) : (
          <video
            src={video.url}
            autoPlay
            controls
            playsInline
            loop
            className="w-full h-full object-cover"
          />
        )}
      </div>
    </div>
  );
}

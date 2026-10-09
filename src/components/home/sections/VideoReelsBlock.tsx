"use client";

import { useState, useRef, useEffect } from "react";
import { HomePageSection, VideoItem } from "@/types";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { VideoReelCard } from "./VideoReelCard";
import { VideoReelModal } from "./VideoReelModal";

interface VideoReelsBlockProps {
  section: HomePageSection;
}

function extractVideoId(url?: string): string | null {
  if (!url) return null;
  const regExp = /^.*(youtu\.be\/|v\/|u\/\w\/|embed\/|watch\?v=|shorts\/)([^#&?]*).*/;
  const match = url.match(regExp);
  return match && match[2].length === 11 ? match[2] : null;
}

interface RawVideoRecord {
  _id?: string;
  id?: string;
  url?: string;
  videoUrl?: string;
  videoId?: string;
  caption?: string;
  title?: string;
  thumbnailUrl?: string;
}

function normalizeVideos(input: unknown): VideoItem[] {
  if (!Array.isArray(input)) return [];
  return (input as RawVideoRecord[]).map((v, i) => {
    const id = v._id || v.id || `video-${i}`;
    const url = v.url || v.videoUrl || "";
    const videoId = v.videoId || extractVideoId(url) || `vid-${i}`;
    const caption = v.caption || v.title || `Featured Reel #${i + 1}`;
    const thumbnailUrl =
      v.thumbnailUrl ||
      (videoId && !videoId.startsWith("vid-")
        ? `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`
        : "https://images.unsplash.com/photo-1536240478700-b869070f9279?w=600&auto=format&fit=crop&q=80");

    return { _id: id, id, url, videoId, caption, thumbnailUrl };
  });
}

export function VideoReelsBlock({ section }: VideoReelsBlockProps) {
  const { config = {}, data } = section;
  const scrollRef = useRef<HTMLDivElement>(null);
  const [activeModalVideo, setActiveModalVideo] = useState<VideoItem | null>(null);

  const raw = Array.isArray(data) && data.length > 0 ? data : config.videos;
  const videos = normalizeVideos(raw);

  const thumbnailShape = config.thumbnailShape === "square" ? "square" : "portrait";
  const isPortrait = thumbnailShape === "portrait";
  const motion = config.motion === "autoscroll" ? "autoscroll" : "manual";

  useEffect(() => {
    if (motion !== "autoscroll" || !scrollRef.current) return;
    const interval = setInterval(() => {
      if (scrollRef.current) {
        const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
        if (scrollLeft + clientWidth >= scrollWidth - 10) {
          scrollRef.current.scrollTo({ left: 0, behavior: "smooth" });
        } else {
          scrollRef.current.scrollBy({ left: 220, behavior: "smooth" });
        }
      }
    }, 4000);
    return () => clearInterval(interval);
  }, [motion]);

  const scroll = (direction: "left" | "right") => {
    if (!scrollRef.current) return;
    scrollRef.current.scrollBy({
      left: direction === "left" ? -300 : 300,
      behavior: "smooth",
    });
  };

  if (videos.length === 0) return null;

  return (
    <div className="relative group/reels">
      <div
        ref={scrollRef}
        className="flex gap-4 overflow-x-auto scroll-smooth scrollbar-none pb-4 snap-x snap-mandatory"
      >
        {videos.map((video) => (
          <VideoReelCard
            key={video.id || video._id}
            video={video}
            isPortrait={isPortrait}
            onClick={() => setActiveModalVideo(video)}
          />
        ))}
      </div>

      <button
        onClick={() => scroll("left")}
        className="absolute -left-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white border border-slate-200 shadow-md text-slate-700 hover:text-blue-600 transition-all opacity-0 group-hover/reels:opacity-100 hidden sm:flex items-center justify-center cursor-pointer z-10"
        aria-label="Scroll left"
      >
        <ChevronLeft className="w-5 h-5" />
      </button>
      <button
        onClick={() => scroll("right")}
        className="absolute -right-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white border border-slate-200 shadow-md text-slate-700 hover:text-blue-600 transition-all opacity-0 group-hover/reels:opacity-100 hidden sm:flex items-center justify-center cursor-pointer z-10"
        aria-label="Scroll right"
      >
        <ChevronRight className="w-5 h-5" />
      </button>

      {activeModalVideo && (
        <VideoReelModal
          video={activeModalVideo}
          onClose={() => setActiveModalVideo(null)}
        />
      )}
    </div>
  );
}

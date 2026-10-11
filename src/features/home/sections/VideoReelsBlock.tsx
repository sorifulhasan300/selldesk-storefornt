"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { HomePageSection, VideoItem } from "@/shared/types";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { VideoReelCard, VideoThumbnailShape } from "./VideoReelCard";
import { VideoReelModal } from "./VideoReelModal";
import {
  parsePx,
  parsePxOrUndef,
  buildCardVariables,
} from "../utils/section-styles.utils";

interface VideoReelsBlockProps {
  section: HomePageSection;
}

function extractVideoId(url?: string): string | null {
  if (!url) return null;
  const regExp =
    /^.*(youtu\.be\/|v\/|u\/\w\/|embed\/|watch\?v=|shorts\/)([^#&?]*).*/;
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
  const { config = {}, styles = {}, data } = section;
  const scrollRef = useRef<HTMLDivElement>(null);
  const [activeModalVideo, setActiveModalVideo] = useState<VideoItem | null>(null);
  const [isPaused, setIsPaused] = useState(false);

  const raw = Array.isArray(data) && data.length > 0 ? data : config.videos;
  const videos = normalizeVideos(raw);

  const rawShape = String(config.thumbnailShape || "").toLowerCase().trim();
  const thumbnailShape: VideoThumbnailShape =
    rawShape === "landscape"
      ? "landscape"
      : rawShape === "square"
      ? "square"
      : "portrait";

  const cardWidth = parsePxOrUndef(config.cardWidth);
  const cardGap = parsePx(config.cardGap ?? styles.cardGap, 16);
  const cardRadius = parsePxOrUndef(config.cardRadius ?? styles.borderRadius);

  const showArrows =
    config.showArrows !== false && config.showNavArrows !== false;

  const isAutoscroll =
    config.motion === "autoscroll" || config.autoplay === true;

  const scrollStep =
    (cardWidth || (thumbnailShape === "landscape" ? 280 : 220)) + cardGap;

  useEffect(() => {
    if (!isAutoscroll || isPaused || !scrollRef.current) return;
    const interval = setInterval(() => {
      if (scrollRef.current) {
        const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
        if (scrollLeft + clientWidth >= scrollWidth - 10) {
          scrollRef.current.scrollTo({ left: 0, behavior: "smooth" });
        } else {
          scrollRef.current.scrollBy({ left: scrollStep, behavior: "smooth" });
        }
      }
    }, 4000);
    return () => clearInterval(interval);
  }, [isAutoscroll, isPaused, scrollStep]);

  const scroll = useCallback(
    (direction: "left" | "right") => {
      if (!scrollRef.current) return;
      const containerWidth = scrollRef.current.clientWidth;
      const scrollAmount = Math.max(
        scrollStep,
        Math.floor(containerWidth * 0.75),
      );
      scrollRef.current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      });
    },
    [scrollStep],
  );

  if (videos.length === 0) return null;

  return (
    <div
      className="relative group/reels"
      style={buildCardVariables(section)}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <div
        ref={scrollRef}
        style={{ gap: `${cardGap}px` }}
        className="flex overflow-x-auto scroll-smooth scrollbar-none pb-4 snap-x snap-mandatory touch-pan-x"
      >
        {videos.map((video) => (
          <VideoReelCard
            key={video.id || video._id}
            video={video}
            thumbnailShape={thumbnailShape}
            cardWidth={cardWidth}
            cardGap={cardGap}
            cardRadius={cardRadius}
            onClick={() => setActiveModalVideo(video)}
          />
        ))}
      </div>

      {showArrows && (
        <>
          <button
            type="button"
            onClick={() => scroll("left")}
            className="absolute -left-3 sm:-left-4 top-1/2 -translate-y-1/2 w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-white/95 border border-slate-200 shadow-md text-slate-700 hover:text-[var(--store-primary)] hover:bg-white active:scale-95 transition-all flex items-center justify-center cursor-pointer z-10 touch-manipulation focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--store-primary)]"
            aria-label="Scroll left"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            type="button"
            onClick={() => scroll("right")}
            className="absolute -right-3 sm:-right-4 top-1/2 -translate-y-1/2 w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-white/95 border border-slate-200 shadow-md text-slate-700 hover:text-[var(--store-primary)] hover:bg-white active:scale-95 transition-all flex items-center justify-center cursor-pointer z-10 touch-manipulation focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--store-primary)]"
            aria-label="Scroll right"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </>
      )}

      {activeModalVideo && (
        <VideoReelModal
          video={activeModalVideo}
          onClose={() => setActiveModalVideo(null)}
        />
      )}
    </div>
  );
}


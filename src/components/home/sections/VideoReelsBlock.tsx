"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import { HomePageSection, VideoItem } from "@/types";
import { Play, X, ChevronLeft, ChevronRight, Volume2, VolumeX } from "lucide-react";

interface VideoReelsBlockProps {
  section: HomePageSection;
}

export function VideoReelsBlock({ section }: VideoReelsBlockProps) {
  const { config = {}, styles = {}, data } = section;
  const scrollRef = useRef<HTMLDivElement>(null);
  const [activeModalVideo, setActiveModalVideo] = useState<VideoItem | null>(null);
  const [isMuted, setIsMuted] = useState(true);

  // Normalize video items from data or config
  const rawVideos: any[] = Array.isArray(data) && data.length > 0
    ? data
    : Array.isArray(config.videos) && config.videos.length > 0
    ? config.videos
    : config.videoUrl
    ? [{ url: config.videoUrl, videoId: config.videoId, caption: section.title }]
    : [];

  const videos: VideoItem[] =
    rawVideos.length > 0
      ? rawVideos.map((v, i) => {
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
        })
      : [
          {
            id: "sample-reel-1",
            videoId: "dQw4w9WgXcQ",
            url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
            caption: "Behind the Scenes: Handcrafted Quality",
            thumbnailUrl:
              "https://images.unsplash.com/photo-1536240478700-b869070f9279?w=600&auto=format&fit=crop&q=80",
          },
          {
            id: "sample-reel-2",
            videoId: "dQw4w9WgXcQ",
            url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
            caption: "Unboxing Our Trending Collection",
            thumbnailUrl:
              "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&auto=format&fit=crop&q=80",
          },
          {
            id: "sample-reel-3",
            videoId: "dQw4w9WgXcQ",
            url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
            caption: "Customer First Impressions & Review",
            thumbnailUrl:
              "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&auto=format&fit=crop&q=80",
          },
        ];

  const thumbnailShape = config.thumbnailShape || "portrait"; // 'portrait' | 'square'
  const isPortrait = thumbnailShape === "portrait";
  const motion = config.motion || "manual"; // 'autoscroll' | 'manual'

  // Autoscroll motion if configured
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
    const scrollAmount = 300;
    scrollRef.current.scrollBy({
      left: direction === "left" ? -scrollAmount : scrollAmount,
      behavior: "smooth",
    });
  };

  return (
    <div className="relative group/reels">
      {/* Video Reels Carousel */}
      <div
        ref={scrollRef}
        className="flex gap-4 overflow-x-auto scroll-smooth scrollbar-none pb-4 snap-x snap-mandatory"
      >
        {videos.map((video) => (
          <div
            key={video.id || video._id}
            onClick={() => setActiveModalVideo(video)}
            className={`group/card relative flex-none ${
              isPortrait
                ? "w-[180px] sm:w-[220px] aspect-[9/16]"
                : "w-[180px] sm:w-[220px] aspect-square"
            } rounded-2xl overflow-hidden cursor-pointer snap-start bg-slate-900 border border-slate-200/80 shadow-xs hover:shadow-xl hover:scale-[1.02] transition-all duration-300`}
          >
            {/* Thumbnail Image */}
            <Image
              src={video.thumbnailUrl!}
              alt={video.caption || "Video reel thumbnail"}
              fill
              sizes="(max-width: 768px) 50vw, 220px"
              className="object-cover group-hover/card:scale-105 transition-transform duration-500"
            />

            {/* Dark gradient for text readability */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent" />

            {/* Center Play Button Pulse */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-12 h-12 rounded-full bg-white/30 backdrop-blur-md flex items-center justify-center text-white group-hover/card:scale-110 group-hover/card:bg-blue-600 transition-all duration-300 shadow-md">
                <Play className="w-5 h-5 fill-current ml-0.5" />
              </div>
            </div>

            {/* Video Caption & Badge */}
            <div className="absolute bottom-3 left-3 right-3 text-white space-y-1">
              <span className="inline-block px-2 py-0.5 rounded-full bg-blue-600/80 text-[10px] font-bold uppercase tracking-wider backdrop-blur-xs">
                Short
              </span>
              <p className="text-xs font-semibold line-clamp-2 leading-snug">
                {video.caption}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Carousel Navigation Buttons */}
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

      {/* Fullscreen / Modal Reel Player */}
      {activeModalVideo && (
        <div
          className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setActiveModalVideo(null)}
        >
          <div
            className="relative w-full max-w-sm sm:max-w-md bg-black rounded-3xl overflow-hidden shadow-2xl aspect-[9/16] flex flex-col justify-between"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Close Button */}
            <button
              onClick={() => setActiveModalVideo(null)}
              className="absolute top-4 right-4 z-20 p-2 rounded-full bg-black/50 text-white hover:bg-white hover:text-slate-900 transition-colors cursor-pointer"
              aria-label="Close video reel"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Video Iframe / Player */}
            {activeModalVideo.videoId && !activeModalVideo.videoId.startsWith("vid-") ? (
              <iframe
                src={`https://www.youtube.com/embed/${activeModalVideo.videoId}?autoplay=1&mute=0&loop=1&playsinline=1`}
                title={activeModalVideo.caption || "Reel Player"}
                className="w-full h-full border-0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            ) : (
              <video
                src={activeModalVideo.url}
                autoPlay
                controls
                playsInline
                loop
                className="w-full h-full object-cover"
              />
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function extractVideoId(url: string): string | null {
  if (!url) return null;
  const regExp =
    /^.*(youtu\.be\/|v\/|u\/\w\/|embed\/|watch\?v=|shorts\/)([^#&?]*).*/;
  const match = url.match(regExp);
  return match && match[2].length === 11 ? match[2] : null;
}


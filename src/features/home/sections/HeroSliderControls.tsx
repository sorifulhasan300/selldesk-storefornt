"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/shared/lib/utils";

interface HeroSliderControlsProps {
  slidesCount: number;
  current: number;
  showArrows: boolean;
  showDots: boolean;
  onPrev: () => void;
  onNext: () => void;
  onSelect: (index: number) => void;
}

export function HeroSliderControls({
  slidesCount,
  current,
  showArrows,
  showDots,
  onPrev,
  onNext,
  onSelect,
}: HeroSliderControlsProps) {
  if (slidesCount <= 1) return null;

  return (
    <>
      {showArrows && (
        <>
          <button
            type="button"
            onClick={onPrev}
            className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 z-30 p-2 sm:p-2.5 rounded-full bg-white/40 hover:bg-white text-white hover:text-slate-900 backdrop-blur-md transition-all cursor-pointer shadow-md flex items-center justify-center focus:outline-none focus-visible:ring-2 focus-visible:ring-white"
            aria-label="Previous slide"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            type="button"
            onClick={onNext}
            className="absolute right-3 sm:right-4 top-1/2 -translate-y-1/2 z-30 p-2 sm:p-2.5 rounded-full bg-white/40 hover:bg-white text-white hover:text-slate-900 backdrop-blur-md transition-all cursor-pointer shadow-md flex items-center justify-center focus:outline-none focus-visible:ring-2 focus-visible:ring-white"
            aria-label="Next slide"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </>
      )}

      {showDots && (
        <div className="absolute bottom-4 sm:bottom-5 left-1/2 -translate-x-1/2 z-30 flex items-center gap-2">
          {Array.from({ length: slidesCount }).map((_, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => onSelect(idx)}
              className={cn(
                "h-2 rounded-full transition-all duration-300 cursor-pointer",
                current === idx
                  ? "w-7 bg-white shadow-sm"
                  : "w-2 bg-white/50 hover:bg-white/80",
              )}
              aria-label={`Go to slide ${idx + 1}`}
            />
          ))}
        </div>
      )}
    </>
  );
}



"use client";

import { useState, useEffect, useRef, useCallback } from "react";

interface UseHeroSliderOptions {
  slidesCount: number;
  autoPlayInterval: number;
}

export function useHeroSlider({
  slidesCount,
  autoPlayInterval,
}: UseHeroSliderOptions) {
  const [current, setCurrent] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const touchStartX = useRef<number | null>(null);

  const nextSlide = useCallback(() => {
    if (slidesCount <= 1) return;
    setCurrent((prev) => (prev + 1) % slidesCount);
  }, [slidesCount]);

  const prevSlide = useCallback(() => {
    if (slidesCount <= 1) return;
    setCurrent((prev) => (prev - 1 + slidesCount) % slidesCount);
  }, [slidesCount]);

  useEffect(() => {
    if (slidesCount <= 1 || isPaused || autoPlayInterval <= 0) return;
    const interval = setInterval(nextSlide, autoPlayInterval);
    return () => clearInterval(interval);
  }, [slidesCount, isPaused, autoPlayInterval, nextSlide]);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    const diff = touchStartX.current - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 50) {
      if (diff > 0) nextSlide();
      else prevSlide();
    }
    touchStartX.current = null;
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowLeft") prevSlide();
    if (e.key === "ArrowRight") nextSlide();
  };

  return {
    current,
    setCurrent,
    setIsPaused,
    nextSlide,
    prevSlide,
    handleTouchStart,
    handleTouchEnd,
    handleKeyDown,
  };
}

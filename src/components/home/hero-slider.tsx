"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { StoreSlider } from "@/types";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface HeroSliderProps {
  sliders: StoreSlider[];
}

export function HeroSlider({ sliders }: HeroSliderProps) {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    if (sliders.length <= 1) return;
    const interval = setInterval(() => {
      setCurrent((prev) => (prev + 1) % sliders.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [sliders.length]);

  if (!sliders || sliders.length === 0) return null;

  const activeSlider = sliders[current];

  return (
    <div className="relative w-full h-[280px] sm:h-[380px] lg:h-[480px] rounded-3xl overflow-hidden shadow-sm bg-slate-900 group">
      {/* Background Banner Image */}
      <Image
        src={activeSlider.imageUrl}
        alt={activeSlider.title}
        fill
        priority
        className="object-cover object-center opacity-85 transition-opacity duration-700"
      />

      {/* Gradient Overlay & Content */}
      <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent flex items-center px-8 sm:px-14 lg:px-20">
        <div className="max-w-xl text-white space-y-4">
          <span className="inline-block px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-xs font-semibold uppercase tracking-wider text-white">
            Exclusive Collection
          </span>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight leading-tight">
            {activeSlider.title}
          </h1>
          {activeSlider.subtitle && (
            <p className="text-sm sm:text-base text-slate-200 line-clamp-2">
              {activeSlider.subtitle}
            </p>
          )}
          {activeSlider.linkUrl ? (
            <Link
              href={activeSlider.linkUrl}
              className="inline-block mt-2 px-6 py-3 bg-white text-slate-900 font-bold text-sm rounded-xl hover:bg-blue-600 hover:text-white transition-all shadow-md"
            >
              Shop Collection
            </Link>
          ) : (
            <Link
              href="/products"
              className="inline-block mt-2 px-6 py-3 bg-white text-slate-900 font-bold text-sm rounded-xl hover:bg-blue-600 hover:text-white transition-all shadow-md"
            >
              Explore Now
            </Link>
          )}
        </div>
      </div>

      {/* Navigation arrows (if > 1 slide) */}
      {sliders.length > 1 && (
        <>
          <button
            onClick={() =>
              setCurrent((prev) => (prev - 1 + sliders.length) % sliders.length)
            }
            className="absolute left-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white/20 backdrop-blur-md text-white hover:bg-white hover:text-slate-900 transition-all opacity-0 group-hover:opacity-100"
            aria-label="Previous slide"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            onClick={() => setCurrent((prev) => (prev + 1) % sliders.length)}
            className="absolute right-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white/20 backdrop-blur-md text-white hover:bg-white hover:text-slate-900 transition-all opacity-0 group-hover:opacity-100"
            aria-label="Next slide"
          >
            <ChevronRight className="w-5 h-5" />
          </button>

          {/* Dots Indicator */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
            {sliders.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrent(idx)}
                className={`h-2 rounded-full transition-all ${
                  current === idx ? "w-6 bg-white" : "w-2 bg-white/50"
                }`}
                aria-label={`Go to slide ${idx + 1}`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}

"use client";

import { useState } from "react";
import Image from "next/image";

interface ProductGalleryProps {
  images: string[];
  title: string;
}

export function ProductGallery({ images, title }: ProductGalleryProps) {
  const fallback =
    "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&auto=format&fit=crop&q=80";
  const displayImages = images?.length > 0 ? images : [fallback];
  const [selected, setSelected] = useState(0);

  return (
    <div className="flex flex-col-reverse sm:flex-row gap-4">
      {/* Thumbnails (vertical on desktop, horizontal on mobile) */}
      {displayImages.length > 1 && (
        <div className="flex sm:flex-col gap-3 overflow-x-auto sm:overflow-y-auto max-h-[500px] shrink-0">
          {displayImages.map((img, idx) => (
            <button
              key={idx}
              onClick={() => setSelected(idx)}
              className={`relative w-18 h-18 rounded-xl overflow-hidden border-2 transition-all ${
                selected === idx
                  ? "border-[var(--store-primary)] ring-2 ring-[var(--store-primary)]/20"
                  : "border-slate-200 hover:border-slate-300"
              }`}
            >
              <Image
                src={img}
                alt={`${title} thumbnail ${idx + 1}`}
                fill
                className="object-cover"
              />
            </button>
          ))}
        </div>
      )}

      {/* Main Large Image */}
      <div className="relative w-full aspect-square rounded-3xl overflow-hidden bg-slate-100 border border-slate-200/80 shadow-xs">
        <Image
          src={displayImages[selected] || fallback}
          alt={title}
          fill
          priority
          sizes="(max-width: 768px) 100vw, 50vw"
          className="object-cover object-center"
        />
      </div>
    </div>
  );
}


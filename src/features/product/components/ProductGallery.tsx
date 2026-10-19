"use client";

import React, { useState, useRef, MouseEvent } from "react";
import Image from "next/image";
import { ShoppingBag, Truck } from "lucide-react";
import { Badge } from "@/shared/ui/badge";

export interface ProductGalleryProps {
  images: string[];
  title: string;
  regularPrice?: number;
  salePrice?: number | null;
  layout?: number;
  imageZoom?: boolean;
  hasFreeDelivery?: boolean;
}

export function ProductGallery({
  images,
  title,
  regularPrice = 0,
  salePrice = null,
  layout = 1,
  imageZoom = true,
  hasFreeDelivery = false,
}: ProductGalleryProps) {
  const displayImages = images?.length > 0 ? images : [];
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [failedImages, setFailedImages] = useState<Set<string>>(() => new Set());

  // Image Zoom state
  const [isZoomed, setIsZoomed] = useState(false);
  const [zoomPosition, setZoomPosition] = useState({ x: 50, y: 50 });
  const containerRef = useRef<HTMLDivElement>(null);

  function markImageFailed(img: string) {
    setFailedImages((prev) => new Set(prev).add(img));
  }

  const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    if (!imageZoom || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setZoomPosition({
      x: Math.max(0, Math.min(100, x)),
      y: Math.max(0, Math.min(100, y)),
    });
  };

  const handleMouseEnter = () => {
    if (imageZoom) setIsZoomed(true);
  };

  const handleMouseLeave = () => {
    if (imageZoom) {
      setIsZoomed(false);
      setZoomPosition({ x: 50, y: 50 });
    }
  };

  const hasDiscount = Boolean(
    salePrice != null && regularPrice > 0 && salePrice < regularPrice,
  );
  const discountPercent =
    hasDiscount && salePrice != null
      ? Math.round(((regularPrice - salePrice) / regularPrice) * 100)
      : 0;

  const currentImage = displayImages[selectedIndex];
  const isCurrentFailed = currentImage ? failedImages.has(currentImage) : true;

  const badgesElement = (
    <div className="pointer-events-none absolute top-4 left-4 right-4 z-20 flex items-start justify-between gap-2">
      {hasFreeDelivery ? (
        <Badge className="bg-emerald-600 hover:bg-emerald-600 text-white font-bold text-xs px-3 py-1 rounded-full shadow-md flex items-center gap-1.5 backdrop-blur-xs">
          <Truck className="w-3.5 h-3.5" />
          <span>Free Delivery</span>
        </Badge>
      ) : (
        <span />
      )}

      {hasDiscount && discountPercent > 0 && (
        <Badge className="bg-rose-500 hover:bg-rose-500 text-white font-extrabold text-xs px-3 py-1 rounded-full shadow-md ml-auto">
          {discountPercent}% Discount
        </Badge>
      )}
    </div>
  );

  const renderMainImage = () => (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className={`group relative w-full aspect-square rounded-3xl overflow-hidden bg-slate-50 border border-slate-200/80 shadow-xs flex items-center justify-center select-none ${
        imageZoom ? "cursor-crosshair" : "cursor-default"
      }`}
    >
      {badgesElement}

      {/* Large Main Image */}
      {currentImage && !isCurrentFailed ? (
        <div className="relative w-full h-full overflow-hidden">
          <Image
            src={currentImage}
            alt={title}
            fill
            priority
            sizes="(max-width: 1024px) 100vw, 600px"
            className="object-cover object-center transition-transform duration-200 ease-out will-change-transform"
            style={{
              transformOrigin: `${zoomPosition.x}% ${zoomPosition.y}%`,
              transform: imageZoom && isZoomed ? "scale(2.2)" : "scale(1)",
            }}
            onError={() => markImageFailed(currentImage)}
          />
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center text-slate-300">
          <ShoppingBag className="w-20 h-20" />
          <span className="text-xs font-semibold text-slate-400 mt-2">
            No image available
          </span>
        </div>
      )}
    </div>
  );

  const renderThumbnails = (orientation: "horizontal" | "vertical") => {
    if (displayImages.length <= 1) return null;

    return (
      <div
        className={
          orientation === "vertical"
            ? "flex sm:flex-col items-center gap-3 overflow-x-auto sm:overflow-y-auto w-full sm:w-20 shrink-0 sm:max-h-[500px] scrollbar-thin scrollbar-thumb-slate-200 pb-2 sm:pb-0"
            : "flex items-center gap-3 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-slate-200"
        }
      >
        {displayImages.map((img, idx) => {
          const isSelected = selectedIndex === idx;
          const isFailed = failedImages.has(img);

          return (
            <button
              key={idx}
              type="button"
              onClick={() => setSelectedIndex(idx)}
              onMouseEnter={() => setSelectedIndex(idx)}
              aria-label={`Select product image ${idx + 1}`}
              className={`relative w-[72px] h-[72px] shrink-0 rounded-xl overflow-hidden bg-white transition-all cursor-pointer border-2 ${
                isSelected
                  ? "border-[var(--store-primary)] ring-2 ring-[var(--store-primary)]/30 scale-102 shadow-sm"
                  : "border-slate-200/90 hover:border-slate-300 opacity-75 hover:opacity-100"
              }`}
            >
              {isFailed ? (
                <div className="flex items-center justify-center h-full w-full bg-slate-100">
                  <ShoppingBag className="w-5 h-5 text-slate-300" />
                </div>
              ) : (
                <Image
                  src={img}
                  alt={`${title} thumbnail ${idx + 1}`}
                  fill
                  sizes="72px"
                  className="object-cover object-center"
                  onError={() => markImageFailed(img)}
                />
              )}
            </button>
          );
        })}
      </div>
    );
  };

  // Layout 3: Editorial Grid (2-column or stacked high-res image gallery without thumbnail strip)
  if (layout === 3) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full">
        <div className="col-span-1 sm:col-span-2">
          {renderMainImage()}
        </div>
        {displayImages.slice(1).map((img, idx) => {
          const isFailed = failedImages.has(img);
          return (
            <div
              key={idx + 1}
              className="relative w-full aspect-square rounded-3xl overflow-hidden bg-slate-50 border border-slate-200/80 shadow-xs flex items-center justify-center select-none"
            >
              {isFailed ? (
                <div className="flex flex-col items-center justify-center text-slate-300">
                  <ShoppingBag className="w-12 h-12" />
                </div>
              ) : (
                <Image
                  src={img}
                  alt={`${title} gallery image ${idx + 2}`}
                  fill
                  sizes="(max-width: 1024px) 100vw, 400px"
                  className="object-cover object-center"
                  onError={() => markImageFailed(img)}
                />
              )}
            </div>
          );
        })}
      </div>
    );
  }

  // Layout 2: Modern (Vertical thumbnail strip on the left, main image on the right)
  if (layout === 2) {
    return (
      <div className="flex flex-col-reverse sm:flex-row gap-4 w-full items-start">
        {renderThumbnails("vertical")}
        <div className="flex-1 w-full min-w-0">{renderMainImage()}</div>
      </div>
    );
  }

  // Layout 1 (Classic): Main image on top with horizontal thumbnail row below
  return (
    <div className="flex flex-col gap-4 w-full">
      {renderMainImage()}
      {renderThumbnails("horizontal")}
    </div>
  );
}

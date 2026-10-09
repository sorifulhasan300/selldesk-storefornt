"use client";

import Image from "next/image";
import { HomePageSection, ReviewItem } from "@/types";
import { Star, Quote, CheckCircle2 } from "lucide-react";

interface CustomerReviewsBlockProps {
  section: HomePageSection;
}

export function CustomerReviewsBlock({ section }: CustomerReviewsBlockProps) {
  const { config = {}, styles = {}, data } = section;

  // Extract review items
  const rawReviews: any[] = Array.isArray(data) && data.length > 0
    ? data
    : Array.isArray(config.reviews) && config.reviews.length > 0
    ? config.reviews
    : Array.isArray(config.reviewItems) && config.reviewItems.length > 0
    ? config.reviewItems
    : [];

  const reviews: ReviewItem[] =
    rawReviews.length > 0
      ? rawReviews.map((r, i) => ({
          _id: r._id || r.id || `review-${i}`,
          id: r.id || r._id || `review-${i}`,
          name: r.name || r.reviewerName || "Verified Customer",
          profession: r.profession || r.role || "Verified Buyer",
          rating: typeof r.rating === "number" ? Math.min(5, Math.max(1, r.rating)) : 5,
          text: r.text || r.comment || "Outstanding product quality and lightning-fast delivery!",
          picture: r.picture || r.avatarUrl,
          date: r.date,
        }))
      : [
          {
            id: "rev-1",
            name: "Sarah Jenkins",
            profession: "Interior Designer",
            rating: 5,
            text: "Absolutely in love with the quality! Arrived within two days in pristine packaging. Will definitely order again.",
            picture:
              "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&auto=format&fit=crop&q=80",
          },
          {
            id: "rev-2",
            name: "David Chen",
            profession: "Tech Consultant",
            rating: 5,
            text: "Exceeded all my expectations. The build quality feels ultra-premium and the customer support was remarkably responsive.",
            picture:
              "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80",
          },
          {
            id: "rev-3",
            name: "Elena Rostova",
            profession: "Product Manager",
            rating: 5,
            text: "Hands down the best shopping experience this year. Clean interface, transparent tracking, and top-tier merchandise.",
            picture:
              "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80",
          },
        ];

  if (reviews.length === 0) return null;

  const desktopCols =
    config.columns || styles.columns || 3;
  const mobileCols =
    config.mobileColumns || styles.mobileColumns || 1;

  const getDesktopGridClass = (cols: number) => {
    switch (cols) {
      case 2:
        return "md:grid-cols-2";
      case 4:
        return "md:grid-cols-2 lg:grid-cols-4";
      case 3:
      default:
        return "md:grid-cols-3";
    }
  };

  const getMobileGridClass = (cols: number) => {
    switch (cols) {
      case 2:
        return "grid-cols-2";
      case 1:
      default:
        return "grid-cols-1";
    }
  };

  return (
    <div
      className={`grid ${getMobileGridClass(mobileCols)} ${getDesktopGridClass(
        desktopCols,
      )} gap-4 sm:gap-6`}
    >
      {reviews.map((review) => (
        <div
          key={review.id || review._id}
          className="relative bg-white rounded-2xl border border-slate-200/80 p-6 shadow-2xs hover:shadow-md transition-all duration-300 flex flex-col justify-between"
        >
          {/* Subtle background quote watermark */}
          <div className="absolute top-5 right-5 text-slate-100 pointer-events-none">
            <Quote className="w-10 h-10" />
          </div>

          <div>
            {/* Rating Stars */}
            <div className="flex items-center gap-1 mb-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  className={`w-4 h-4 ${
                    i < review.rating
                      ? "text-amber-400 fill-amber-400"
                      : "text-slate-200 fill-slate-200"
                  }`}
                />
              ))}
              <span className="text-xs font-bold text-slate-700 ml-1.5">
                {review.rating}.0
              </span>
            </div>

            {/* Quote Text */}
            <p className="text-sm text-slate-700 leading-relaxed italic line-clamp-4 relative z-10">
              "{review.text}"
            </p>
          </div>

          {/* Customer Profile Footer */}
          <div className="pt-4 mt-4 border-t border-slate-100 flex items-center gap-3">
            {review.picture ? (
              <div className="relative w-10 h-10 rounded-full overflow-hidden bg-slate-100 shrink-0">
                <Image
                  src={review.picture}
                  alt={review.name || "Customer"}
                  fill
                  sizes="40px"
                  className="object-cover"
                />
              </div>
            ) : (
              <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-700 font-bold text-sm flex items-center justify-center shrink-0">
                {(review.name || "C").charAt(0).toUpperCase()}
              </div>
            )}

            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1">
                <h4 className="text-xs sm:text-sm font-bold text-slate-900 truncate">
                  {review.name}
                </h4>
                <CheckCircle2 className="w-3.5 h-3.5 text-blue-600 shrink-0" />
              </div>
              <p className="text-[11px] text-slate-400 truncate">
                {review.profession || "Verified Buyer"}
              </p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}


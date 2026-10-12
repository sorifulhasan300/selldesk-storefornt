import Image from "next/image";
import { ReviewItem } from "@/shared/types";
import { Star, Quote, CheckCircle2 } from "lucide-react";

interface CustomerReviewCardProps {
  review: ReviewItem;
  showRating?: boolean;
  showProfile?: boolean;
  cardRadius?: number;
}

export function CustomerReviewCard({
  review,
  showRating = true,
  showProfile = true,
  cardRadius = 14,
}: CustomerReviewCardProps) {
  return (
    <div
      style={{ borderRadius: `${cardRadius}px` }}
      className="relative bg-white border border-slate-200/80 p-6 shadow-2xs hover:shadow-md transition-all duration-300 flex flex-col justify-between"
    >
      <div className="absolute top-5 right-5 text-slate-100 pointer-events-none">
        <Quote className="w-10 h-10" />
      </div>

      <div>
        {showRating && (
          <div className="mb-4 flex items-center gap-1">
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
            <span className="ml-1.5 text-xs font-bold text-slate-700">
              {review.rating}.0
            </span>
          </div>
        )}

        <p className="text-sm text-slate-700 leading-relaxed italic line-clamp-4 relative z-10">
          &ldquo;{review.text}&rdquo;
        </p>
      </div>

      {showProfile && (
        <div className="mt-4 flex items-center gap-3 border-t border-slate-100 pt-4">
          {review.picture ? (
            <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-full bg-slate-100">
              <Image
                src={review.picture}
                alt={review.name || "Customer"}
                fill
                sizes="40px"
                className="object-cover"
              />
            </div>
          ) : (
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[var(--store-primary)]/10 text-sm font-bold text-[var(--store-primary)]">
              {Array.from(review.name || "C")[0]?.toUpperCase()}
            </div>
          )}

          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1">
              <h4 className="truncate text-xs font-bold text-slate-900 sm:text-sm">
                {review.name || "Customer"}
              </h4>
              <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-[var(--store-primary)]" />
            </div>
            <p className="truncate text-[11px] text-slate-400">
              {review.profession || "Verified Buyer"}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

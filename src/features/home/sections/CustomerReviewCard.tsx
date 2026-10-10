import Image from "next/image";
import { ReviewItem } from "@/shared/types";
import { Star, Quote, CheckCircle2 } from "lucide-react";

interface CustomerReviewCardProps {
  review: ReviewItem;
}

export function CustomerReviewCard({ review }: CustomerReviewCardProps) {
  return (
    <div className="relative bg-white rounded-2xl border border-slate-200/80 p-6 shadow-2xs hover:shadow-md transition-all duration-300 flex flex-col justify-between">
      <div className="absolute top-5 right-5 text-slate-100 pointer-events-none">
        <Quote className="w-10 h-10" />
      </div>

      <div>
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

        <p className="text-sm text-slate-700 leading-relaxed italic line-clamp-4 relative z-10">
          &ldquo;{review.text}&rdquo;
        </p>
      </div>

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
  );
}

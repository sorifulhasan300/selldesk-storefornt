"use client";

import { HomePageSection, ReviewItem } from "@/shared/types";
import { CustomerReviewCard } from "./CustomerReviewCard";
import {
  getDesktopGridClass,
  getMobileGridClass,
} from "../utils/grid-layout.utils";

interface CustomerReviewsBlockProps {
  section: HomePageSection;
}

interface RawReviewRecord {
  _id?: string;
  id?: string;
  name?: string;
  reviewerName?: string;
  profession?: string;
  role?: string;
  rating?: number;
  text?: string;
  comment?: string;
  picture?: string;
  avatarUrl?: string;
  date?: string;
}

function normalizeReviews(input: unknown): ReviewItem[] {
  if (!Array.isArray(input)) return [];
  return (input as RawReviewRecord[]).map((r, i) => ({
    _id: r._id || r.id || `review-${i}`,
    id: r.id || r._id || `review-${i}`,
    name: r.name || r.reviewerName || "Verified Customer",
    profession: r.profession || r.role || "Verified Buyer",
    rating:
      typeof r.rating === "number" ? Math.min(5, Math.max(1, r.rating)) : 5,
    text:
      r.text ||
      r.comment ||
      "Outstanding product quality and lightning-fast delivery!",
    picture: r.picture || r.avatarUrl,
    date: r.date,
  }));
}

export function CustomerReviewsBlock({ section }: CustomerReviewsBlockProps) {
  const { config = {}, styles = {}, data } = section;

  const raw =
    Array.isArray(data) && data.length > 0
      ? data
      : Array.isArray(config.reviews)
      ? config.reviews
      : config.reviewItems;

  const reviews = normalizeReviews(raw);
  if (reviews.length === 0) return null;

  const desktopCols = Number(config.columns || styles.columns || 3);
  const mobileCols = Number(config.mobileColumns || styles.mobileColumns || 1);

  return (
    <div
      className={`grid ${getMobileGridClass(mobileCols)} ${getDesktopGridClass(
        desktopCols,
      )} gap-4 sm:gap-6`}
    >
      {reviews.map((review) => (
        <CustomerReviewCard
          key={review.id || review._id}
          review={review}
        />
      ))}
    </div>
  );
}


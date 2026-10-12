"use client";

import { HomePageSection, ReviewItem } from "@/shared/types";
import { CustomerReviewCard } from "./CustomerReviewCard";
import {
  getDesktopGridClass,
  getMobileGridClass,
} from "../utils/grid-layout.utils";
import { SectionEmptyPlaceholder } from "./SectionEmptyPlaceholder";

interface CustomerReviewsBlockProps {
  section: HomePageSection;
  isPreview?: boolean;
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
  return (input as RawReviewRecord[])
    .filter((review) => review && Boolean(review.text || review.comment))
    .map((review, i) => ({
      _id: review._id || review.id || `review-${i}`,
      id: review.id || review._id || `review-${i}`,
      name: review.name || review.reviewerName || "Customer",
      profession: review.profession || review.role || undefined,
      rating:
        typeof review.rating === "number"
          ? Math.min(5, Math.max(1, review.rating))
          : 5,
      text: review.text || review.comment || "",
      picture: review.picture || review.avatarUrl,
      date: review.date,
    }));
}

export function CustomerReviewsBlock({
  section,
  isPreview = false,
}: CustomerReviewsBlockProps) {
  const { config = {}, styles = {}, data } = section;

  const raw = config.reviews ?? config.reviewItems ?? data;

  const reviews = normalizeReviews(raw);
  if (reviews.length === 0) {
    return isPreview ? (
      <SectionEmptyPlaceholder itemType="Review" />
    ) : null;
  }

  const desktopCols = Number(config.columns ?? styles.columns ?? 3);
  const mobileCols = Number(config.mobileColumns ?? styles.mobileColumns ?? 1);
  const cardGap = Number(config.cardGap ?? 16);
  const cardRadius = Number(config.cardRadius ?? 14);
  const showRating = config.showRating !== false;
  const showProfile = config.showProfile !== false;

  return (
    <div
      className={`grid ${getMobileGridClass(mobileCols)} ${getDesktopGridClass(desktopCols)}`}
      style={{ gap: `${cardGap}px` }}
    >
      {reviews.map((review) => (
        <CustomerReviewCard
          key={review.id || review._id}
          review={review}
          showRating={showRating}
          showProfile={showProfile}
          cardRadius={cardRadius}
        />
      ))}
    </div>
  );
}

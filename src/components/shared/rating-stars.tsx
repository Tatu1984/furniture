"use client";

import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

interface RatingStarsProps {
  rating: number;
  maxRating?: number;
  size?: "sm" | "md" | "lg";
  showValue?: boolean;
  reviewCount?: number;
  className?: string;
}

export function RatingStars({
  rating,
  maxRating = 5,
  size = "md",
  showValue = false,
  reviewCount,
  className,
}: RatingStarsProps) {
  const iconSize = size === "sm" ? 12 : size === "md" ? 16 : 20;

  return (
    <div className={cn("flex items-center gap-1", className)}>
      <div className="flex">
        {Array.from({ length: maxRating }, (_, i) => {
          const filled = i < Math.floor(rating);
          const halfFilled = !filled && i < rating;

          return (
            <Star
              key={i}
              size={iconSize}
              className={cn(
                filled
                  ? "fill-yellow-400 text-yellow-400"
                  : halfFilled
                  ? "fill-yellow-400/50 text-yellow-400"
                  : "fill-muted text-muted-foreground/30"
              )}
            />
          );
        })}
      </div>
      {showValue && (
        <span className="text-sm font-medium text-muted-foreground">
          {rating.toFixed(1)}
        </span>
      )}
      {reviewCount !== undefined && (
        <span className="text-sm text-muted-foreground">
          ({reviewCount})
        </span>
      )}
    </div>
  );
}

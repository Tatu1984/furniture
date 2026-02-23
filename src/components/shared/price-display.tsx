"use client";

import { cn } from "@/lib/utils";

interface PriceDisplayProps {
  price: number;
  compareAtPrice?: number;
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function PriceDisplay({
  price,
  compareAtPrice,
  size = "md",
  className,
}: PriceDisplayProps) {
  const formatPrice = (value: number) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
    }).format(value);

  const discount = compareAtPrice
    ? Math.round(((compareAtPrice - price) / compareAtPrice) * 100)
    : 0;

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <span
        className={cn(
          "font-bold text-foreground",
          size === "sm" && "text-sm",
          size === "md" && "text-lg",
          size === "lg" && "text-2xl"
        )}
      >
        {formatPrice(price)}
      </span>
      {compareAtPrice && compareAtPrice > price && (
        <>
          <span
            className={cn(
              "text-muted-foreground line-through",
              size === "sm" && "text-xs",
              size === "md" && "text-sm",
              size === "lg" && "text-base"
            )}
          >
            {formatPrice(compareAtPrice)}
          </span>
          <span className="text-xs font-medium text-destructive bg-destructive/10 px-1.5 py-0.5 rounded">
            -{discount}%
          </span>
        </>
      )}
    </div>
  );
}

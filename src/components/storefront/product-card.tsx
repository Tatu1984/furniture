"use client";

import Image from "next/image";
import Link from "next/link";
import { ClipboardList, Heart } from "lucide-react";
import { motion } from "motion/react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PriceDisplay } from "@/components/shared/price-display";
import { RatingStars } from "@/components/shared/rating-stars";
import { useWishlistStore } from "@/stores/wishlist-store";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface ProductCardData {
  id: string;
  slug: string;
  name: string;
  price: number;
  compareAtPrice?: number;
  image: string;
  category: string;
  rating: number;
  reviewCount: number;
}

interface ProductCardProps {
  product: ProductCardData;
  className?: string;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function ProductCard({ product, className }: ProductCardProps) {
  const toggleItem = useWishlistStore((s) => s.toggleItem);
  const isInWishlist = useWishlistStore((s) => s.isInWishlist(product.id));

  return (
    <motion.div
      whileHover={{ y: -4 }}
      transition={{ duration: 0.2, ease: "easeOut" }}
      className={cn(
        "group relative flex flex-col overflow-hidden rounded-xl border bg-card shadow-sm transition-shadow hover:shadow-lg",
        className,
      )}
    >
      {/* ── Image ─────────────────────────────────────────────────────── */}
      <Link
        href={`/products/${product.slug}`}
        className="relative aspect-[4/3] overflow-hidden"
      >
        <Image
          src={product.image}
          alt={product.name}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
          className="object-cover transition-transform duration-500 group-hover:scale-110"
        />

        {/* Category badge */}
        <Badge className="absolute bottom-3 left-3 bg-background/80 text-foreground backdrop-blur-sm">
          {product.category}
        </Badge>
      </Link>

      {/* Wishlist toggle */}
      <Button
        variant="ghost"
        size="icon"
        className="absolute top-3 right-3 z-10 size-8 rounded-full bg-background/80 backdrop-blur-sm hover:bg-background"
        onClick={() =>
          toggleItem({
            productId: product.id,
            name: product.name,
            slug: product.slug,
            image: product.image,
            price: product.price,
          })
        }
      >
        <Heart
          className={cn(
            "size-4 transition-colors",
            isInWishlist
              ? "fill-red-500 text-red-500"
              : "text-muted-foreground",
          )}
        />
        <span className="sr-only">
          {isInWishlist ? "Remove from wishlist" : "Add to wishlist"}
        </span>
      </Button>

      {/* ── Info ──────────────────────────────────────────────────────── */}
      <div className="flex flex-1 flex-col gap-2 p-4">
        <Link
          href={`/products/${product.slug}`}
          className="line-clamp-1 font-semibold text-foreground transition-colors hover:text-primary"
        >
          {product.name}
        </Link>

        <RatingStars
          rating={product.rating}
          size="sm"
          reviewCount={product.reviewCount}
        />

        <div className="mt-auto flex items-center justify-between pt-2">
          <PriceDisplay
            price={product.price}
            compareAtPrice={product.compareAtPrice}
          />

          <Button size="sm" asChild>
            <Link href={`/order/${product.slug}`}>
              <ClipboardList className="size-4" />
              <span className="sr-only sm:not-sr-only sm:ml-1">Order</span>
            </Link>
          </Button>
        </div>
      </div>
    </motion.div>
  );
}

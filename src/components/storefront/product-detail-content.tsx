"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import {
  Heart,
  Minus,
  Plus,
  ShoppingCart,
  Star,
  Truck,
  Package,
  CheckCircle,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { BreadcrumbNav } from "@/components/shared/breadcrumb-nav";
import { PriceDisplay } from "@/components/shared/price-display";
import { RatingStars } from "@/components/shared/rating-stars";
import { SectionHeading } from "@/components/shared/section-heading";
import { ProductCard } from "@/components/storefront/product-card";
import { useCartStore } from "@/stores/cart-store";
import { useWishlistStore } from "@/stores/wishlist-store";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface ProductDetail {
  id: string;
  slug: string;
  name: string;
  price: number;
  compareAtPrice?: number;
  category: string;
  categorySlug: string;
  description: string;
  images: string[];
  rating: number;
  reviewCount: number;
  colors: { name: string; hex: string }[];
  sizes: string[];
  materials: string[];
  specifications: { label: string; value: string }[];
  careInstructions: string;
  assemblyRequired: boolean;
  assemblyTime?: string;
  estimatedDelivery: string;
  reviews: {
    id: string;
    name: string;
    avatar: string;
    date: string;
    rating: number;
    title: string;
    text: string;
  }[];
  ratingSummary: { star: number; count: number }[];
}

// ---------------------------------------------------------------------------
// Fetch product from API and map to the shape the JSX expects
// ---------------------------------------------------------------------------

/* eslint-disable @typescript-eslint/no-explicit-any */
function mapApiProduct(p: any): ProductDetail {
  return {
    id: p.id,
    slug: p.slug,
    name: p.name,
    price: Number(p.price ?? 0),
    compareAtPrice: p.compareAtPrice ? Number(p.compareAtPrice) : undefined,
    category: p.category?.name ?? "Furniture",
    categorySlug: p.category?.slug ?? "all",
    description: p.description || p.shortDescription || "",
    images: (p.images ?? []).map((img: any) => img.url),
    rating: Number(p.averageRating ?? 0),
    reviewCount: p._count?.reviews ?? 0,
    colors: (p.materials ?? []).length > 0
      ? [{ name: "Default", hex: "#C4A882" }]
      : [],
    sizes: [],
    materials: p.materials ?? [],
    specifications: (p.specifications ?? []).map((s: any) => ({
      label: s.name ?? s.groupName ?? "",
      value: s.value ?? "",
    })),
    careInstructions: p.careInstructions ?? "",
    assemblyRequired: p.assemblyRequired ?? false,
    assemblyTime: p.assemblyTime ?? undefined,
    estimatedDelivery: p.estimatedDeliveryDays
      ? `Free delivery in ${p.estimatedDeliveryDays} business days`
      : "Free delivery in 5-7 business days",
    reviews: (p.reviews ?? []).map((r: any) => ({
      id: r.id,
      name: r.user
        ? `${r.user.firstName ?? ""} ${r.user.lastName ?? ""}`.trim()
        : "Customer",
      avatar: r.user?.avatar ?? "",
      date: r.createdAt ?? "",
      rating: r.rating ?? 5,
      title: r.title ?? "",
      text: r.comment ?? "",
    })),
    ratingSummary: p.ratingBreakdown ?? [
      { star: 5, count: 0 },
      { star: 4, count: 0 },
      { star: 3, count: 0 },
      { star: 2, count: 0 },
      { star: 1, count: 0 },
    ],
  };
}
/* eslint-enable @typescript-eslint/no-explicit-any */


// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

interface ProductDetailContentProps {
  slug: string;
}

export function ProductDetailContent({ slug }: ProductDetailContentProps) {
  const [product, setProduct] = useState<ProductDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/products/${slug}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((json) => {
        if (json?.data) {
          setProduct(mapApiProduct(json.data));
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [slug]);

  const addItem = useCartStore((s) => s.addItem);
  const toggleCart = useCartStore((s) => s.toggleCart);
  const toggleItem = useWishlistStore((s) => s.toggleItem);
  const isInWishlist = useWishlistStore((s) =>
    product ? s.isInWishlist(product.id) : false,
  );

  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedColor, setSelectedColor] = useState("");
  const [selectedSize, setSelectedSize] = useState("");
  const [selectedMaterial, setSelectedMaterial] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [assemblyAddon, setAssemblyAddon] = useState(false);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="text-center py-24 text-muted-foreground">
        <p>Product not found.</p>
      </div>
    );
  }

  const handleAddToCart = () => {
    addItem({
      productId: product.id,
      name: product.name,
      slug: product.slug,
      image: product.images[0] ?? "",
      price: product.price + (assemblyAddon ? 99 : 0),
      variant: {
        color: selectedColor,
        size: selectedSize,
        material: selectedMaterial,
      },
      quantity,
    });
    toggleCart();
  };

  const handleToggleWishlist = () => {
    toggleItem({
      productId: product.id,
      name: product.name,
      slug: product.slug,
      image: product.images[0],
      price: product.price,
    });
  };

  const totalReviews = product.ratingSummary.reduce(
    (sum, r) => sum + r.count,
    0,
  );

  return (
    <div className="container mx-auto px-4 py-6 md:py-10">
      {/* ── Breadcrumb ───────────────────────────────────────────────── */}
      <BreadcrumbNav
        items={[
          {
            label: product.category,
            href: `/categories/${product.categorySlug}`,
          },
          { label: product.name },
        ]}
      />

      {/* ── Main section: gallery + details ──────────────────────────── */}
      <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-2 lg:gap-12">
        {/* ── Left column: Image Gallery ─────────────────────────────── */}
        <div className="flex flex-col gap-4">
          {/* Main image */}
          <AnimatePresence mode="wait">
            <motion.div
              key={selectedImage}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="relative aspect-square overflow-hidden rounded-xl border bg-muted"
            >
              <Image
                src={product.images[selectedImage]}
                alt={`${product.name} - Image ${selectedImage + 1}`}
                fill
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-cover"
                priority
                unoptimized
              />
            </motion.div>
          </AnimatePresence>

          {/* Thumbnails */}
          <div className="flex gap-3">
            {product.images.map((img, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setSelectedImage(idx)}
                className={cn(
                  "relative aspect-square w-20 overflow-hidden rounded-lg border-2 transition-all",
                  idx === selectedImage
                    ? "border-primary ring-2 ring-primary/30"
                    : "border-border hover:border-primary/50",
                )}
              >
                <Image
                  src={img}
                  alt={`${product.name} thumbnail ${idx + 1}`}
                  fill
                  sizes="80px"
                  className="object-cover"
                />
              </button>
            ))}
          </div>
        </div>

        {/* ── Right column: Product details ──────────────────────────── */}
        <div className="flex flex-col gap-6">
          {/* Name & rating */}
          <div>
            <h1 className="text-2xl font-bold tracking-tight md:text-3xl lg:text-4xl">
              {product.name}
            </h1>
            <div className="mt-2 flex items-center gap-3">
              <RatingStars
                rating={product.rating}
                showValue
                reviewCount={product.reviewCount}
              />
            </div>
          </div>

          {/* Price */}
          <PriceDisplay
            price={product.price}
            compareAtPrice={product.compareAtPrice}
            size="lg"
          />

          <Separator />

          {/* ── Color swatches ────────────────────────────────────────── */}
          <div>
            <Label className="mb-3 text-sm font-semibold">
              Color: {selectedColor}
            </Label>
            <div className="mt-2 flex gap-2">
              {product.colors.map((color) => (
                <button
                  key={color.name}
                  type="button"
                  title={color.name}
                  onClick={() => setSelectedColor(color.name)}
                  className={cn(
                    "size-10 rounded-full border-2 transition-all hover:scale-110",
                    selectedColor === color.name
                      ? "border-primary ring-2 ring-primary/30"
                      : "border-border",
                  )}
                  style={{ backgroundColor: color.hex }}
                >
                  <span className="sr-only">{color.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* ── Size pills ────────────────────────────────────────────── */}
          {product.sizes.length > 1 && (
            <div>
              <Label className="mb-3 text-sm font-semibold">
                Size: {selectedSize}
              </Label>
              <div className="mt-2 flex flex-wrap gap-2">
                {product.sizes.map((size) => (
                  <button
                    key={size}
                    type="button"
                    onClick={() => setSelectedSize(size)}
                    className={cn(
                      "rounded-lg border px-4 py-2 text-sm font-medium transition-all",
                      selectedSize === size
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-border bg-background hover:border-primary/50",
                    )}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* ── Material dropdown ─────────────────────────────────────── */}
          <div>
            <Label className="mb-3 text-sm font-semibold">Material</Label>
            <Select
              value={selectedMaterial}
              onValueChange={setSelectedMaterial}
            >
              <SelectTrigger className="mt-2 w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {product.materials.map((mat) => (
                  <SelectItem key={mat} value={mat}>
                    {mat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* ── Quantity selector ─────────────────────────────────────── */}
          <div>
            <Label className="mb-3 text-sm font-semibold">Quantity</Label>
            <div className="mt-2 flex items-center gap-3">
              <Button
                variant="outline"
                size="icon"
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                disabled={quantity <= 1}
              >
                <Minus className="size-4" />
              </Button>
              <span className="w-12 text-center text-lg font-semibold">
                {quantity}
              </span>
              <Button
                variant="outline"
                size="icon"
                onClick={() => setQuantity((q) => Math.min(10, q + 1))}
                disabled={quantity >= 10}
              >
                <Plus className="size-4" />
              </Button>
            </div>
          </div>

          {/* ── Assembly add-on ───────────────────────────────────────── */}
          {product.assemblyRequired && (
            <Label className="flex cursor-pointer items-center gap-3 rounded-lg border p-4 transition-colors hover:bg-muted/50">
              <Checkbox
                checked={assemblyAddon}
                onCheckedChange={(checked) =>
                  setAssemblyAddon(checked === true)
                }
              />
              <div className="flex flex-col">
                <span className="text-sm font-medium">
                  Add professional assembly (+&#8377;99)
                </span>
                <span className="text-xs text-muted-foreground">
                  Our team will assemble your furniture on delivery
                  {product.assemblyTime &&
                    ` (estimated ${product.assemblyTime})`}
                </span>
              </div>
            </Label>
          )}

          {/* ── Action buttons ────────────────────────────────────────── */}
          <div className="flex gap-3">
            <Button size="lg" className="flex-1" onClick={handleAddToCart}>
              <ShoppingCart className="size-5" />
              Add to Cart
            </Button>
            <Button
              size="lg"
              variant="outline"
              onClick={handleToggleWishlist}
              className={cn(
                isInWishlist &&
                  "border-red-300 text-red-500 hover:text-red-600",
              )}
            >
              <Heart
                className={cn("size-5", isInWishlist && "fill-red-500")}
              />
              {isInWishlist ? "Saved" : "Wishlist"}
            </Button>
          </div>

          {/* ── Shipping estimate ─────────────────────────────────────── */}
          <div className="flex flex-col gap-2 rounded-lg border bg-muted/30 p-4">
            <div className="flex items-center gap-2 text-sm">
              <Truck className="size-4 text-primary" />
              <span>{product.estimatedDelivery}</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Package className="size-4 text-primary" />
              <span>
                {product.assemblyRequired
                  ? `Assembly required${product.assemblyTime ? ` (${product.assemblyTime})` : ""}`
                  : "No assembly required"}
              </span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <CheckCircle className="size-4 text-green-600" />
              <span className="text-green-700 dark:text-green-400">
                In Stock
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Tabs section ─────────────────────────────────────────────── */}
      <div className="mt-16">
        <Tabs defaultValue="description">
          <TabsList className="w-full justify-start">
            <TabsTrigger value="description">Description</TabsTrigger>
            <TabsTrigger value="specifications">Specifications</TabsTrigger>
            <TabsTrigger value="reviews">
              Reviews ({product.reviewCount})
            </TabsTrigger>
            <TabsTrigger value="care">Care Instructions</TabsTrigger>
          </TabsList>

          {/* ── Description tab ──────────────────────────────────────── */}
          <TabsContent value="description" className="mt-6">
            <div className="max-w-3xl">
              {product.description.split("\n\n").map((paragraph, idx) => (
                <p
                  key={idx}
                  className="mb-4 text-muted-foreground leading-relaxed last:mb-0"
                >
                  {paragraph}
                </p>
              ))}
            </div>
          </TabsContent>

          {/* ── Specifications tab ───────────────────────────────────── */}
          <TabsContent value="specifications" className="mt-6">
            <div className="max-w-2xl overflow-hidden rounded-lg border">
              <table className="w-full">
                <tbody>
                  {product.specifications.map((spec, idx) => (
                    <tr
                      key={spec.label}
                      className={cn(
                        "border-b last:border-b-0",
                        idx % 2 === 0 ? "bg-muted/30" : "bg-background",
                      )}
                    >
                      <td className="px-4 py-3 text-sm font-medium w-1/3">
                        {spec.label}
                      </td>
                      <td className="px-4 py-3 text-sm text-muted-foreground">
                        {spec.value}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </TabsContent>

          {/* ── Reviews tab ──────────────────────────────────────────── */}
          <TabsContent value="reviews" className="mt-6">
            <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
              {/* Rating summary */}
              <div className="rounded-lg border p-6">
                <div className="mb-4 text-center">
                  <span className="text-5xl font-bold">
                    {product.rating.toFixed(1)}
                  </span>
                  <div className="mt-2 flex justify-center">
                    <RatingStars rating={product.rating} size="lg" />
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Based on {totalReviews} reviews
                  </p>
                </div>
                <Separator className="my-4" />
                <div className="flex flex-col gap-2">
                  {product.ratingSummary
                    .sort((a, b) => b.star - a.star)
                    .map((entry) => {
                      const pct =
                        totalReviews > 0
                          ? (entry.count / totalReviews) * 100
                          : 0;
                      return (
                        <div
                          key={entry.star}
                          className="flex items-center gap-2"
                        >
                          <span className="w-8 text-right text-sm font-medium">
                            {entry.star}
                          </span>
                          <Star className="size-3.5 fill-yellow-400 text-yellow-400" />
                          <Progress value={pct} className="h-2 flex-1" />
                          <span className="w-8 text-right text-xs text-muted-foreground">
                            {entry.count}
                          </span>
                        </div>
                      );
                    })}
                </div>
              </div>

              {/* Review cards + write a review */}
              <div className="lg:col-span-2">
                <div className="flex flex-col gap-6">
                  {product.reviews.map((review) => (
                    <div key={review.id} className="rounded-lg border p-5">
                      <div className="flex items-start gap-3">
                        <Avatar>
                          <AvatarImage
                            src={review.avatar}
                            alt={review.name}
                          />
                          <AvatarFallback>
                            {review.name
                              .split(" ")
                              .map((n) => n[0])
                              .join("")}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-semibold">
                              {review.name}
                            </span>
                            <span className="text-xs text-muted-foreground">
                              {new Date(review.date).toLocaleDateString(
                                "en-US",
                                {
                                  year: "numeric",
                                  month: "long",
                                  day: "numeric",
                                },
                              )}
                            </span>
                          </div>
                          <RatingStars
                            rating={review.rating}
                            size="sm"
                            className="mt-1"
                          />
                          <h4 className="mt-2 text-sm font-semibold">
                            {review.title}
                          </h4>
                          <p className="mt-1 text-sm text-muted-foreground leading-relaxed">
                            {review.text}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}

                  {/* Write a review */}
                  <Separator className="my-2" />
                  <div className="rounded-lg border p-6">
                    <h3 className="mb-4 text-lg font-semibold">
                      Write a Review
                    </h3>
                    <form
                      className="flex flex-col gap-4"
                      onSubmit={(e) => e.preventDefault()}
                    >
                      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <div>
                          <Label htmlFor="review-name">Name</Label>
                          <Input
                            id="review-name"
                            placeholder="Your name"
                            className="mt-1"
                          />
                        </div>
                        <div>
                          <Label htmlFor="review-rating">Rating</Label>
                          <Select defaultValue="5">
                            <SelectTrigger className="mt-1 w-full">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {[5, 4, 3, 2, 1].map((val) => (
                                <SelectItem
                                  key={val}
                                  value={val.toString()}
                                >
                                  {val} Star{val !== 1 ? "s" : ""}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      <div>
                        <Label htmlFor="review-title">Review Title</Label>
                        <Input
                          id="review-title"
                          placeholder="Summary of your experience"
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <Label htmlFor="review-body">Your Review</Label>
                        <Textarea
                          id="review-body"
                          placeholder="Tell others about your experience with this product..."
                          rows={4}
                          className="mt-1"
                        />
                      </div>
                      <Button type="submit" className="self-start">
                        Submit Review
                      </Button>
                    </form>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>

          {/* ── Care Instructions tab ────────────────────────────────── */}
          <TabsContent value="care" className="mt-6">
            <div className="max-w-2xl">
              <p className="text-muted-foreground leading-relaxed">
                {product.careInstructions}
              </p>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Related products section removed — will show when related product IDs are populated */}
    </div>
  );
}

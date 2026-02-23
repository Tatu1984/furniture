"use client";

import { useState } from "react";
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
// Mock product data
// ---------------------------------------------------------------------------

const productsMap: Record<string, ProductDetail> = {
  "modern-sofa": {
    id: "p1",
    slug: "modern-sofa",
    name: "Modern Sectional Sofa",
    price: 2499,
    compareAtPrice: 2999,
    category: "Living Room",
    categorySlug: "living-room",
    description:
      "Elevate your living room with this modern sectional sofa that seamlessly combines comfort with contemporary design. Upholstered in premium performance fabric, this sofa features deep, plush cushions filled with high-density foam and a sturdy kiln-dried hardwood frame built to last. The clean lines and tapered legs give it a sophisticated silhouette that complements a variety of interior styles.\n\nThe modular design allows you to configure the sections to fit your space perfectly, whether it is a cozy apartment or a spacious family room. Removable cushion covers make cleaning a breeze, and the durable fabric is resistant to stains, pilling, and fading.",
    images: [
      "https://picsum.photos/seed/product-modern-sofa-1/800/800",
      "https://picsum.photos/seed/product-modern-sofa-2/800/800",
      "https://picsum.photos/seed/product-modern-sofa-3/800/800",
      "https://picsum.photos/seed/product-modern-sofa-4/800/800",
    ],
    rating: 4.8,
    reviewCount: 124,
    colors: [
      { name: "Charcoal", hex: "#36454F" },
      { name: "Cream", hex: "#FFFDD0" },
      { name: "Sage", hex: "#9DC183" },
      { name: "Navy", hex: "#000080" },
    ],
    sizes: ["Standard", "Large", "Extra Large"],
    materials: ["Performance Fabric", "Linen Blend", "Velvet"],
    specifications: [
      { label: "Material", value: "Performance Fabric with Hardwood Frame" },
      { label: "Dimensions", value: '110"W x 85"D x 34"H' },
      { label: "Weight", value: "185 lbs" },
      { label: "Seat Height", value: '18"' },
      { label: "Assembly", value: "Minimal — attach legs only" },
      { label: "Cushion Fill", value: "High-density foam" },
      { label: "Frame", value: "Kiln-dried hardwood" },
      { label: "Warranty", value: "5-year limited" },
      { label: "Made In", value: "USA" },
    ],
    careInstructions:
      "Vacuum regularly using an upholstery attachment. Blot spills immediately with a clean, damp cloth. For deeper cleaning, use a mild fabric cleaner and test on a hidden area first. Avoid placing in direct sunlight to prevent fading. Cushion covers are removable and can be dry cleaned. Rotate and flip cushions periodically to ensure even wear.",
    assemblyRequired: true,
    assemblyTime: "15-20 minutes",
    estimatedDelivery: "Free delivery in 5-7 business days",
    reviews: [
      { id: "r1", name: "Sarah M.", avatar: "https://picsum.photos/seed/avatar-sarah/128/128", date: "2025-11-15", rating: 5, title: "Absolutely stunning!", text: "This sofa completely transformed our living room. The fabric feels luxurious and the cushions are incredibly comfortable. We have had it for three months and it still looks brand new." },
      { id: "r2", name: "James K.", avatar: "https://picsum.photos/seed/avatar-james/128/128", date: "2025-10-22", rating: 5, title: "Best purchase this year", text: "The quality is outstanding for the price. Assembly was super easy, just screwing in the legs. Very comfortable for movie nights and the modular design is great." },
      { id: "r3", name: "Priya R.", avatar: "https://picsum.photos/seed/avatar-priya/128/128", date: "2025-09-30", rating: 4, title: "Great sofa, minor note", text: "Love the design and comfort. Only thing is the cream color shows a bit more dirt than expected, but the removable covers make cleaning easy. Would recommend the charcoal for pet owners." },
      { id: "r4", name: "David L.", avatar: "https://picsum.photos/seed/avatar-david/128/128", date: "2025-08-18", rating: 5, title: "Exceeded expectations", text: "We ordered the large size and it fits perfectly in our open-plan living area. The delivery team was professional and set everything up. Top quality furniture." },
    ],
    ratingSummary: [
      { star: 5, count: 89 },
      { star: 4, count: 25 },
      { star: 3, count: 7 },
      { star: 2, count: 2 },
      { star: 1, count: 1 },
    ],
  },
  "leather-armchair": {
    id: "p2",
    slug: "leather-armchair",
    name: "Leather Lounge Armchair",
    price: 899,
    category: "Living Room",
    categorySlug: "living-room",
    description:
      "A timeless leather armchair that brings warmth and sophistication to any room. Crafted with top-grain leather that develops a beautiful patina over time, this chair features a generous seat with pocket-sprung cushions for exceptional comfort.\n\nThe solid beech wood frame is hand-finished and the armrests are padded for additional comfort. Perfect as a reading chair, accent piece, or paired with its matching ottoman for the ultimate lounging experience.",
    images: [
      "https://picsum.photos/seed/product-leather-armchair-1/800/800",
      "https://picsum.photos/seed/product-leather-armchair-2/800/800",
      "https://picsum.photos/seed/product-leather-armchair-3/800/800",
      "https://picsum.photos/seed/product-leather-armchair-4/800/800",
    ],
    rating: 4.7,
    reviewCount: 89,
    colors: [
      { name: "Cognac", hex: "#9A463D" },
      { name: "Black", hex: "#1C1C1C" },
      { name: "Tan", hex: "#D2B48C" },
    ],
    sizes: ["Standard"],
    materials: ["Top-Grain Leather", "Full-Grain Leather"],
    specifications: [
      { label: "Material", value: "Top-Grain Leather, Beech Wood Frame" },
      { label: "Dimensions", value: '32"W x 34"D x 33"H' },
      { label: "Weight", value: "65 lbs" },
      { label: "Seat Height", value: '17"' },
      { label: "Assembly", value: "None required — ships fully assembled" },
      { label: "Cushion Fill", value: "Pocket-sprung with foam wrap" },
      { label: "Frame", value: "Solid beech wood" },
      { label: "Warranty", value: "10-year frame, 3-year leather" },
      { label: "Made In", value: "Italy" },
    ],
    careInstructions:
      "Dust regularly with a soft, dry cloth. Condition the leather every 6-12 months using a quality leather conditioner. Avoid placing near heat sources or in direct sunlight. Clean spills immediately by blotting gently. Do not use harsh chemicals, solvents, or abrasive cleaners.",
    assemblyRequired: false,
    estimatedDelivery: "Free delivery in 7-10 business days",
    reviews: [
      { id: "r5", name: "Tom H.", avatar: "https://picsum.photos/seed/avatar-tom/128/128", date: "2025-11-01", rating: 5, title: "Gorgeous chair", text: "The leather quality is exceptional. After a few months, the cognac color has developed a lovely patina. It is my favorite spot in the house." },
      { id: "r6", name: "Emily W.", avatar: "https://picsum.photos/seed/avatar-emily/128/128", date: "2025-10-12", rating: 4, title: "Beautiful but firm", text: "Stunning chair that looks amazing. It was a bit firm at first but has broken in nicely over the past month. The leather smell is wonderful." },
    ],
    ratingSummary: [
      { star: 5, count: 52 },
      { star: 4, count: 28 },
      { star: 3, count: 6 },
      { star: 2, count: 2 },
      { star: 1, count: 1 },
    ],
  },
  "dining-table-set": {
    id: "p15",
    slug: "dining-table-set",
    name: "Dining Table Set for 6",
    price: 2199,
    compareAtPrice: 2699,
    category: "Dining",
    categorySlug: "dining",
    description:
      "Gather your loved ones around this elegant dining table set, designed to seat six comfortably. The table features a solid oak top with a warm honey finish and sturdy tapered legs that evoke mid-century modern style.\n\nEach of the six accompanying chairs is upholstered in a durable linen blend fabric and features ergonomic curves that provide support through long dinners. The set is crafted with mortise-and-tenon joinery for lasting strength.",
    images: [
      "https://picsum.photos/seed/product-dining-table-set-1/800/800",
      "https://picsum.photos/seed/product-dining-table-set-2/800/800",
      "https://picsum.photos/seed/product-dining-table-set-3/800/800",
      "https://picsum.photos/seed/product-dining-table-set-4/800/800",
    ],
    rating: 4.8,
    reviewCount: 156,
    colors: [
      { name: "Natural Oak", hex: "#C4A882" },
      { name: "Walnut", hex: "#5C4033" },
      { name: "White", hex: "#F5F5F5" },
    ],
    sizes: ["4-Seater", "6-Seater", "8-Seater"],
    materials: ["Solid Oak", "Solid Walnut", "Oak Veneer"],
    specifications: [
      { label: "Material", value: "Solid Oak with Linen Blend Chairs" },
      { label: "Table Dimensions", value: '72"L x 36"W x 30"H' },
      { label: "Chair Dimensions", value: '18"W x 21"D x 34"H' },
      { label: "Weight", value: "210 lbs (complete set)" },
      { label: "Assembly", value: "Required — estimated 45-60 minutes" },
      { label: "Joinery", value: "Mortise-and-tenon" },
      { label: "Finish", value: "Matte lacquer" },
      { label: "Warranty", value: "5-year limited" },
      { label: "Made In", value: "USA" },
    ],
    careInstructions:
      "Wipe the table with a damp cloth and dry immediately. Use coasters and placemats to protect the surface. Avoid harsh chemicals. For the chairs, vacuum regularly and spot clean the fabric with mild detergent. Treat the wood with furniture oil once a year.",
    assemblyRequired: true,
    assemblyTime: "45-60 minutes",
    estimatedDelivery: "Free delivery in 7-10 business days",
    reviews: [
      { id: "r7", name: "Rachel T.", avatar: "https://picsum.photos/seed/avatar-rachel/128/128", date: "2025-11-20", rating: 5, title: "Perfect for our family", text: "This set is beautiful and sturdy. The natural oak finish is stunning and the chairs are very comfortable. Our family of five uses it daily and it still looks great." },
      { id: "r8", name: "Mark S.", avatar: "https://picsum.photos/seed/avatar-mark/128/128", date: "2025-10-05", rating: 5, title: "Worth every penny", text: "Assembly took some effort but the result is spectacular. The quality of the wood and construction is evident. We get compliments every time we have guests." },
      { id: "r9", name: "Lisa P.", avatar: "https://picsum.photos/seed/avatar-lisa/128/128", date: "2025-09-15", rating: 4, title: "Beautiful but assembly is tough", text: "The table itself is gorgeous. Chairs are comfortable and well-made. Fair warning: assembly takes patience. I recommend paying for the professional service." },
    ],
    ratingSummary: [
      { star: 5, count: 98 },
      { star: 4, count: 40 },
      { star: 3, count: 12 },
      { star: 2, count: 4 },
      { star: 1, count: 2 },
    ],
  },
};

/** Generate a fallback product for any slug not explicitly defined. */
function getProduct(slug: string): ProductDetail {
  if (productsMap[slug]) return productsMap[slug];

  const nameFromSlug = slug
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");

  return {
    id: `p-${slug}`,
    slug,
    name: nameFromSlug,
    price: 999,
    compareAtPrice: 1299,
    category: "Furniture",
    categorySlug: "living-room",
    description: `The ${nameFromSlug} is a beautifully crafted piece of furniture that combines timeless design with modern functionality. Made from premium materials, this piece is built to last and will be a stunning addition to any room.\n\nFeaturing clean lines and a versatile aesthetic, it pairs well with both contemporary and traditional decor styles. The thoughtful construction ensures durability while maintaining an elegant appearance.`,
    images: [
      `https://picsum.photos/seed/product-${slug}-1/800/800`,
      `https://picsum.photos/seed/product-${slug}-2/800/800`,
      `https://picsum.photos/seed/product-${slug}-3/800/800`,
      `https://picsum.photos/seed/product-${slug}-4/800/800`,
    ],
    rating: 4.5,
    reviewCount: 47,
    colors: [
      { name: "Natural", hex: "#C4A882" },
      { name: "Walnut", hex: "#5C4033" },
      { name: "Black", hex: "#1C1C1C" },
    ],
    sizes: ["Small", "Medium", "Large"],
    materials: ["Solid Wood", "Engineered Wood", "Wood & Metal"],
    specifications: [
      { label: "Material", value: "Solid Wood with Metal Accents" },
      { label: "Dimensions", value: '48"W x 24"D x 36"H' },
      { label: "Weight", value: "75 lbs" },
      { label: "Assembly", value: "Required — estimated 30 minutes" },
      { label: "Finish", value: "Matte lacquer" },
      { label: "Hardware", value: "Included" },
      { label: "Warranty", value: "3-year limited" },
      { label: "Made In", value: "Vietnam" },
    ],
    careInstructions:
      "Dust regularly with a soft, dry cloth. Use coasters under glasses and avoid placing hot items directly on the surface. For deeper cleaning, wipe with a slightly damp cloth and dry immediately. Apply furniture polish or wax every few months to maintain the finish.",
    assemblyRequired: true,
    assemblyTime: "25-35 minutes",
    estimatedDelivery: "Free delivery in 5-7 business days",
    reviews: [
      { id: "r-gen-1", name: "Alex P.", avatar: "https://picsum.photos/seed/avatar-alex/128/128", date: "2025-11-20", rating: 5, title: "Excellent quality", text: "Really impressed with the build quality and finish. Looks even better in person than in the photos. Assembly was straightforward." },
      { id: "r-gen-2", name: "Maria C.", avatar: "https://picsum.photos/seed/avatar-maria/128/128", date: "2025-10-05", rating: 4, title: "Love the design", text: "Beautiful piece that fits perfectly in our space. Took about 30 minutes to assemble with two people. Very sturdy once put together." },
      { id: "r-gen-3", name: "Chris B.", avatar: "https://picsum.photos/seed/avatar-chris/128/128", date: "2025-09-18", rating: 4, title: "Great value", text: "Solid construction and elegant look. Delivery was on time and everything was well-packaged. Would buy from this brand again." },
    ],
    ratingSummary: [
      { star: 5, count: 22 },
      { star: 4, count: 16 },
      { star: 3, count: 5 },
      { star: 2, count: 3 },
      { star: 1, count: 1 },
    ],
  };
}

// Related products
const relatedProducts = [
  { id: "rel-1", slug: "leather-armchair", name: "Leather Lounge Armchair", price: 899, image: "https://picsum.photos/seed/product-leather-armchair/600/450", category: "Living Room", rating: 4.7, reviewCount: 89 },
  { id: "rel-2", slug: "oak-coffee-table", name: "Oak Coffee Table", price: 649, compareAtPrice: 799, image: "https://picsum.photos/seed/product-oak-coffee-table/600/450", category: "Living Room", rating: 4.6, reviewCount: 56 },
  { id: "rel-3", slug: "walnut-bookshelf", name: "Walnut Standing Bookshelf", price: 1299, image: "https://picsum.photos/seed/product-walnut-bookshelf/600/450", category: "Living Room", rating: 4.5, reviewCount: 34 },
  { id: "rel-4", slug: "platform-bed", name: "Walnut Platform Bed Frame", price: 1599, compareAtPrice: 1899, image: "https://picsum.photos/seed/product-platform-bed/600/450", category: "Bedroom", rating: 4.9, reviewCount: 203 },
];

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

interface ProductDetailContentProps {
  slug: string;
}

export function ProductDetailContent({ slug }: ProductDetailContentProps) {
  const product = getProduct(slug);

  const addItem = useCartStore((s) => s.addItem);
  const toggleCart = useCartStore((s) => s.toggleCart);
  const toggleItem = useWishlistStore((s) => s.toggleItem);
  const isInWishlist = useWishlistStore((s) => s.isInWishlist(product.id));

  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedColor, setSelectedColor] = useState(
    product.colors[0]?.name ?? "",
  );
  const [selectedSize, setSelectedSize] = useState(product.sizes[0] ?? "");
  const [selectedMaterial, setSelectedMaterial] = useState(
    product.materials[0] ?? "",
  );
  const [quantity, setQuantity] = useState(1);
  const [assemblyAddon, setAssemblyAddon] = useState(false);

  const handleAddToCart = () => {
    addItem({
      productId: product.id,
      name: product.name,
      slug: product.slug,
      image: product.images[0],
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

      {/* ── You May Also Like ────────────────────────────────────────── */}
      <section className="mt-20">
        <SectionHeading
          title="You May Also Like"
          subtitle="Explore similar pieces that complement your style."
        />
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {relatedProducts
            .filter((p) => p.slug !== product.slug)
            .slice(0, 4)
            .map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
        </div>
      </section>
    </div>
  );
}

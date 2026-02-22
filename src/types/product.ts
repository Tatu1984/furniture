// ---------------------------------------------------------------------------
// Product types for the FSOW furniture e-commerce platform
// ---------------------------------------------------------------------------

import type { Dimensions, Image, Money, SEOData } from "./common";
import type { CategoryRef } from "./category";

/** Product visibility / lifecycle status */
export type ProductStatus = "active" | "draft" | "archived";

/** Stock availability status */
export type StockStatus = "in_stock" | "low_stock" | "out_of_stock" | "preorder";

/** A single product image with furniture-specific context */
export type ProductImage = Image & {
  position: number;
  isDefault: boolean;
  variantId?: string;
  roomScene?: string; // e.g. "living_room", "bedroom"
};

/** Key/value specification (e.g. "Frame Material" → "Solid Teak Wood") */
export type ProductSpecification = {
  id: string;
  group: string; // grouping label, e.g. "General", "Dimensions", "Material"
  name: string;
  value: string;
  sortOrder: number;
};

/** A product variant (e.g. different fabric, colour, or size) */
export type ProductVariant = {
  id: string;
  sku: string;
  name: string;
  price: number;
  compareAtPrice?: number;
  stock: number;
  stockStatus: StockStatus;

  /** Variant-specific attributes (colour, fabric, finish, etc.) */
  attributes: VariantAttribute[];

  images: ProductImage[];
  dimensions?: Dimensions;
  weight?: number;
  weightUnit?: "kg" | "lb";

  isDefault: boolean;
  isActive: boolean;

  createdAt: string;
  updatedAt: string;
};

export type VariantAttribute = {
  name: string; // e.g. "Color", "Fabric", "Finish"
  value: string; // e.g. "Walnut", "Linen", "Matte"
  colorHex?: string;
  swatch?: string; // URL to a swatch image
};

/** Customer review for a product */
export type ProductReview = {
  id: string;
  productId: string;
  customerId: string;
  customerName: string;
  rating: number; // 1–5
  title: string;
  body: string;
  images?: string[];
  isVerifiedPurchase: boolean;
  isApproved: boolean;
  helpfulCount: number;
  createdAt: string;
  updatedAt: string;
};

/** Aggregate rating summary */
export type RatingSummary = {
  average: number;
  count: number;
  distribution: {
    1: number;
    2: number;
    3: number;
    4: number;
    5: number;
  };
};

/** Full product entity */
export type Product = {
  id: string;
  slug: string;
  sku: string;
  name: string;
  description: string;
  shortDescription?: string;

  // Pricing
  price: number;
  compareAtPrice?: number;
  currency: string; // ISO 4217
  priceRange?: { min: number; max: number }; // derived from variants

  // Categorisation
  category: CategoryRef;
  subcategory?: CategoryRef;
  tags: string[];
  collections?: string[]; // e.g. "Summer Sale", "Best Sellers"

  // Media
  images: ProductImage[];

  // Variants & specs
  variants: ProductVariant[];
  specifications: ProductSpecification[];

  // Reviews
  reviews: ProductReview[];
  rating: number;
  reviewCount: number;
  ratingSummary?: RatingSummary;

  // Inventory
  stock: number;
  stockStatus: StockStatus;
  lowStockThreshold?: number;

  // Status / visibility
  status: ProductStatus;
  isActive: boolean;
  isFeatured: boolean;
  isNewArrival: boolean;
  isBestseller: boolean;

  // Furniture-specific attributes
  materials: string[];
  dimensions: Dimensions;
  weight: number;
  weightUnit: "kg" | "lb";
  assemblyRequired: boolean;
  assemblyTime?: string; // e.g. "30–45 minutes"
  careInstructions?: string;
  warranty?: string;
  madeIn?: string;

  // Delivery
  estimatedDeliveryDays?: number;
  shippingCost?: Money;
  isFreeShipping: boolean;

  // Related / cross-sell
  relatedProductIds?: string[];
  crossSellProductIds?: string[];

  // SEO
  seo?: SEOData;

  // Timestamps
  createdAt: string;
  updatedAt: string;
  publishedAt?: string;
};

/** Minimal product card representation for listings / grids */
export type ProductCard = {
  id: string;
  slug: string;
  name: string;
  price: number;
  compareAtPrice?: number;
  currency: string;
  image: ProductImage;
  rating: number;
  reviewCount: number;
  stockStatus: StockStatus;
  status: ProductStatus;
  isFeatured: boolean;
  isNewArrival: boolean;
  isBestseller: boolean;
  isFreeShipping: boolean;
  category: CategoryRef;
  materials: string[];
};

/** Product search / listing query parameters */
export type ProductListParams = {
  page?: number;
  perPage?: number;
  sort?: string;
  direction?: "asc" | "desc";
  search?: string;
  categorySlug?: string;
  subcategorySlug?: string;
  status?: ProductStatus;
  stockStatus?: StockStatus;
  minPrice?: number;
  maxPrice?: number;
  materials?: string[];
  tags?: string[];
  isFeatured?: boolean;
  isNewArrival?: boolean;
  isFreeShipping?: boolean;
  assemblyRequired?: boolean;
};

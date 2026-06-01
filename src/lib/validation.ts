// ---------------------------------------------------------------------------
// Zod Validation Schemas
// Comprehensive validation for all FSOW API endpoints.
// Uses Zod v4 (imported as the default `zod` package).
// ---------------------------------------------------------------------------

import { z } from "zod";

// ---------------------------------------------------------------------------
// Primitive field schemas
// ---------------------------------------------------------------------------

export const emailSchema = z.email("Invalid email address");

export const phoneSchema = z
  .string()
  .regex(/^[6-9]\d{9}$/, "Invalid Indian phone number (10 digits starting with 6-9)");

export const passwordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters")
  .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
  .regex(/[a-z]/, "Password must contain at least one lowercase letter")
  .regex(/[0-9]/, "Password must contain at least one number");

export const postalCodeSchema = z
  .string()
  .regex(/^\d{6}$/, "Invalid Indian postal code (6 digits)");

// ---------------------------------------------------------------------------
// Auth schemas
// ---------------------------------------------------------------------------

export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, "Password is required"),
});

export const registerSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
  firstName: z.string().min(1, "First name is required").max(100),
  lastName: z.string().min(1, "Last name is required").max(100),
  phone: phoneSchema.optional(),
});

// ---------------------------------------------------------------------------
// Address schema
// ---------------------------------------------------------------------------

export const addressSchema = z.object({
  firstName: z.string().min(1, "First name is required").max(100),
  lastName: z.string().min(1, "Last name is required").max(100),
  company: z.string().max(200).optional(),
  phone: phoneSchema.optional(),
  line1: z.string().min(1, "Address line 1 is required").max(500),
  line2: z.string().max(500).optional(),
  city: z.string().min(1, "City is required").max(100),
  state: z.string().min(1, "State is required").max(100),
  postalCode: postalCodeSchema,
  country: z.string().default("IN"),
  label: z.string().max(50).optional(),
  isDefault: z.boolean().default(false),
  type: z.enum(["SHIPPING", "BILLING", "BOTH"]).default("SHIPPING"),
  gstin: z
    .string()
    .regex(
      /^\d{2}[A-Z]{5}\d{4}[A-Z]{1}\d{1}[A-Z]{1}\d{1}$/,
      "Invalid GSTIN format",
    )
    .optional(),
});

// ---------------------------------------------------------------------------
// Cart
// ---------------------------------------------------------------------------

export const cartItemSchema = z.object({
  productId: z.string().min(1, "Product ID is required"),
  variantId: z.string().optional(),
  quantity: z.number().int().min(1, "Quantity must be at least 1").max(99),
});

// ---------------------------------------------------------------------------
// Product schemas
// ---------------------------------------------------------------------------

const productImageSchema = z.object({
  url: z.string().url("Invalid image URL"),
  alt: z.string().default(""),
  sortOrder: z.number().int().min(0).default(0),
  isDefault: z.boolean().default(false),
  roomScene: z.string().optional(),
  variantId: z.string().optional(),
});

const productVariantSchema = z.object({
  sku: z.string().min(1, "Variant SKU is required").max(100),
  name: z.string().min(1, "Variant name is required").max(255),
  price: z.number().positive("Variant price must be positive"),
  compareAtPrice: z.number().positive().optional(),
  costPrice: z.number().min(0).optional(),
  manageStock: z.boolean().default(true),
  stockQuantity: z.number().int().min(0).default(0),
  lowStockThreshold: z.number().int().min(0).default(5),
  stockStatus: z
    .enum(["IN_STOCK", "LOW_STOCK", "OUT_OF_STOCK", "PREORDER", "ON_BACKORDER"])
    .default("IN_STOCK"),
  backorderMode: z.enum(["NO", "NOTIFY", "YES"]).default("NO"),
  weight: z.number().min(0).optional(),
  width: z.number().min(0).optional(),
  height: z.number().min(0).optional(),
  depth: z.number().min(0).optional(),
  image: z.string().url().optional(),
  sortOrder: z.number().int().min(0).default(0),
  isActive: z.boolean().default(true),
  isDefault: z.boolean().default(false),
  attributeValues: z
    .array(
      z.object({
        attributeTermId: z.string().min(1),
      }),
    )
    .optional(),
});

const productSpecificationSchema = z.object({
  groupName: z.string().min(1, "Group name is required").max(100),
  name: z.string().min(1, "Specification name is required").max(100),
  value: z.string().min(1, "Specification value is required").max(500),
  sortOrder: z.number().int().min(0).default(0),
});

export const createProductSchema = z.object({
  name: z.string().min(1, "Product name is required").max(500),
  slug: z
    .string()
    .min(1)
    .max(500)
    .regex(
      /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
      "Slug must be lowercase alphanumeric with hyphens",
    ),
  sku: z.string().min(1, "SKU is required").max(100),
  description: z.string().optional(),
  shortDescription: z.string().max(1000).optional(),

  type: z
    .enum(["SIMPLE", "VARIABLE", "GROUPED", "VIRTUAL", "DOWNLOADABLE"])
    .default("SIMPLE"),
  status: z.enum(["DRAFT", "PUBLISHED", "ARCHIVED"]).default("DRAFT"),
  visibility: z.enum(["VISIBLE", "CATALOG", "SEARCH", "HIDDEN"]).default("VISIBLE"),

  // Pricing
  price: z.number().min(0, "Price must be non-negative"),
  compareAtPrice: z.number().positive().optional(),
  costPrice: z.number().min(0).optional(),
  currency: z.string().default("USD"),

  // Category
  categoryId: z.string().optional(),

  // Tags & collections
  tags: z.array(z.string()).default([]),
  collections: z.array(z.string()).default([]),

  // Inventory
  manageStock: z.boolean().default(true),
  stockQuantity: z.number().int().min(0).default(0),
  lowStockThreshold: z.number().int().min(0).default(5),
  stockStatus: z
    .enum(["IN_STOCK", "LOW_STOCK", "OUT_OF_STOCK", "PREORDER", "ON_BACKORDER"])
    .default("IN_STOCK"),
  backorderMode: z.enum(["NO", "NOTIFY", "YES"]).default("NO"),

  // Furniture-specific
  materials: z.array(z.string()).default([]),
  width: z.number().min(0).optional(),
  height: z.number().min(0).optional(),
  depth: z.number().min(0).optional(),
  dimensionUnit: z.string().default("cm"),
  weight: z.number().min(0).optional(),
  weightUnit: z.string().default("kg"),
  assemblyRequired: z.boolean().default(false),
  assemblyTime: z.string().optional(),
  careInstructions: z.string().optional(),
  warranty: z.string().optional(),
  madeIn: z.string().optional(),

  // Shipping
  requiresShipping: z.boolean().default(true),
  shippingClassId: z.string().optional(),
  isFreeShipping: z.boolean().default(false),
  estimatedDeliveryDays: z.number().int().min(0).optional(),

  // Display
  isFeatured: z.boolean().default(false),
  isNewArrival: z.boolean().default(false),
  isBestseller: z.boolean().default(false),
  sortOrder: z.number().int().min(0).default(0),

  // SEO
  seoTitle: z.string().max(200).optional(),
  seoDescription: z.string().max(500).optional(),
  seoKeywords: z.array(z.string()).default([]),

  // Cross-sell / upsell
  relatedProductIds: z.array(z.string()).default([]),
  crossSellProductIds: z.array(z.string()).default([]),

  // Nested
  images: z.array(productImageSchema).default([]),
  variants: z.array(productVariantSchema).default([]),
  specifications: z.array(productSpecificationSchema).default([]),

  publishedAt: z.string().datetime().optional(),
});

export const updateProductSchema = createProductSchema.partial();

// ---------------------------------------------------------------------------
// Order
// ---------------------------------------------------------------------------

const orderItemInput = z.object({
  productId: z.string().min(1),
  variantId: z.string().optional(),
  quantity: z.number().int().min(1),
});

export const createOrderSchema = z.object({
  items: z.array(orderItemInput).min(1, "At least one item is required"),
  shippingAddressId: z.string().min(1, "Shipping address is required"),
  billingAddressId: z.string().optional(),
  paymentMethod: z.enum([
    "CREDIT_CARD",
    "DEBIT_CARD",
    "UPI",
    "NET_BANKING",
    "WALLET",
    "COD",
    "EMI",
    "BANK_TRANSFER",
  ]),
  couponCode: z.string().optional(),
  customerNote: z.string().max(1000).optional(),
  shippingMethod: z.string().optional(),
});

// ---------------------------------------------------------------------------
// Search / Product listing query
// ---------------------------------------------------------------------------

export const searchQuerySchema = z.object({
  q: z.string().max(500).optional(),
  page: z.coerce.number().int().min(1).default(1),
  perPage: z.coerce.number().int().min(1).max(100).default(20),
  sort: z
    .enum([
      "price_asc",
      "price_desc",
      "name_asc",
      "name_desc",
      "newest",
      "oldest",
      "rating",
      "bestselling",
      "relevance",
    ])
    .default("relevance"),
  categorySlug: z.string().optional(),
  minPrice: z.coerce.number().min(0).optional(),
  maxPrice: z.coerce.number().min(0).optional(),
  materials: z
    .string()
    .transform((v) => v.split(",").filter(Boolean))
    .optional(),
  tags: z
    .string()
    .transform((v) => v.split(",").filter(Boolean))
    .optional(),
  stockStatus: z
    .enum(["IN_STOCK", "LOW_STOCK", "OUT_OF_STOCK", "PREORDER", "ON_BACKORDER"])
    .optional(),
  isFeatured: z.coerce.boolean().optional(),
  isNewArrival: z.coerce.boolean().optional(),
  isFreeShipping: z.coerce.boolean().optional(),
  assemblyRequired: z.coerce.boolean().optional(),
});

// ---------------------------------------------------------------------------
// Review
// ---------------------------------------------------------------------------

export const reviewSchema = z.object({
  productId: z.string().min(1, "Product ID is required"),
  rating: z.number().int().min(1, "Rating must be 1-5").max(5, "Rating must be 1-5"),
  title: z.string().min(1, "Title is required").max(200),
  content: z.string().min(1, "Content is required").max(5000),
  images: z.array(z.string().url()).max(5, "Maximum 5 images").default([]),
});

// ---------------------------------------------------------------------------
// Coupon
// ---------------------------------------------------------------------------

export const couponSchema = z.object({
  code: z
    .string()
    .min(3, "Coupon code must be at least 3 characters")
    .max(50)
    .transform((v) => v.toUpperCase()),
  name: z.string().min(1, "Name is required").max(200),
  description: z.string().max(1000).optional(),

  type: z.enum(["PERCENTAGE", "FIXED_CART", "FIXED_PRODUCT", "FREE_SHIPPING"]),
  value: z.number().min(0, "Discount value must be non-negative"),
  maxDiscount: z.number().positive().optional(),

  scope: z
    .enum(["ALL", "SPECIFIC_PRODUCTS", "SPECIFIC_CATEGORIES", "MINIMUM_ORDER"])
    .default("ALL"),

  usageLimit: z.number().int().positive().optional(),
  usageLimitPerUser: z.number().int().positive().optional(),
  limitUsageToXItems: z.number().int().positive().optional(),

  minOrderValue: z.number().min(0).optional(),
  maxOrderValue: z.number().min(0).optional(),
  minimumItemCount: z.number().int().positive().optional(),

  isStackable: z.boolean().default(false),
  firstOrderOnly: z.boolean().default(false),
  excludeSaleItems: z.boolean().default(false),
  allowedEmails: z.array(z.string()).optional(),
  eligibleCustomerTags: z.array(z.string()).default([]),

  isActive: z.boolean().default(true),
  startsAt: z.string().datetime(),
  expiresAt: z.string().datetime().optional(),
  internalNotes: z.string().max(2000).optional(),

  productIds: z.array(z.string()).default([]),
  excludedProductIds: z.array(z.string()).default([]),
  categoryIds: z.array(z.string()).default([]),
  excludedCategoryIds: z.array(z.string()).default([]),
});

// ---------------------------------------------------------------------------
// CMS: Pages, Banners, Menus
// ---------------------------------------------------------------------------

export const createPageSchema = z.object({
  title: z.string().min(1, "Title is required").max(500),
  slug: z
    .string()
    .min(1)
    .max(500)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Slug must be lowercase alphanumeric with hyphens"),
  content: z.string().optional(),
  excerpt: z.string().max(1000).optional(),
  template: z.enum(["DEFAULT", "FULL_WIDTH", "SIDEBAR", "LANDING"]).default("DEFAULT"),
  status: z.enum(["DRAFT", "PUBLISHED"]).default("DRAFT"),
  sortOrder: z.number().int().min(0).default(0),
  seoTitle: z.string().max(200).optional(),
  seoDescription: z.string().max(500).optional(),
  ogImage: z.string().url().optional(),
  publishedAt: z.string().datetime().optional(),
});

export const createBannerSchema = z.object({
  title: z.string().min(1, "Title is required").max(200),
  subtitle: z.string().max(500).optional(),
  image: z.string().url("Banner image URL is required"),
  imageMobile: z.string().url().optional(),
  link: z.string().url().optional(),
  buttonText: z.string().max(100).optional(),
  position: z
    .enum(["HOME_HERO", "HOME_SECONDARY", "CATEGORY_TOP", "SIDEBAR", "PROMOTIONAL_STRIP"])
    .default("HOME_HERO"),
  sortOrder: z.number().int().min(0).default(0),
  isActive: z.boolean().default(true),
  startsAt: z.string().datetime().optional(),
  endsAt: z.string().datetime().optional(),
});

export const menuItemSchema = z.object({
  title: z.string().min(1, "Menu item title is required").max(200),
  url: z.string().max(2000).optional(),
  type: z.enum(["CUSTOM", "PAGE", "CATEGORY", "PRODUCT", "BLOG"]).default("CUSTOM"),
  targetId: z.string().optional(),
  target: z.enum(["_self", "_blank"]).default("_self"),
  sortOrder: z.number().int().min(0).default(0),
  isActive: z.boolean().default(true),
  parentId: z.string().optional(),
});

export const createMenuSchema = z.object({
  name: z.string().min(1, "Menu name is required").max(200),
  slug: z
    .string()
    .min(1)
    .max(200)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Slug must be lowercase alphanumeric with hyphens"),
  location: z.enum(["HEADER", "FOOTER", "MOBILE", "SIDEBAR"]).default("HEADER"),
  items: z.array(menuItemSchema).default([]),
});

// ---------------------------------------------------------------------------
// Partial update schemas for CMS entities
// ---------------------------------------------------------------------------

export const updatePageSchema = createPageSchema.partial();
export const updateBannerSchema = createBannerSchema.partial();

// Alias for consistent naming (createCouponSchema / updateCouponSchema)
export const createCouponSchema = couponSchema;
export const updateCouponSchema = couponSchema.partial();

// ---------------------------------------------------------------------------
// Blog
// ---------------------------------------------------------------------------

export const createBlogPostSchema = z.object({
  title: z.string().min(1, "Title is required").max(500),
  slug: z
    .string()
    .min(1)
    .max(500)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Slug must be lowercase alphanumeric with hyphens"),
  excerpt: z.string().max(2000).optional(),
  body: z.string().optional(),
  coverImage: z.string().url().optional(),
  authorId: z.string().min(1, "Author is required"),
  categoryId: z.string().min(1, "Category is required"),
  tags: z.array(z.string()).default([]),
  status: z.enum(["DRAFT", "PUBLISHED", "ARCHIVED"]).default("DRAFT"),
  relatedProductIds: z.array(z.string()).default([]),
  readTime: z.number().int().min(1).default(5),
  isFeatured: z.boolean().default(false),
  commentsEnabled: z.boolean().default(true),
  seoTitle: z.string().max(200).optional(),
  seoDescription: z.string().max(500).optional(),
  ogImage: z.string().url().optional(),
  publishedAt: z.string().datetime().optional(),
});

export const updateBlogPostSchema = createBlogPostSchema.partial();

// ---------------------------------------------------------------------------
// Settings
// ---------------------------------------------------------------------------

export const settingSchema = z.object({
  key: z
    .string()
    .min(1, "Key is required")
    .max(200)
    .regex(/^[a-z0-9_.]+$/, "Key must be lowercase alphanumeric with dots or underscores"),
  value: z.unknown(),
  group: z.string().max(100).default("general"),
  autoload: z.boolean().default(false),
});

// ---------------------------------------------------------------------------
// Order inquiries (custom-quote workflow)
// ---------------------------------------------------------------------------

export const createInquirySchema = z.object({
  productId: z.string().min(1, "Product is required"),
  quantity: z.number().int().min(1, "Quantity must be at least 1").max(9999),
  selectedColor: z.string().max(100).optional(),
  selectedSize: z.string().max(100).optional(),
  selectedMaterial: z.string().max(100).optional(),
  variantId: z.string().optional(),
  preferences: z.record(z.string(), z.unknown()).optional(),

  customerName: z.string().min(1, "Name is required").max(200),
  customerEmail: emailSchema,
  customerPhone: z.string().min(1).max(50).optional(),

  shippingAddress: z.string().max(500).optional(),
  shippingCity: z.string().max(100).optional(),
  shippingState: z.string().max(100).optional(),
  shippingPostal: z.string().max(20).optional(),
  shippingCountry: z.string().max(100).optional(),

  notes: z.string().max(2000).optional(),
  preferredDeliveryTimeline: z.string().max(200).optional(),
  preferredContact: z.enum(["EMAIL", "PHONE", "WHATSAPP"]).optional(),
});

export const updateInquirySchema = z.object({
  status: z
    .enum(["NEW", "CONTACTED", "QUOTED", "CONFIRMED", "CLOSED", "CANCELLED"])
    .optional(),
  internalNotes: z.string().max(5000).optional(),
  assignedTo: z.string().max(200).optional(),
  lastContactedAt: z.string().optional(),
});

// ---------------------------------------------------------------------------
// Helper functions
// ---------------------------------------------------------------------------

export type ValidationResult<T> =
  | { success: true; data: T }
  | { success: false; errors: Record<string, string[]> };

/**
 * Validates a request body against a Zod schema.
 * Returns either the parsed data or a structured error map.
 */
export function validateBody<T>(
  schema: z.ZodType<T>,
  data: unknown,
): ValidationResult<T> {
  const result = schema.safeParse(data);

  if (result.success) {
    return { success: true, data: result.data };
  }

  const errors: Record<string, string[]> = {};
  for (const issue of result.error.issues) {
    const path = issue.path.length > 0 ? issue.path.join(".") : "_root";
    if (!errors[path]) {
      errors[path] = [];
    }
    errors[path].push(issue.message);
  }

  return { success: false, errors };
}

/**
 * Validates URL query / search params against a Zod schema.
 * Converts the params into a plain object before validation.
 */
export function validateQuery<T>(
  schema: z.ZodType<T>,
  params: URLSearchParams | Record<string, string | string[] | undefined>,
): ValidationResult<T> {
  let plain: Record<string, string | string[]>;

  if (params instanceof URLSearchParams) {
    plain = {};
    for (const [key, value] of params.entries()) {
      const existing = plain[key];
      if (existing !== undefined) {
        if (Array.isArray(existing)) {
          existing.push(value);
        } else {
          plain[key] = [existing, value];
        }
      } else {
        plain[key] = value;
      }
    }
  } else {
    plain = params as Record<string, string | string[]>;
  }

  return validateBody(schema, plain);
}

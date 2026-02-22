// ---------------------------------------------------------------------------
// Coupon / discount types for the FSOW furniture e-commerce platform
// ---------------------------------------------------------------------------

/** Discount calculation method */
export type DiscountType = "percentage" | "fixed";

/** Coupon lifecycle status */
export type CouponStatus = "active" | "expired" | "disabled" | "scheduled";

/** Scope of the coupon — what it applies to */
export type CouponScope = "all" | "specific_products" | "specific_categories" | "minimum_order";

/** Coupon entity */
export type Coupon = {
  id: string;
  code: string; // unique, case-insensitive
  name: string;
  description?: string;

  // Discount
  discountType: DiscountType;
  discountValue: number; // percentage (0–100) or fixed amount
  currency?: string; // required when discountType is "fixed"
  maxDiscountAmount?: number; // cap for percentage discounts

  // Scope / applicability
  scope: CouponScope;

  /** Product IDs this coupon applies to (when scope = "specific_products") */
  applicableProductIds?: string[];

  /** Category IDs this coupon applies to (when scope = "specific_categories") */
  applicableCategoryIds?: string[];

  /** Minimum order subtotal required to use this coupon */
  minimumOrderAmount?: number;

  /** Minimum number of items in the cart required */
  minimumItemCount?: number;

  // Usage limits
  /** Total number of times this coupon can be used across all customers */
  usageLimitTotal?: number;

  /** Maximum times a single customer can use this coupon */
  usageLimitPerCustomer?: number;

  /** How many times the coupon has been used so far */
  usageCount: number;

  // Validity window
  startsAt: string;
  expiresAt?: string;

  // Status
  status: CouponStatus;
  isActive: boolean;

  // Restrictions
  /** Allow coupon to be combined with other coupons */
  isStackable: boolean;

  /** Only available to first-time customers */
  firstOrderOnly: boolean;

  /** Restrict to specific customer IDs (empty = available to everyone) */
  eligibleCustomerIds?: string[];

  /** Restrict to specific customer tags (e.g. "VIP") */
  eligibleCustomerTags?: string[];

  /** Exclude sale / already-discounted items */
  excludeSaleItems: boolean;

  /** Exclude specific product IDs even when scope is broader */
  excludedProductIds?: string[];

  /** Exclude specific category IDs even when scope is broader */
  excludedCategoryIds?: string[];

  // Free shipping promotion
  /** Whether this coupon grants free shipping */
  freeShipping: boolean;

  // Metadata
  /** Internal notes visible only to staff */
  internalNotes?: string;

  createdBy?: string; // staff user ID
  createdAt: string;
  updatedAt: string;
};

/** Result of validating a coupon at checkout */
export type CouponValidation = {
  isValid: boolean;
  coupon?: Coupon;
  discountAmount?: number;
  errorCode?: CouponErrorCode;
  errorMessage?: string;
};

/** Possible coupon validation error codes */
export type CouponErrorCode =
  | "not_found"
  | "expired"
  | "disabled"
  | "not_yet_active"
  | "usage_limit_reached"
  | "per_customer_limit_reached"
  | "minimum_order_not_met"
  | "minimum_items_not_met"
  | "not_applicable_to_products"
  | "not_applicable_to_category"
  | "first_order_only"
  | "customer_not_eligible"
  | "sale_items_excluded"
  | "not_stackable";

/** Coupon list query parameters (admin) */
export type CouponListParams = {
  page?: number;
  perPage?: number;
  search?: string;
  status?: CouponStatus;
  discountType?: DiscountType;
  scope?: CouponScope;
  sort?: string;
  direction?: "asc" | "desc";
  isActive?: boolean;
};

// ---------------------------------------------------------------------------
// Coupon Business Logic
// Validates, applies, and reverts coupon usage with full business rule
// enforcement including product/category filtering, usage limits, date
// ranges, email restrictions, sale item exclusion, and first-order checks.
// ---------------------------------------------------------------------------

import prisma from "@/lib/db";
import type { CouponType } from "@prisma/client";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type CartItemForCoupon = {
  productId: string;
  variantId?: string | null;
  quantity: number;
  price: number;
  categoryId?: string | null;
  compareAtPrice?: number | null;
};

export type CouponValidationResult = {
  valid: boolean;
  error?: string;
  discount: number;
  coupon?: Awaited<ReturnType<typeof fetchCouponWithRelations>>;
};

// ---------------------------------------------------------------------------
// Internal: Fetch coupon with relations
// ---------------------------------------------------------------------------

async function fetchCouponWithRelations(code: string) {
  return prisma.coupon.findUnique({
    where: { code: code.toUpperCase() },
    include: {
      products: true,
      categories: true,
    },
  });
}

// ---------------------------------------------------------------------------
// validateCoupon
// ---------------------------------------------------------------------------

/**
 * Validates a coupon code against the current cart, user, and business rules.
 * Returns whether the coupon is valid, any error message, and the calculated
 * discount amount.
 */
export async function validateCoupon(
  code: string,
  cartItems: CartItemForCoupon[],
  cartTotal: number,
  userId?: string,
  email?: string,
): Promise<CouponValidationResult> {
  const coupon = await fetchCouponWithRelations(code);

  if (!coupon) {
    return { valid: false, error: "Coupon not found", discount: 0 };
  }

  // Active check
  if (!coupon.isActive || coupon.status !== "ACTIVE") {
    return { valid: false, error: "This coupon is not active", discount: 0, coupon };
  }

  // Date range: must have started
  const now = new Date();
  if (coupon.startsAt > now) {
    return { valid: false, error: "This coupon is not yet active", discount: 0, coupon };
  }

  // Date range: must not have expired
  if (coupon.expiresAt && coupon.expiresAt < now) {
    return { valid: false, error: "This coupon has expired", discount: 0, coupon };
  }

  // Global usage limit
  if (coupon.usageLimit !== null && coupon.usageCount >= coupon.usageLimit) {
    return {
      valid: false,
      error: "This coupon has reached its usage limit",
      discount: 0,
      coupon,
    };
  }

  // Per-user usage limit
  if (userId && coupon.usageLimitPerUser !== null) {
    const userUsageCount = await prisma.couponUsage.count({
      where: { couponId: coupon.id, userId },
    });
    if (userUsageCount >= coupon.usageLimitPerUser) {
      return {
        valid: false,
        error: "You have already used this coupon the maximum number of times",
        discount: 0,
        coupon,
      };
    }
  }

  // Email restriction patterns (allowedEmails is stored as JSON array of patterns)
  if (coupon.allowedEmails && email) {
    const allowedPatterns = coupon.allowedEmails as string[];
    if (allowedPatterns.length > 0) {
      const emailLower = email.toLowerCase();
      const isAllowed = allowedPatterns.some((pattern) => {
        const patternLower = pattern.toLowerCase();
        if (patternLower.startsWith("*@")) {
          // Wildcard domain match: *@example.com
          return emailLower.endsWith(patternLower.slice(1));
        }
        return emailLower === patternLower;
      });
      if (!isAllowed) {
        return {
          valid: false,
          error: "This coupon is not available for your email address",
          discount: 0,
          coupon,
        };
      }
    }
  }

  // Minimum order value
  if (coupon.minOrderValue !== null && cartTotal < Number(coupon.minOrderValue)) {
    return {
      valid: false,
      error: `Minimum order value of ${Number(coupon.minOrderValue)} required`,
      discount: 0,
      coupon,
    };
  }

  // Maximum order value
  if (coupon.maxOrderValue !== null && cartTotal > Number(coupon.maxOrderValue)) {
    return {
      valid: false,
      error: `This coupon is only valid for orders up to ${Number(coupon.maxOrderValue)}`,
      discount: 0,
      coupon,
    };
  }

  // Minimum item count
  if (coupon.minimumItemCount !== null) {
    const totalItemCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);
    if (totalItemCount < coupon.minimumItemCount) {
      return {
        valid: false,
        error: `At least ${coupon.minimumItemCount} items required in cart`,
        discount: 0,
        coupon,
      };
    }
  }

  // First order only
  if (coupon.firstOrderOnly && userId) {
    const orderCount = await prisma.order.count({
      where: { userId },
    });
    if (orderCount > 0) {
      return {
        valid: false,
        error: "This coupon is only valid for first orders",
        discount: 0,
        coupon,
      };
    }
  }

  // Build product include/exclude sets and category include/exclude sets
  const includedProductIds = new Set<string>();
  const excludedProductIds = new Set<string>();
  for (const cp of coupon.products) {
    if (cp.type === "INCLUDE") {
      includedProductIds.add(cp.productId);
    } else {
      excludedProductIds.add(cp.productId);
    }
  }

  const includedCategoryIds = new Set<string>();
  const excludedCategoryIds = new Set<string>();
  for (const cc of coupon.categories) {
    if (cc.type === "INCLUDE") {
      includedCategoryIds.add(cc.categoryId);
    } else {
      excludedCategoryIds.add(cc.categoryId);
    }
  }

  // Filter eligible items
  let eligibleItems = [...cartItems];

  // Product inclusion filter
  if (includedProductIds.size > 0) {
    eligibleItems = eligibleItems.filter((item) =>
      includedProductIds.has(item.productId),
    );
  }

  // Product exclusion filter
  if (excludedProductIds.size > 0) {
    eligibleItems = eligibleItems.filter(
      (item) => !excludedProductIds.has(item.productId),
    );
  }

  // Category inclusion filter
  if (includedCategoryIds.size > 0) {
    eligibleItems = eligibleItems.filter(
      (item) => item.categoryId && includedCategoryIds.has(item.categoryId),
    );
  }

  // Category exclusion filter
  if (excludedCategoryIds.size > 0) {
    eligibleItems = eligibleItems.filter(
      (item) => !item.categoryId || !excludedCategoryIds.has(item.categoryId),
    );
  }

  // Exclude sale items (items with a compareAtPrice set and lower current price)
  if (coupon.excludeSaleItems) {
    eligibleItems = eligibleItems.filter(
      (item) =>
        !item.compareAtPrice ||
        item.price >= item.compareAtPrice,
    );
  }

  if (eligibleItems.length === 0) {
    return {
      valid: false,
      error: "No eligible items in your cart for this coupon",
      discount: 0,
      coupon,
    };
  }

  // Calculate discount
  const discount = calculateDiscount(
    coupon.type,
    Number(coupon.value),
    eligibleItems,
    cartTotal,
    coupon.maxDiscount ? Number(coupon.maxDiscount) : null,
    coupon.limitUsageToXItems ?? null,
  );

  if (discount <= 0) {
    return {
      valid: false,
      error: "No discount applicable for the current cart",
      discount: 0,
      coupon,
    };
  }

  return { valid: true, discount, coupon };
}

// ---------------------------------------------------------------------------
// Discount calculation
// ---------------------------------------------------------------------------

function calculateDiscount(
  type: CouponType,
  value: number,
  eligibleItems: CartItemForCoupon[],
  cartTotal: number,
  maxDiscount: number | null,
  limitToXItems: number | null,
): number {
  let discount = 0;

  // Optionally limit to the first X items (sorted by most expensive)
  let items = [...eligibleItems];
  if (limitToXItems !== null && limitToXItems > 0) {
    items = items
      .sort((a, b) => b.price - a.price)
      .slice(0, limitToXItems);
  }

  switch (type) {
    case "PERCENTAGE": {
      const eligibleTotal = items.reduce(
        (sum, item) => sum + item.price * item.quantity,
        0,
      );
      discount = (eligibleTotal * value) / 100;
      break;
    }

    case "FIXED_CART": {
      discount = value;
      break;
    }

    case "FIXED_PRODUCT": {
      discount = items.reduce(
        (sum, item) => sum + value * item.quantity,
        0,
      );
      break;
    }

    case "FREE_SHIPPING": {
      // Free shipping coupons do not provide a direct monetary discount;
      // the shipping cost is handled at the order level.
      discount = 0;
      break;
    }
  }

  // Apply max discount cap
  if (maxDiscount !== null && discount > maxDiscount) {
    discount = maxDiscount;
  }

  // Discount cannot exceed the cart total
  if (discount > cartTotal) {
    discount = cartTotal;
  }

  return Math.round(discount * 100) / 100;
}

// ---------------------------------------------------------------------------
// applyCoupon
// ---------------------------------------------------------------------------

/**
 * Records coupon usage after a successful order placement.
 * Increments the global usage count and creates a per-user usage record.
 */
export async function applyCoupon(
  couponId: string,
  userId?: string,
  orderId?: string,
): Promise<void> {
  await prisma.$transaction(async (tx) => {
    // Increment global usage count
    await tx.coupon.update({
      where: { id: couponId },
      data: { usageCount: { increment: 1 } },
    });

    // Create per-user usage record
    if (userId) {
      await tx.couponUsage.create({
        data: {
          couponId,
          userId,
          orderId: orderId ?? null,
        },
      });
    }
  });
}

// ---------------------------------------------------------------------------
// revertCouponUsage
// ---------------------------------------------------------------------------

/**
 * Reverts coupon usage when an order is cancelled. Decrements the global
 * usage count and removes the per-user usage record for the given order.
 */
export async function revertCouponUsage(
  couponId: string,
  userId: string,
  orderId: string,
): Promise<void> {
  await prisma.$transaction(async (tx) => {
    // Decrement global usage count (floor at 0)
    const coupon = await tx.coupon.findUnique({
      where: { id: couponId },
      select: { usageCount: true },
    });

    if (coupon && coupon.usageCount > 0) {
      await tx.coupon.update({
        where: { id: couponId },
        data: { usageCount: { decrement: 1 } },
      });
    }

    // Remove the per-user usage record for this specific order
    const usageRecord = await tx.couponUsage.findFirst({
      where: { couponId, userId, orderId },
    });

    if (usageRecord) {
      await tx.couponUsage.delete({
        where: { id: usageRecord.id },
      });
    }
  });
}

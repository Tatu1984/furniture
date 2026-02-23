import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { getAuthUser } from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
    const authPayload = await getAuthUser(request);
    const sessionId = request.cookies.get("session-id")?.value ?? null;

    const body = await request.json();
    const { code } = body;

    if (!code || typeof code !== "string") {
      return NextResponse.json(
        { error: "Coupon code is required" },
        { status: 400 }
      );
    }

    const normalizedCode = code.trim().toUpperCase();

    // ── Find cart ───────────────────────────────────────────────────────
    let cart;
    if (authPayload) {
      cart = await prisma.cart.findUnique({
        where: { userId: authPayload.userId },
        include: {
          items: {
            include: {
              product: {
                select: {
                  id: true,
                  price: true,
                  categoryId: true,
                  compareAtPrice: true,
                },
              },
              variant: {
                select: { id: true, price: true },
              },
            },
          },
        },
      });
    } else if (sessionId) {
      cart = await prisma.cart.findUnique({
        where: { sessionId },
        include: {
          items: {
            include: {
              product: {
                select: {
                  id: true,
                  price: true,
                  categoryId: true,
                  compareAtPrice: true,
                },
              },
              variant: {
                select: { id: true, price: true },
              },
            },
          },
        },
      });
    }

    if (!cart || cart.items.length === 0) {
      return NextResponse.json(
        { error: "Cart is empty" },
        { status: 400 }
      );
    }

    // ── Find coupon ─────────────────────────────────────────────────────
    const coupon = await prisma.coupon.findUnique({
      where: { code: normalizedCode },
      include: {
        products: { select: { productId: true, type: true } },
        categories: { select: { categoryId: true, type: true } },
      },
    });

    if (!coupon) {
      return NextResponse.json(
        { error: "Invalid coupon code" },
        { status: 400 }
      );
    }

    // ── Validate coupon ─────────────────────────────────────────────────
    if (!coupon.isActive || coupon.status !== "ACTIVE") {
      return NextResponse.json(
        { error: "This coupon is no longer active" },
        { status: 400 }
      );
    }

    const now = new Date();
    if (coupon.startsAt > now) {
      return NextResponse.json(
        { error: "This coupon is not yet valid" },
        { status: 400 }
      );
    }

    if (coupon.expiresAt && coupon.expiresAt < now) {
      return NextResponse.json(
        { error: "This coupon has expired" },
        { status: 400 }
      );
    }

    // Usage limit
    if (coupon.usageLimit && coupon.usageCount >= coupon.usageLimit) {
      return NextResponse.json(
        { error: "This coupon has reached its usage limit" },
        { status: 400 }
      );
    }

    // Per-user usage limit (only for authenticated users)
    if (authPayload && coupon.usageLimitPerUser) {
      const userUsageCount = await prisma.couponUsage.count({
        where: {
          couponId: coupon.id,
          userId: authPayload.userId,
        },
      });
      if (userUsageCount >= coupon.usageLimitPerUser) {
        return NextResponse.json(
          { error: "You have already used this coupon the maximum number of times" },
          { status: 400 }
        );
      }
    }

    // First order only
    if (coupon.firstOrderOnly && authPayload) {
      const orderCount = await prisma.order.count({
        where: { userId: authPayload.userId },
      });
      if (orderCount > 0) {
        return NextResponse.json(
          { error: "This coupon is valid for first orders only" },
          { status: 400 }
        );
      }
    }

    // Calculate cart subtotal
    const subtotal = cart.items.reduce((sum, item) => {
      const price = item.variant
        ? Number(item.variant.price)
        : Number(item.product.price);
      return sum + price * item.quantity;
    }, 0);

    // Minimum order value
    if (coupon.minOrderValue && subtotal < Number(coupon.minOrderValue)) {
      return NextResponse.json(
        {
          error: `Minimum order value of ${Number(coupon.minOrderValue)} is required for this coupon`,
        },
        { status: 400 }
      );
    }

    // Maximum order value
    if (coupon.maxOrderValue && subtotal > Number(coupon.maxOrderValue)) {
      return NextResponse.json(
        {
          error: `This coupon is valid for orders up to ${Number(coupon.maxOrderValue)}`,
        },
        { status: 400 }
      );
    }

    // ── Calculate discount ──────────────────────────────────────────────
    let discount = 0;

    switch (coupon.type) {
      case "PERCENTAGE":
        discount = subtotal * (Number(coupon.value) / 100);
        if (coupon.maxDiscount) {
          discount = Math.min(discount, Number(coupon.maxDiscount));
        }
        break;
      case "FIXED_CART":
        discount = Math.min(Number(coupon.value), subtotal);
        break;
      case "FIXED_PRODUCT": {
        // Apply fixed discount to each eligible item
        let eligibleItemCount = 0;
        for (const item of cart.items) {
          const isEligible =
            coupon.scope === "ALL" ||
            coupon.products.some(
              (p) => p.productId === item.productId && p.type === "INCLUDE"
            ) ||
            (item.product.categoryId &&
              coupon.categories.some(
                (c) =>
                  c.categoryId === item.product.categoryId && c.type === "INCLUDE"
              ));
          if (isEligible) {
            eligibleItemCount += item.quantity;
          }
        }
        const maxItems = coupon.limitUsageToXItems ?? eligibleItemCount;
        discount = Number(coupon.value) * Math.min(eligibleItemCount, maxItems);
        discount = Math.min(discount, subtotal);
        break;
      }
      case "FREE_SHIPPING":
        discount = 0; // Shipping discount is applied at checkout
        break;
    }

    discount = Math.round(discount * 100) / 100;

    // ── Apply coupon to cart ────────────────────────────────────────────
    await prisma.cart.update({
      where: { id: cart.id },
      data: { couponId: coupon.id },
    });

    return NextResponse.json(
      {
        message: "Coupon applied successfully",
        coupon: {
          id: coupon.id,
          code: coupon.code,
          type: coupon.type,
          value: coupon.value,
          name: coupon.name,
        },
        discount,
        subtotal,
        total: Math.round((subtotal - discount) * 100) / 100,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Apply coupon error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

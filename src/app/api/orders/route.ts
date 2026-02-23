import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { getAuthUser } from "@/lib/auth";

// ── GET: List customer's orders ───────────────────────────────────────────
export async function GET(request: NextRequest) {
  try {
    const authPayload = await getAuthUser(request);
    if (!authPayload) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
    const limit = Math.min(50, Math.max(1, parseInt(searchParams.get("limit") || "10", 10)));
    const status = searchParams.get("status") || "";
    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = { userId: authPayload.userId };
    if (status) {
      where.status = status;
    }

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          orderNumber: true,
          status: true,
          paymentStatus: true,
          fulfillmentStatus: true,
          subtotal: true,
          discount: true,
          shippingCost: true,
          tax: true,
          total: true,
          currency: true,
          couponCode: true,
          shippingMethod: true,
          trackingNumber: true,
          createdAt: true,
          items: {
            select: {
              id: true,
              name: true,
              sku: true,
              image: true,
              price: true,
              quantity: true,
              total: true,
            },
          },
        },
      }),
      prisma.order.count({ where }),
    ]);

    return NextResponse.json(
      {
        orders,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("List orders error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// ── POST: Create order from cart ──────────────────────────────────────────
export async function POST(request: NextRequest) {
  try {
    const authPayload = await getAuthUser(request);
    if (!authPayload) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const {
      shippingAddressId,
      billingAddressId,
      paymentMethod,
      shippingMethod,
      customerNote,
    } = body;

    // ── Validate required fields ────────────────────────────────────────
    if (!shippingAddressId) {
      return NextResponse.json(
        { error: "Shipping address is required" },
        { status: 400 }
      );
    }

    if (!paymentMethod) {
      return NextResponse.json(
        { error: "Payment method is required" },
        { status: 400 }
      );
    }

    // ── Get cart ────────────────────────────────────────────────────────
    const cart = await prisma.cart.findUnique({
      where: { userId: authPayload.userId },
      include: {
        items: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                slug: true,
                sku: true,
                price: true,
                currency: true,
                stockQuantity: true,
                stockStatus: true,
                manageStock: true,
                weight: true,
                width: true,
                height: true,
                depth: true,
                assemblyRequired: true,
                images: {
                  where: { isDefault: true },
                  take: 1,
                  select: { url: true },
                },
              },
            },
            variant: {
              select: {
                id: true,
                sku: true,
                name: true,
                price: true,
                stockQuantity: true,
                stockStatus: true,
                manageStock: true,
                weight: true,
                width: true,
                height: true,
                depth: true,
              },
            },
          },
        },
        coupon: true,
      },
    });

    if (!cart || cart.items.length === 0) {
      return NextResponse.json(
        { error: "Cart is empty" },
        { status: 400 }
      );
    }

    // ── Validate shipping address ───────────────────────────────────────
    const shippingAddress = await prisma.address.findFirst({
      where: { id: shippingAddressId, userId: authPayload.userId },
    });

    if (!shippingAddress) {
      return NextResponse.json(
        { error: "Shipping address not found" },
        { status: 404 }
      );
    }

    // ── Validate billing address ────────────────────────────────────────
    let billingAddr = shippingAddress;
    if (billingAddressId && billingAddressId !== shippingAddressId) {
      const found = await prisma.address.findFirst({
        where: { id: billingAddressId, userId: authPayload.userId },
      });
      if (!found) {
        return NextResponse.json(
          { error: "Billing address not found" },
          { status: 404 }
        );
      }
      billingAddr = found;
    }

    // ── Get user ────────────────────────────────────────────────────────
    const user = await prisma.user.findUnique({
      where: { id: authPayload.userId },
      select: { email: true, phone: true },
    });

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    // ── Validate stock for all items ────────────────────────────────────
    for (const item of cart.items) {
      const source = item.variant ?? item.product;
      const manageStock = "manageStock" in source ? source.manageStock : true;
      const stockQty = source.stockQuantity;

      if (manageStock && item.quantity > stockQty) {
        return NextResponse.json(
          {
            error: `Insufficient stock for "${item.product.name}". Available: ${stockQty}`,
          },
          { status: 400 }
        );
      }
    }

    // ── Calculate totals ────────────────────────────────────────────────
    let subtotal = 0;
    const orderItems: Array<{
      productId: string;
      variantId: string | null;
      name: string;
      sku: string;
      slug: string;
      image: string | null;
      price: number;
      quantity: number;
      total: number;
      width: unknown;
      height: unknown;
      depth: unknown;
      weight: unknown;
      assemblyRequired: boolean;
    }> = [];

    for (const item of cart.items) {
      const unitPrice = item.variant
        ? Number(item.variant.price)
        : Number(item.product.price);
      const lineTotal = unitPrice * item.quantity;
      subtotal += lineTotal;

      const sku = item.variant?.sku ?? item.product.sku;
      const image = item.product.images[0]?.url ?? null;

      orderItems.push({
        productId: item.product.id,
        variantId: item.variantId,
        name: item.variant
          ? `${item.product.name} - ${item.variant.name}`
          : item.product.name,
        sku,
        slug: item.product.slug,
        image,
        price: unitPrice,
        quantity: item.quantity,
        total: lineTotal,
        width: item.variant?.width ?? item.product.width,
        height: item.variant?.height ?? item.product.height,
        depth: item.variant?.depth ?? item.product.depth,
        weight: item.variant?.weight ?? item.product.weight,
        assemblyRequired: item.product.assemblyRequired,
      });
    }

    // ── Calculate coupon discount ───────────────────────────────────────
    let discount = 0;
    const coupon = cart.coupon;

    if (coupon && coupon.isActive && coupon.status === "ACTIVE") {
      const now = new Date();
      const isValid =
        coupon.startsAt <= now &&
        (!coupon.expiresAt || coupon.expiresAt >= now) &&
        (!coupon.usageLimit || coupon.usageCount < coupon.usageLimit);

      if (isValid) {
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
          case "FIXED_PRODUCT":
            discount = Math.min(
              Number(coupon.value) * orderItems.length,
              subtotal
            );
            break;
          case "FREE_SHIPPING":
            // Will zero out shipping below
            break;
        }
      }
    }

    discount = Math.round(discount * 100) / 100;

    // Shipping cost placeholder (could be calculated based on zone, weight, etc.)
    let shippingCost = 0;
    if (coupon?.type === "FREE_SHIPPING") {
      shippingCost = 0;
    }

    const tax = 0; // Tax calculation placeholder
    const total =
      Math.round((subtotal - discount + shippingCost + tax) * 100) / 100;

    // ── Create order in a transaction ───────────────────────────────────
    const order = await prisma.$transaction(async (tx) => {
      // Generate order number
      const lastOrder = await tx.order.findFirst({
        orderBy: { createdAt: "desc" },
        select: { orderNumber: true },
      });

      let nextNum = 1;
      if (lastOrder?.orderNumber) {
        const match = lastOrder.orderNumber.match(/FSOW-(\d+)/);
        if (match) {
          nextNum = parseInt(match[1], 10) + 1;
        }
      }
      const orderNumber = `FSOW-${String(nextNum).padStart(6, "0")}`;

      // Create the order
      const newOrder = await tx.order.create({
        data: {
          orderNumber,
          userId: authPayload.userId,
          email: user.email,
          phone: user.phone,
          status: "PENDING",
          paymentStatus: "PENDING",
          fulfillmentStatus: "UNFULFILLED",
          subtotal,
          discount,
          shippingCost,
          tax,
          total,
          currency: "USD",
          shippingAddressId: shippingAddress.id,
          billingAddressId: billingAddr.id,
          billingSnapshot: {
            firstName: billingAddr.firstName,
            lastName: billingAddr.lastName,
            line1: billingAddr.line1,
            line2: billingAddr.line2,
            city: billingAddr.city,
            state: billingAddr.state,
            postalCode: billingAddr.postalCode,
            country: billingAddr.country,
          },
          paymentMethod: paymentMethod as
            | "CREDIT_CARD"
            | "DEBIT_CARD"
            | "UPI"
            | "NET_BANKING"
            | "WALLET"
            | "COD"
            | "EMI"
            | "BANK_TRANSFER",
          shippingMethod: shippingMethod || null,
          customerNote: customerNote || null,
          couponId: coupon?.id ?? null,
          couponCode: coupon?.code ?? null,
          source: "website",
          ipAddress:
            request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
            request.headers.get("x-real-ip") ??
            null,
          userAgent: request.headers.get("user-agent") ?? null,
          items: {
            create: orderItems.map((item) => ({
              productId: item.productId,
              variantId: item.variantId,
              name: item.name,
              sku: item.sku,
              slug: item.slug,
              image: item.image,
              price: item.price,
              quantity: item.quantity,
              total: item.total,
              width: item.width as number | null,
              height: item.height as number | null,
              depth: item.depth as number | null,
              weight: item.weight as number | null,
              assemblyRequired: item.assemblyRequired,
            })),
          },
          timeline: {
            create: {
              status: "PENDING",
              title: "Order placed",
              description: `Order ${orderNumber} has been placed successfully.`,
            },
          },
        },
        include: {
          items: true,
        },
      });

      // ── Decrement stock ─────────────────────────────────────────────
      for (const item of cart.items) {
        if (item.variant && item.variant.manageStock) {
          const newQty = item.variant.stockQuantity - item.quantity;
          await tx.productVariant.update({
            where: { id: item.variant.id },
            data: {
              stockQuantity: Math.max(0, newQty),
              stockStatus: newQty <= 0 ? "OUT_OF_STOCK" : newQty <= 5 ? "LOW_STOCK" : "IN_STOCK",
            },
          });
        } else if (item.product.manageStock) {
          const newQty = item.product.stockQuantity - item.quantity;
          await tx.product.update({
            where: { id: item.product.id },
            data: {
              stockQuantity: Math.max(0, newQty),
              stockStatus: newQty <= 0 ? "OUT_OF_STOCK" : newQty <= 5 ? "LOW_STOCK" : "IN_STOCK",
            },
          });

          // Log inventory change
          await tx.inventoryLog.create({
            data: {
              productId: item.product.id,
              variantId: item.variantId,
              type: "DECREASE",
              quantity: item.quantity,
              previousQty: item.product.stockQuantity,
              newQty: Math.max(0, newQty),
              reason: "Order placed",
              referenceType: "Order",
              referenceId: newOrder.id,
            },
          });
        }
      }

      // ── Record coupon usage ───────────────────────────────────────────
      if (coupon) {
        await tx.coupon.update({
          where: { id: coupon.id },
          data: { usageCount: { increment: 1 } },
        });

        await tx.couponUsage.create({
          data: {
            couponId: coupon.id,
            userId: authPayload.userId,
            orderId: newOrder.id,
          },
        });
      }

      // ── Clear cart ────────────────────────────────────────────────────
      await tx.cartItem.deleteMany({ where: { cartId: cart.id } });
      await tx.cart.update({
        where: { id: cart.id },
        data: { couponId: null },
      });

      return newOrder;
    });

    return NextResponse.json(
      {
        message: "Order created successfully",
        order: {
          id: order.id,
          orderNumber: order.orderNumber,
          status: order.status,
          total: order.total,
          items: order.items,
          createdAt: order.createdAt,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Create order error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

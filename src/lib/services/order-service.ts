import prisma from "@/lib/db";

type CreateOrderInput = {
  userId: string;
  shippingAddressId: string;
  billingAddressId?: string;
  paymentMethod: string;
  shippingMethod?: string;
  customerNote?: string;
  gateway?: string;
  gatewayOrderId?: string;
  gatewayPaymentId?: string;
  paymentStatus?: string;
  ipAddress?: string | null;
  userAgent?: string | null;
};

export async function createOrderFromCart(input: CreateOrderInput) {
  const {
    userId,
    shippingAddressId,
    billingAddressId,
    paymentMethod,
    shippingMethod,
    customerNote,
    gateway,
    gatewayOrderId,
    gatewayPaymentId,
    paymentStatus = "PENDING",
    ipAddress,
    userAgent,
  } = input;

  // Get cart
  const cart = await prisma.cart.findUnique({
    where: { userId },
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
    throw new OrderError("Cart is empty", 400);
  }

  // Validate shipping address
  const shippingAddress = await prisma.address.findFirst({
    where: { id: shippingAddressId, userId },
  });
  if (!shippingAddress) {
    throw new OrderError("Shipping address not found", 404);
  }

  // Validate billing address
  let billingAddr = shippingAddress;
  if (billingAddressId && billingAddressId !== shippingAddressId) {
    const found = await prisma.address.findFirst({
      where: { id: billingAddressId, userId },
    });
    if (!found) {
      throw new OrderError("Billing address not found", 404);
    }
    billingAddr = found;
  }

  // Get user
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { email: true, phone: true },
  });
  if (!user) {
    throw new OrderError("User not found", 404);
  }

  // Validate stock
  for (const item of cart.items) {
    const source = item.variant ?? item.product;
    const manageStock = "manageStock" in source ? source.manageStock : true;
    const stockQty = source.stockQuantity;

    if (manageStock && item.quantity > stockQty) {
      throw new OrderError(
        `Insufficient stock for "${item.product.name}". Available: ${stockQty}`,
        400
      );
    }
  }

  // Calculate totals
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
    width: number | null;
    height: number | null;
    depth: number | null;
    weight: number | null;
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
      width: (item.variant?.width ?? item.product.width) as number | null,
      height: (item.variant?.height ?? item.product.height) as number | null,
      depth: (item.variant?.depth ?? item.product.depth) as number | null,
      weight: (item.variant?.weight ?? item.product.weight) as number | null,
      assemblyRequired: item.product.assemblyRequired,
    });
  }

  // Calculate coupon discount
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
          break;
      }
    }
  }

  discount = Math.round(discount * 100) / 100;

  let shippingCost = 0;
  if (coupon?.type === "FREE_SHIPPING") {
    shippingCost = 0;
  }

  const tax = 0;
  const total =
    Math.round((subtotal - discount + shippingCost + tax) * 100) / 100;

  // Create order in transaction
  const order = await prisma.$transaction(async (tx) => {
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

    const newOrder = await tx.order.create({
      data: {
        orderNumber,
        userId,
        email: user.email,
        phone: user.phone,
        status: "PENDING",
        paymentStatus: paymentStatus as "PENDING" | "AUTHORIZED" | "CAPTURED" | "PARTIALLY_REFUNDED" | "REFUNDED" | "FAILED" | "VOIDED",
        fulfillmentStatus: "UNFULFILLED",
        subtotal,
        discount,
        shippingCost,
        tax,
        total,
        currency: "INR",
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
        gateway: gateway || null,
        gatewayOrderId: gatewayOrderId || null,
        gatewayPaymentId: gatewayPaymentId || null,
        ipAddress: ipAddress ?? null,
        userAgent: userAgent ?? null,
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
            width: item.width,
            height: item.height,
            depth: item.depth,
            weight: item.weight,
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

    // Decrement stock
    for (const item of cart.items) {
      if (item.variant && item.variant.manageStock) {
        const newQty = item.variant.stockQuantity - item.quantity;
        await tx.productVariant.update({
          where: { id: item.variant.id },
          data: {
            stockQuantity: Math.max(0, newQty),
            stockStatus:
              newQty <= 0 ? "OUT_OF_STOCK" : newQty <= 5 ? "LOW_STOCK" : "IN_STOCK",
          },
        });
      } else if (item.product.manageStock) {
        const newQty = item.product.stockQuantity - item.quantity;
        await tx.product.update({
          where: { id: item.product.id },
          data: {
            stockQuantity: Math.max(0, newQty),
            stockStatus:
              newQty <= 0 ? "OUT_OF_STOCK" : newQty <= 5 ? "LOW_STOCK" : "IN_STOCK",
          },
        });

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

    // Record coupon usage
    if (coupon) {
      await tx.coupon.update({
        where: { id: coupon.id },
        data: { usageCount: { increment: 1 } },
      });

      await tx.couponUsage.create({
        data: {
          couponId: coupon.id,
          userId,
          orderId: newOrder.id,
        },
      });
    }

    // Clear cart
    await tx.cartItem.deleteMany({ where: { cartId: cart.id } });
    await tx.cart.update({
      where: { id: cart.id },
      data: { couponId: null },
    });

    return newOrder;
  });

  return order;
}

export class OrderError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
    this.name = "OrderError";
  }
}

export async function calculateCartTotal(userId: string) {
  const cart = await prisma.cart.findUnique({
    where: { userId },
    include: {
      items: {
        include: {
          product: {
            select: { price: true, stockQuantity: true, manageStock: true, name: true },
          },
          variant: {
            select: { price: true, stockQuantity: true, manageStock: true },
          },
        },
      },
      coupon: true,
    },
  });

  if (!cart || cart.items.length === 0) {
    throw new OrderError("Cart is empty", 400);
  }

  // Validate stock
  for (const item of cart.items) {
    const source = item.variant ?? item.product;
    const manageStock = "manageStock" in source ? source.manageStock : true;
    const stockQty = source.stockQuantity;

    if (manageStock && item.quantity > stockQty) {
      throw new OrderError(
        `Insufficient stock for "${item.product.name}". Available: ${stockQty}`,
        400
      );
    }
  }

  let subtotal = 0;
  for (const item of cart.items) {
    const unitPrice = item.variant
      ? Number(item.variant.price)
      : Number(item.product.price);
    subtotal += unitPrice * item.quantity;
  }

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
            Number(coupon.value) * cart.items.length,
            subtotal
          );
          break;
        case "FREE_SHIPPING":
          break;
      }
    }
  }

  discount = Math.round(discount * 100) / 100;
  const shippingCost = 0;
  const tax = 0;
  const total = Math.round((subtotal - discount + shippingCost + tax) * 100) / 100;

  return { subtotal, discount, shippingCost, tax, total, itemCount: cart.items.length };
}

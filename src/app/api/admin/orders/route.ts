import { NextResponse, type NextRequest } from "next/server";
import prisma from "@/lib/db";
import { validateBody, createOrderSchema } from "@/lib/validation";

// ---------------------------------------------------------------------------
// GET /api/admin/orders - List orders with filtering, search, pagination
// ---------------------------------------------------------------------------

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
    const limit = Math.min(
      100,
      Math.max(1, parseInt(searchParams.get("limit") || "20", 10))
    );
    const search = searchParams.get("search") || undefined;
    const status = searchParams.get("status") || undefined;
    const paymentStatus = searchParams.get("paymentStatus") || undefined;
    const fulfillmentStatus =
      searchParams.get("fulfillmentStatus") || undefined;
    const dateFrom = searchParams.get("dateFrom") || undefined;
    const dateTo = searchParams.get("dateTo") || undefined;
    const sortBy = searchParams.get("sortBy") || "createdAt";
    const sortOrder = searchParams.get("sortOrder") === "asc" ? "asc" : "desc";

    const where: Record<string, unknown> = {};

    if (search) {
      where.OR = [
        { orderNumber: { contains: search, mode: "insensitive" } },
        { email: { contains: search, mode: "insensitive" } },
        {
          user: {
            OR: [
              { firstName: { contains: search, mode: "insensitive" } },
              { lastName: { contains: search, mode: "insensitive" } },
            ],
          },
        },
      ];
    }

    if (status) {
      where.status = status;
    }

    if (paymentStatus) {
      where.paymentStatus = paymentStatus;
    }

    if (fulfillmentStatus) {
      where.fulfillmentStatus = fulfillmentStatus;
    }

    if (dateFrom || dateTo) {
      where.createdAt = {};
      if (dateFrom) {
        (where.createdAt as Record<string, unknown>).gte = new Date(dateFrom);
      }
      if (dateTo) {
        (where.createdAt as Record<string, unknown>).lte = new Date(dateTo);
      }
    }

    const allowedSortFields = [
      "createdAt",
      "updatedAt",
      "total",
      "orderNumber",
    ];
    const safeSortBy = allowedSortFields.includes(sortBy)
      ? sortBy
      : "createdAt";

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { [safeSortBy]: sortOrder },
        select: {
          id: true,
          orderNumber: true,
          email: true,
          phone: true,
          status: true,
          paymentStatus: true,
          fulfillmentStatus: true,
          subtotal: true,
          discount: true,
          shippingCost: true,
          tax: true,
          total: true,
          currency: true,
          paymentMethod: true,
          shippingMethod: true,
          trackingNumber: true,
          carrier: true,
          couponCode: true,
          source: true,
          createdAt: true,
          updatedAt: true,
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
              avatar: true,
            },
          },
          _count: { select: { items: true } },
        },
      }),
      prisma.order.count({ where }),
    ]);

    return NextResponse.json({
      data: orders,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("GET /api/admin/orders error:", error);
    return NextResponse.json(
      { error: "Failed to fetch orders" },
      { status: 500 }
    );
  }
}

// ---------------------------------------------------------------------------
// POST /api/admin/orders - Create an order (admin-initiated)
// ---------------------------------------------------------------------------

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validation = validateBody(createOrderSchema, body);

    if (!validation.success) {
      return NextResponse.json(
        { error: "Validation failed", details: validation.errors },
        { status: 400 },
      );
    }

    const data = validation.data;
    const userId = request.headers.get("x-user-id") || undefined;

    // Generate order number
    const orderNumber = `ORD-${Date.now()}-${Math.random().toString(36).substring(2, 7).toUpperCase()}`;

    // Fetch products to calculate totals
    const productIds = data.items.map((item) => item.productId);
    const products = await prisma.product.findMany({
      where: { id: { in: productIds } },
      select: { id: true, name: true, slug: true, sku: true, price: true },
    });

    const productMap = new Map(products.map((p: { id: string; name: string; slug: string; sku: string; price: unknown }) => [p.id, p]));

    let subtotal = 0;
    const orderItems = data.items.map((item: { productId: string; variantId?: string; quantity: number }) => {
      const product = productMap.get(item.productId);
      if (!product) {
        throw new Error(`Product ${item.productId} not found`);
      }
      const itemTotal = Number(product.price) * item.quantity;
      subtotal += itemTotal;
      return {
        productId: product.id as string,
        variantId: item.variantId || null,
        name: product.name as string,
        sku: product.sku as string,
        slug: product.slug as string,
        price: Number(product.price),
        quantity: item.quantity,
        total: itemTotal,
      };
    });

    const order = await prisma.order.create({
      data: {
        orderNumber,
        userId: body.userId || null,
        email: body.email || "",
        phone: body.phone || null,
        status: "PENDING",
        paymentStatus: "PENDING",
        fulfillmentStatus: "UNFULFILLED",
        subtotal,
        total: subtotal,
        currency: "USD",
        shippingAddressId: data.shippingAddressId,
        billingAddressId: data.billingAddressId || null,
        paymentMethod: data.paymentMethod,
        shippingMethod: data.shippingMethod || null,
        customerNote: data.couponCode || null,
        source: "admin",
        items: { create: orderItems },
        timeline: {
          create: {
            status: "PENDING",
            title: "Order created",
            description: "Order created by admin",
            createdBy: userId,
          },
        },
      },
      include: {
        items: true,
        user: {
          select: { id: true, firstName: true, lastName: true, email: true },
        },
      },
    });

    return NextResponse.json({ data: order }, { status: 201 });
  } catch (error) {
    console.error("POST /api/admin/orders error:", error);
    return NextResponse.json(
      { error: "Failed to create order" },
      { status: 500 },
    );
  }
}

// ---------------------------------------------------------------------------
// DELETE /api/admin/orders - Bulk delete orders
// ---------------------------------------------------------------------------

export async function DELETE(request: NextRequest) {
  try {
    const body = await request.json();
    const { ids } = body;

    if (!Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json(
        { error: "ids array is required" },
        { status: 400 },
      );
    }

    await prisma.order.deleteMany({
      where: { id: { in: ids } },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE /api/admin/orders error:", error);
    return NextResponse.json(
      { error: "Failed to delete orders" },
      { status: 500 },
    );
  }
}

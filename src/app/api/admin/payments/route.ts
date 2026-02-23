import { NextResponse, type NextRequest } from "next/server";
import prisma from "@/lib/db";

// ---------------------------------------------------------------------------
// GET /api/admin/payments - List payments/transactions from orders
// ---------------------------------------------------------------------------

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
    const limit = Math.min(
      100,
      Math.max(1, parseInt(searchParams.get("limit") || "20", 10)),
    );
    const search = searchParams.get("search") || undefined;
    const paymentStatus = searchParams.get("paymentStatus") || undefined;
    const paymentMethod = searchParams.get("paymentMethod") || undefined;
    const dateFrom = searchParams.get("dateFrom") || undefined;
    const dateTo = searchParams.get("dateTo") || undefined;
    const sortBy = searchParams.get("sortBy") || "createdAt";
    const sortOrder = searchParams.get("sortOrder") === "asc" ? "asc" : "desc";

    const where: Record<string, unknown> = {
      paymentStatus: { not: "PENDING" },
    };

    if (search) {
      where.OR = [
        { orderNumber: { contains: search, mode: "insensitive" } },
        { email: { contains: search, mode: "insensitive" } },
        { transactionId: { contains: search, mode: "insensitive" } },
        { gatewayPaymentId: { contains: search, mode: "insensitive" } },
      ];
    }

    if (paymentStatus) {
      where.paymentStatus = paymentStatus;
    }

    if (paymentMethod) {
      where.paymentMethod = paymentMethod;
    }

    if (dateFrom || dateTo) {
      where.paidAt = {};
      if (dateFrom) {
        (where.paidAt as Record<string, unknown>).gte = new Date(dateFrom);
      }
      if (dateTo) {
        (where.paidAt as Record<string, unknown>).lte = new Date(dateTo);
      }
    }

    const allowedSortFields = ["createdAt", "paidAt", "total"];
    const safeSortBy = allowedSortFields.includes(sortBy)
      ? sortBy
      : "createdAt";

    const [orders, total, aggregates] = await Promise.all([
      prisma.order.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { [safeSortBy]: sortOrder },
        select: {
          id: true,
          orderNumber: true,
          email: true,
          paymentStatus: true,
          paymentMethod: true,
          paymentMethodTitle: true,
          gateway: true,
          gatewayOrderId: true,
          gatewayPaymentId: true,
          transactionId: true,
          cardLast4: true,
          cardBrand: true,
          total: true,
          currency: true,
          paidAt: true,
          createdAt: true,
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
            },
          },
          refunds: {
            select: {
              id: true,
              amount: true,
              status: true,
              processedAt: true,
            },
          },
        },
      }),
      prisma.order.count({ where }),
      prisma.order.aggregate({
        where,
        _sum: { total: true },
        _count: true,
      }),
    ]);

    return NextResponse.json({
      data: orders,
      summary: {
        totalAmount: Number(aggregates._sum.total ?? 0),
        transactionCount: aggregates._count,
      },
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("GET /api/admin/payments error:", error);
    return NextResponse.json(
      { error: "Failed to fetch payments" },
      { status: 500 },
    );
  }
}

import { NextResponse, type NextRequest } from "next/server";
import prisma from "@/lib/db";

// ---------------------------------------------------------------------------
// GET /api/admin/inquiries — list inquiries with filtering & pagination
// ---------------------------------------------------------------------------

export async function GET(request: NextRequest) {
  try {
    const sp = request.nextUrl.searchParams;
    const page = Math.max(1, parseInt(sp.get("page") ?? "1", 10));
    const limit = Math.min(
      100,
      Math.max(1, parseInt(sp.get("limit") ?? "20", 10)),
    );
    const search = sp.get("search") ?? undefined;
    const status = sp.get("status") ?? undefined;
    const dateFrom = sp.get("dateFrom") ?? undefined;
    const dateTo = sp.get("dateTo") ?? undefined;
    const sortOrder = sp.get("sortOrder") === "asc" ? "asc" : "desc";

    const where: Record<string, unknown> = {};

    if (search) {
      where.OR = [
        { inquiryNumber: { contains: search, mode: "insensitive" } },
        { customerEmail: { contains: search, mode: "insensitive" } },
        { customerName: { contains: search, mode: "insensitive" } },
        { productName: { contains: search, mode: "insensitive" } },
      ];
    }

    if (status) {
      where.status = status;
    }

    if (dateFrom || dateTo) {
      const range: Record<string, Date> = {};
      if (dateFrom) range.gte = new Date(dateFrom);
      if (dateTo) range.lte = new Date(dateTo);
      where.createdAt = range;
    }

    const [inquiries, total, statusCounts] = await Promise.all([
      prisma.orderInquiry.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: sortOrder },
        select: {
          id: true,
          inquiryNumber: true,
          status: true,
          customerName: true,
          customerEmail: true,
          customerPhone: true,
          productName: true,
          productSlug: true,
          quantity: true,
          unitPrice: true,
          currency: true,
          createdAt: true,
          updatedAt: true,
          lastContactedAt: true,
        },
      }),
      prisma.orderInquiry.count({ where }),
      prisma.orderInquiry.groupBy({
        by: ["status"],
        _count: { _all: true },
      }),
    ]);

    return NextResponse.json({
      data: inquiries,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
      statusCounts: Object.fromEntries(
        statusCounts.map((s) => [s.status, s._count._all]),
      ),
    });
  } catch (error) {
    console.error("GET /api/admin/inquiries error:", error);
    return NextResponse.json(
      { error: "Failed to fetch inquiries" },
      { status: 500 },
    );
  }
}

import { NextResponse, type NextRequest } from "next/server";
import prisma from "@/lib/db";

// ---------------------------------------------------------------------------
// GET /api/admin/coupons - List coupons with filtering, search, pagination
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
    const status = searchParams.get("status") || undefined;
    const type = searchParams.get("type") || undefined;
    const sortBy = searchParams.get("sortBy") || "createdAt";
    const sortOrder = searchParams.get("sortOrder") === "asc" ? "asc" : "desc";

    const where: Record<string, unknown> = {};

    if (search) {
      where.OR = [
        { code: { contains: search, mode: "insensitive" } },
        { name: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
      ];
    }

    if (status) {
      where.status = status;
    }

    if (type) {
      where.type = type;
    }

    const allowedSortFields = [
      "createdAt",
      "updatedAt",
      "code",
      "name",
      "value",
      "usageCount",
      "expiresAt",
    ];
    const safeSortBy = allowedSortFields.includes(sortBy)
      ? sortBy
      : "createdAt";

    const [coupons, total] = await Promise.all([
      prisma.coupon.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { [safeSortBy]: sortOrder },
        select: {
          id: true,
          code: true,
          name: true,
          description: true,
          type: true,
          value: true,
          maxDiscount: true,
          scope: true,
          usageLimit: true,
          usageLimitPerUser: true,
          usageCount: true,
          minOrderValue: true,
          isActive: true,
          status: true,
          isStackable: true,
          firstOrderOnly: true,
          startsAt: true,
          expiresAt: true,
          createdAt: true,
          updatedAt: true,
          _count: {
            select: { orders: true, usages: true },
          },
        },
      }),
      prisma.coupon.count({ where }),
    ]);

    return NextResponse.json({
      data: coupons,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("GET /api/admin/coupons error:", error);
    return NextResponse.json(
      { error: "Failed to fetch coupons" },
      { status: 500 },
    );
  }
}

// ---------------------------------------------------------------------------
// POST /api/admin/coupons - Create a new coupon
// ---------------------------------------------------------------------------

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const {
      code,
      name,
      description,
      type = "PERCENTAGE",
      value,
      maxDiscount,
      scope = "ALL",
      usageLimit,
      usageLimitPerUser,
      limitUsageToXItems,
      minOrderValue,
      maxOrderValue,
      minimumItemCount,
      isStackable = false,
      firstOrderOnly = false,
      excludeSaleItems = false,
      allowedEmails,
      eligibleCustomerTags = [],
      isActive = true,
      status = "ACTIVE",
      startsAt,
      expiresAt,
      internalNotes,
      productIds = [],
      categoryIds = [],
    } = body;

    if (!code || !name || value === undefined) {
      return NextResponse.json(
        { error: "Code, name, and value are required" },
        { status: 400 },
      );
    }

    // Check for duplicate code
    const existing = await prisma.coupon.findUnique({ where: { code } });
    if (existing) {
      return NextResponse.json(
        { error: "A coupon with this code already exists" },
        { status: 409 },
      );
    }

    const userId = request.headers.get("x-user-id") || undefined;

    const coupon = await prisma.coupon.create({
      data: {
        code: code.toUpperCase(),
        name,
        description,
        type,
        value,
        maxDiscount,
        scope,
        usageLimit,
        usageLimitPerUser,
        limitUsageToXItems,
        minOrderValue,
        maxOrderValue,
        minimumItemCount,
        isStackable,
        firstOrderOnly,
        excludeSaleItems,
        allowedEmails,
        eligibleCustomerTags,
        isActive,
        status,
        startsAt: startsAt ? new Date(startsAt) : new Date(),
        expiresAt: expiresAt ? new Date(expiresAt) : null,
        internalNotes,
        createdBy: userId,
        products: {
          create: productIds.map((productId: string) => ({
            productId,
            type: "INCLUDE",
          })),
        },
        categories: {
          create: categoryIds.map((categoryId: string) => ({
            categoryId,
            type: "INCLUDE",
          })),
        },
      },
      include: {
        products: true,
        categories: true,
      },
    });

    return NextResponse.json({ data: coupon }, { status: 201 });
  } catch (error) {
    console.error("POST /api/admin/coupons error:", error);
    return NextResponse.json(
      { error: "Failed to create coupon" },
      { status: 500 },
    );
  }
}

import { NextResponse, type NextRequest } from "next/server";
import prisma from "@/lib/db";

// ---------------------------------------------------------------------------
// GET /api/admin/inventory - List products with stock information
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
    const stockStatus = searchParams.get("stockStatus") || undefined;
    const lowStock = searchParams.get("lowStock") === "true";
    const sortBy = searchParams.get("sortBy") || "stockQuantity";
    const sortOrder = searchParams.get("sortOrder") === "desc" ? "desc" : "asc";

    const where: Record<string, unknown> = {
      manageStock: true,
    };

    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { sku: { contains: search, mode: "insensitive" } },
      ];
    }

    if (stockStatus) {
      where.stockStatus = stockStatus;
    }

    if (lowStock) {
      where.stockStatus = { in: ["LOW_STOCK", "OUT_OF_STOCK"] };
    }

    const allowedSortFields = [
      "stockQuantity",
      "name",
      "sku",
      "updatedAt",
      "price",
    ];
    const safeSortBy = allowedSortFields.includes(sortBy)
      ? sortBy
      : "stockQuantity";

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { [safeSortBy]: sortOrder },
        select: {
          id: true,
          name: true,
          sku: true,
          price: true,
          stockQuantity: true,
          lowStockThreshold: true,
          stockStatus: true,
          backorderMode: true,
          manageStock: true,
          status: true,
          category: { select: { id: true, name: true } },
          images: {
            where: { isDefault: true },
            take: 1,
            select: { url: true, alt: true },
          },
          variants: {
            select: {
              id: true,
              sku: true,
              name: true,
              stockQuantity: true,
              lowStockThreshold: true,
              stockStatus: true,
              manageStock: true,
            },
            orderBy: { sortOrder: "asc" },
          },
          inventoryLogs: {
            orderBy: { createdAt: "desc" },
            take: 5,
            select: {
              id: true,
              type: true,
              quantity: true,
              previousQty: true,
              newQty: true,
              reason: true,
              createdAt: true,
            },
          },
        },
      }),
      prisma.product.count({ where }),
    ]);

    return NextResponse.json({
      data: products,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("GET /api/admin/inventory error:", error);
    return NextResponse.json(
      { error: "Failed to fetch inventory" },
      { status: 500 },
    );
  }
}

// ---------------------------------------------------------------------------
// PUT /api/admin/inventory - Bulk update stock levels
// ---------------------------------------------------------------------------

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const userId = request.headers.get("x-user-id") || undefined;

    const { updates } = body;

    if (!Array.isArray(updates) || updates.length === 0) {
      return NextResponse.json(
        { error: "Updates array is required" },
        { status: 400 },
      );
    }

    // Process each update in a transaction
    const results = await prisma.$transaction(
      updates.map(
        (update: {
          productId: string;
          stockQuantity: number;
          reason?: string;
        }) => {
          // Determine stock status based on quantity
          let stockStatus: "IN_STOCK" | "LOW_STOCK" | "OUT_OF_STOCK";
          if (update.stockQuantity <= 0) {
            stockStatus = "OUT_OF_STOCK";
          } else if (update.stockQuantity <= 5) {
            stockStatus = "LOW_STOCK";
          } else {
            stockStatus = "IN_STOCK";
          }

          return prisma.product.update({
            where: { id: update.productId },
            data: {
              stockQuantity: update.stockQuantity,
              stockStatus,
              inventoryLogs: {
                create: {
                  type: "SET",
                  quantity: update.stockQuantity,
                  previousQty: 0, // Will be overridden by trigger or application logic
                  newQty: update.stockQuantity,
                  reason: update.reason || "Bulk inventory update",
                  createdBy: userId,
                },
              },
            },
            select: {
              id: true,
              name: true,
              sku: true,
              stockQuantity: true,
              stockStatus: true,
            },
          });
        },
      ),
    );

    return NextResponse.json({ data: results });
  } catch (error) {
    console.error("PUT /api/admin/inventory error:", error);
    return NextResponse.json(
      { error: "Failed to update inventory" },
      { status: 500 },
    );
  }
}

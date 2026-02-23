import { NextResponse, type NextRequest } from "next/server";
import prisma from "@/lib/db";

// ---------------------------------------------------------------------------
// GET /api/admin/inventory/[id] - Get stock info for a single product
// ---------------------------------------------------------------------------

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;

    const product = await prisma.product.findUnique({
      where: { id },
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
            isActive: true,
          },
          orderBy: { sortOrder: "asc" },
        },
        inventoryLogs: {
          orderBy: { createdAt: "desc" },
          take: 50,
          select: {
            id: true,
            type: true,
            quantity: true,
            previousQty: true,
            newQty: true,
            reason: true,
            referenceType: true,
            referenceId: true,
            notes: true,
            createdBy: true,
            createdAt: true,
          },
        },
      },
    });

    if (!product) {
      return NextResponse.json(
        { error: "Product not found" },
        { status: 404 },
      );
    }

    return NextResponse.json({ data: product });
  } catch (error) {
    console.error("GET /api/admin/inventory/[id] error:", error);
    return NextResponse.json(
      { error: "Failed to fetch product inventory" },
      { status: 500 },
    );
  }
}

// ---------------------------------------------------------------------------
// PUT /api/admin/inventory/[id] - Update stock for a single product
// ---------------------------------------------------------------------------

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const userId = request.headers.get("x-user-id") || undefined;

    const existing = await prisma.product.findUnique({
      where: { id },
      select: { id: true, stockQuantity: true, lowStockThreshold: true },
    });

    if (!existing) {
      return NextResponse.json(
        { error: "Product not found" },
        { status: 404 },
      );
    }

    const {
      stockQuantity,
      adjustment,
      lowStockThreshold,
      backorderMode,
      reason,
      notes,
      variantId,
      variantStockQuantity,
    } = body;

    // Calculate new quantity
    let newQty: number;
    let logType: string;
    let logQuantity: number;

    if (adjustment !== undefined) {
      // Relative adjustment
      newQty = existing.stockQuantity + adjustment;
      logType = adjustment >= 0 ? "INCREASE" : "DECREASE";
      logQuantity = Math.abs(adjustment);
    } else if (stockQuantity !== undefined) {
      // Absolute set
      newQty = stockQuantity;
      logType = "SET";
      logQuantity = stockQuantity;
    } else if (variantId && variantStockQuantity !== undefined) {
      // Update variant stock
      const variant = await prisma.productVariant.findFirst({
        where: { id: variantId, productId: id },
      });
      if (!variant) {
        return NextResponse.json(
          { error: "Variant not found" },
          { status: 404 },
        );
      }

      let variantStockStatus: "IN_STOCK" | "LOW_STOCK" | "OUT_OF_STOCK";
      if (variantStockQuantity <= 0) {
        variantStockStatus = "OUT_OF_STOCK";
      } else if (variantStockQuantity <= (variant.lowStockThreshold || 5)) {
        variantStockStatus = "LOW_STOCK";
      } else {
        variantStockStatus = "IN_STOCK";
      }

      const updatedVariant = await prisma.productVariant.update({
        where: { id: variantId },
        data: {
          stockQuantity: variantStockQuantity,
          stockStatus: variantStockStatus,
        },
      });

      // Log the change
      await prisma.inventoryLog.create({
        data: {
          productId: id,
          variantId,
          type: "SET",
          quantity: variantStockQuantity,
          previousQty: variant.stockQuantity,
          newQty: variantStockQuantity,
          reason: reason || "Manual variant stock update",
          notes,
          createdBy: userId,
        },
      });

      return NextResponse.json({ data: updatedVariant });
    } else {
      return NextResponse.json(
        { error: "Either stockQuantity, adjustment, or variant stock data is required" },
        { status: 400 },
      );
    }

    // Ensure non-negative
    if (newQty < 0) newQty = 0;

    // Determine stock status
    const threshold = lowStockThreshold ?? existing.lowStockThreshold;
    let stockStatus: "IN_STOCK" | "LOW_STOCK" | "OUT_OF_STOCK";
    if (newQty <= 0) {
      stockStatus = "OUT_OF_STOCK";
    } else if (newQty <= threshold) {
      stockStatus = "LOW_STOCK";
    } else {
      stockStatus = "IN_STOCK";
    }

    const updateData: Record<string, unknown> = {
      stockQuantity: newQty,
      stockStatus,
    };

    if (lowStockThreshold !== undefined) {
      updateData.lowStockThreshold = lowStockThreshold;
    }
    if (backorderMode !== undefined) {
      updateData.backorderMode = backorderMode;
    }

    // Update product and create log in a transaction
    const [product] = await prisma.$transaction([
      prisma.product.update({
        where: { id },
        data: updateData,
        select: {
          id: true,
          name: true,
          sku: true,
          stockQuantity: true,
          lowStockThreshold: true,
          stockStatus: true,
          backorderMode: true,
        },
      }),
      prisma.inventoryLog.create({
        data: {
          productId: id,
          type: logType as "INCREASE" | "DECREASE" | "SET" | "ADJUSTMENT",
          quantity: logQuantity,
          previousQty: existing.stockQuantity,
          newQty,
          reason: reason || "Manual stock update",
          notes,
          createdBy: userId,
        },
      }),
    ]);

    return NextResponse.json({ data: product });
  } catch (error) {
    console.error("PUT /api/admin/inventory/[id] error:", error);
    return NextResponse.json(
      { error: "Failed to update product inventory" },
      { status: 500 },
    );
  }
}

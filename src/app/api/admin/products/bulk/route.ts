import { NextResponse, type NextRequest } from "next/server";
import prisma from "@/lib/db";

// ---------------------------------------------------------------------------
// POST /api/admin/products/bulk
// Body: { action: "delete" | "archive" | "publish", ids: string[] }
//
// - "delete": permanently removes products that have no order history,
//   archives those that do (mirrors single-product DELETE behavior).
// - "archive": sets status = ARCHIVED for all ids.
// - "publish": sets status = PUBLISHED for all ids.
// ---------------------------------------------------------------------------

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const action = body?.action as "delete" | "archive" | "publish";
    const ids: string[] = Array.isArray(body?.ids) ? body.ids : [];

    if (!action || ids.length === 0) {
      return NextResponse.json(
        { error: "action and ids[] are required" },
        { status: 400 },
      );
    }

    if (action === "archive" || action === "publish") {
      const newStatus = action === "archive" ? "ARCHIVED" : "PUBLISHED";
      const updateData: Record<string, unknown> = { status: newStatus };
      if (newStatus === "PUBLISHED") {
        updateData.publishedAt = new Date();
      }
      const result = await prisma.product.updateMany({
        where: { id: { in: ids } },
        data: updateData,
      });
      return NextResponse.json({
        success: true,
        updated: result.count,
        action,
      });
    }

    if (action === "delete") {
      // Find which products have order history → those get archived instead
      const withOrders = await prisma.product.findMany({
        where: {
          id: { in: ids },
          orderItems: { some: {} },
        },
        select: { id: true },
      });
      const archiveIds = withOrders.map((p) => p.id);
      const deleteIds = ids.filter((id) => !archiveIds.includes(id));

      let archived = 0;
      let deleted = 0;

      if (archiveIds.length > 0) {
        const r = await prisma.product.updateMany({
          where: { id: { in: archiveIds } },
          data: { status: "ARCHIVED" },
        });
        archived = r.count;
      }

      if (deleteIds.length > 0) {
        // Cart items have no cascade — clean them first
        await prisma.$transaction([
          prisma.cartItem.deleteMany({
            where: { productId: { in: deleteIds } },
          }),
          prisma.product.deleteMany({ where: { id: { in: deleteIds } } }),
        ]);
        deleted = deleteIds.length;
      }

      return NextResponse.json({
        success: true,
        deleted,
        archived,
        action,
      });
    }

    return NextResponse.json(
      { error: `Unknown action: ${action}` },
      { status: 400 },
    );
  } catch (error) {
    console.error("POST /api/admin/products/bulk error:", error);
    const message =
      error instanceof Error ? error.message : "Bulk action failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

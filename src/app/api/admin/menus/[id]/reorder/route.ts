import { NextResponse, type NextRequest } from "next/server";
import prisma from "@/lib/db";

// ---------------------------------------------------------------------------
// PUT /api/admin/menus/[id]/reorder
// Body: { items: [{ id, parentId, sortOrder }, ...] }
// Bulk-updates ordering and parent assignments for menu items.
// ---------------------------------------------------------------------------

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id: menuId } = await params;
    const body = await request.json();
    const items: Array<{
      id: string;
      parentId?: string | null;
      sortOrder?: number;
    }> = Array.isArray(body?.items) ? body.items : [];

    if (items.length === 0) {
      return NextResponse.json({ success: true, updated: 0 });
    }

    // Verify all items belong to this menu before applying any updates
    const existingIds = await prisma.menuItem.findMany({
      where: { menuId, id: { in: items.map((i) => i.id) } },
      select: { id: true },
    });
    const validIds = new Set(existingIds.map((r) => r.id));
    const invalid = items.filter((i) => !validIds.has(i.id));
    if (invalid.length > 0) {
      return NextResponse.json(
        { error: "One or more items do not belong to this menu" },
        { status: 400 },
      );
    }

    await prisma.$transaction(
      items.map((it) =>
        prisma.menuItem.update({
          where: { id: it.id },
          data: {
            ...(it.parentId !== undefined
              ? { parentId: it.parentId || null }
              : {}),
            ...(it.sortOrder !== undefined ? { sortOrder: it.sortOrder } : {}),
          },
        }),
      ),
    );

    return NextResponse.json({ success: true, updated: items.length });
  } catch (error) {
    console.error("PUT /api/admin/menus/[id]/reorder error:", error);
    return NextResponse.json(
      { error: "Failed to reorder menu items" },
      { status: 500 },
    );
  }
}

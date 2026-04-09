import { NextResponse, type NextRequest } from "next/server";
import prisma from "@/lib/db";

// ---------------------------------------------------------------------------
// PUT /api/admin/menus/[id]/items/[itemId] - Update a menu item
// ---------------------------------------------------------------------------

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; itemId: string }> },
) {
  try {
    const { id: menuId, itemId } = await params;
    const body = await request.json();

    const existing = await prisma.menuItem.findFirst({
      where: { id: itemId, menuId },
    });
    if (!existing) {
      return NextResponse.json(
        { error: "Menu item not found" },
        { status: 404 },
      );
    }

    // Validate parent belongs to same menu and isn't itself / a descendant
    if (body.parentId) {
      if (body.parentId === itemId) {
        return NextResponse.json(
          { error: "An item cannot be its own parent" },
          { status: 400 },
        );
      }
      const parentItem = await prisma.menuItem.findFirst({
        where: { id: body.parentId, menuId },
      });
      if (!parentItem) {
        return NextResponse.json(
          { error: "Parent menu item not found in this menu" },
          { status: 400 },
        );
      }
    }

    const data: Record<string, unknown> = {};
    if (body.title !== undefined) data.title = body.title;
    if (body.url !== undefined) data.url = body.url;
    if (body.type !== undefined) data.type = body.type;
    if (body.targetId !== undefined) data.targetId = body.targetId;
    if (body.target !== undefined) data.target = body.target;
    if (body.parentId !== undefined) data.parentId = body.parentId || null;
    if (body.sortOrder !== undefined) data.sortOrder = body.sortOrder;
    if (body.isActive !== undefined) data.isActive = body.isActive;

    const item = await prisma.menuItem.update({
      where: { id: itemId },
      data,
    });

    return NextResponse.json({ data: item });
  } catch (error) {
    console.error("PUT /api/admin/menus/[id]/items/[itemId] error:", error);
    return NextResponse.json(
      { error: "Failed to update menu item" },
      { status: 500 },
    );
  }
}

// ---------------------------------------------------------------------------
// DELETE /api/admin/menus/[id]/items/[itemId] - Delete a menu item (cascade children)
// ---------------------------------------------------------------------------

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string; itemId: string }> },
) {
  try {
    const { id: menuId, itemId } = await params;

    const existing = await prisma.menuItem.findFirst({
      where: { id: itemId, menuId },
    });
    if (!existing) {
      return NextResponse.json(
        { error: "Menu item not found" },
        { status: 404 },
      );
    }

    // The MenuItem self-relation has no ON DELETE CASCADE, so manually
    // collect all descendant ids and delete them with the item.
    const descendants: string[] = [];
    let frontier = [itemId];
    while (frontier.length > 0) {
      const children = await prisma.menuItem.findMany({
        where: { parentId: { in: frontier } },
        select: { id: true },
      });
      const childIds = children.map((c) => c.id);
      descendants.push(...childIds);
      frontier = childIds;
    }

    await prisma.menuItem.deleteMany({
      where: { id: { in: [...descendants, itemId] } },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE /api/admin/menus/[id]/items/[itemId] error:", error);
    return NextResponse.json(
      { error: "Failed to delete menu item" },
      { status: 500 },
    );
  }
}

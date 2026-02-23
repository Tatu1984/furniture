import { NextResponse, type NextRequest } from "next/server";
import prisma from "@/lib/db";

// ---------------------------------------------------------------------------
// GET /api/admin/menus/[id]/items - Get all items for a menu
// ---------------------------------------------------------------------------

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;

    // Verify menu exists
    const menu = await prisma.menu.findUnique({ where: { id } });
    if (!menu) {
      return NextResponse.json(
        { error: "Menu not found" },
        { status: 404 },
      );
    }

    const items = await prisma.menuItem.findMany({
      where: { menuId: id, parentId: null },
      orderBy: { sortOrder: "asc" },
      include: {
        children: {
          orderBy: { sortOrder: "asc" },
          include: {
            children: {
              orderBy: { sortOrder: "asc" },
            },
          },
        },
      },
    });

    return NextResponse.json({ data: items });
  } catch (error) {
    console.error("GET /api/admin/menus/[id]/items error:", error);
    return NextResponse.json(
      { error: "Failed to fetch menu items" },
      { status: 500 },
    );
  }
}

// ---------------------------------------------------------------------------
// POST /api/admin/menus/[id]/items - Add a menu item
// ---------------------------------------------------------------------------

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const body = await request.json();

    // Verify menu exists
    const menu = await prisma.menu.findUnique({ where: { id } });
    if (!menu) {
      return NextResponse.json(
        { error: "Menu not found" },
        { status: 404 },
      );
    }

    const {
      title,
      url,
      type = "CUSTOM",
      targetId,
      target = "_self",
      parentId,
      sortOrder = 0,
      isActive = true,
    } = body;

    if (!title) {
      return NextResponse.json(
        { error: "Title is required" },
        { status: 400 },
      );
    }

    // Validate parent belongs to same menu
    if (parentId) {
      const parentItem = await prisma.menuItem.findFirst({
        where: { id: parentId, menuId: id },
      });
      if (!parentItem) {
        return NextResponse.json(
          { error: "Parent menu item not found in this menu" },
          { status: 400 },
        );
      }
    }

    const item = await prisma.menuItem.create({
      data: {
        menuId: id,
        title,
        url,
        type,
        targetId,
        target,
        parentId: parentId || null,
        sortOrder,
        isActive,
      },
      include: {
        children: { orderBy: { sortOrder: "asc" } },
      },
    });

    return NextResponse.json({ data: item }, { status: 201 });
  } catch (error) {
    console.error("POST /api/admin/menus/[id]/items error:", error);
    return NextResponse.json(
      { error: "Failed to create menu item" },
      { status: 500 },
    );
  }
}

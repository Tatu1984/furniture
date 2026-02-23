import { NextResponse, type NextRequest } from "next/server";
import prisma from "@/lib/db";

// ---------------------------------------------------------------------------
// GET /api/admin/menus/[id]
// ---------------------------------------------------------------------------

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;

    const menu = await prisma.menu.findUnique({
      where: { id },
      include: {
        items: {
          where: { parentId: null },
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
        },
        _count: { select: { items: true } },
      },
    });

    if (!menu) {
      return NextResponse.json(
        { error: "Menu not found" },
        { status: 404 },
      );
    }

    return NextResponse.json({ data: menu });
  } catch (error) {
    console.error("GET /api/admin/menus/[id] error:", error);
    return NextResponse.json(
      { error: "Failed to fetch menu" },
      { status: 500 },
    );
  }
}

// ---------------------------------------------------------------------------
// PUT /api/admin/menus/[id]
// ---------------------------------------------------------------------------

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const body = await request.json();

    const existing = await prisma.menu.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json(
        { error: "Menu not found" },
        { status: 404 },
      );
    }

    // Check slug uniqueness if changed
    if (body.slug && body.slug !== existing.slug) {
      const slugExists = await prisma.menu.findFirst({
        where: { slug: body.slug, id: { not: id } },
      });
      if (slugExists) {
        return NextResponse.json(
          { error: "A menu with this slug already exists" },
          { status: 409 },
        );
      }
    }

    const menu = await prisma.menu.update({
      where: { id },
      data: body,
      include: {
        items: {
          where: { parentId: null },
          orderBy: { sortOrder: "asc" },
          include: {
            children: { orderBy: { sortOrder: "asc" } },
          },
        },
        _count: { select: { items: true } },
      },
    });

    return NextResponse.json({ data: menu });
  } catch (error) {
    console.error("PUT /api/admin/menus/[id] error:", error);
    return NextResponse.json(
      { error: "Failed to update menu" },
      { status: 500 },
    );
  }
}

// ---------------------------------------------------------------------------
// DELETE /api/admin/menus/[id]
// ---------------------------------------------------------------------------

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;

    const existing = await prisma.menu.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json(
        { error: "Menu not found" },
        { status: 404 },
      );
    }

    await prisma.menu.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE /api/admin/menus/[id] error:", error);
    return NextResponse.json(
      { error: "Failed to delete menu" },
      { status: 500 },
    );
  }
}

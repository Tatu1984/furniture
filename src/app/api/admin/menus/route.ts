import { NextResponse, type NextRequest } from "next/server";
import prisma from "@/lib/db";

// ---------------------------------------------------------------------------
// GET /api/admin/menus - List all menus
// ---------------------------------------------------------------------------

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const location = searchParams.get("location") || undefined;

    const where: Record<string, unknown> = {};
    if (location) {
      where.location = location;
    }

    const menus = await prisma.menu.findMany({
      where,
      orderBy: { name: "asc" },
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

    return NextResponse.json({ data: menus });
  } catch (error) {
    console.error("GET /api/admin/menus error:", error);
    return NextResponse.json(
      { error: "Failed to fetch menus" },
      { status: 500 },
    );
  }
}

// ---------------------------------------------------------------------------
// POST /api/admin/menus - Create a new menu
// ---------------------------------------------------------------------------

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const { name, slug, location = "HEADER" } = body;

    if (!name || !slug) {
      return NextResponse.json(
        { error: "Name and slug are required" },
        { status: 400 },
      );
    }

    // Check for duplicate slug
    const existing = await prisma.menu.findUnique({ where: { slug } });
    if (existing) {
      return NextResponse.json(
        { error: "A menu with this slug already exists" },
        { status: 409 },
      );
    }

    const menu = await prisma.menu.create({
      data: { name, slug, location },
      include: { _count: { select: { items: true } } },
    });

    return NextResponse.json({ data: menu }, { status: 201 });
  } catch (error) {
    console.error("POST /api/admin/menus error:", error);
    return NextResponse.json(
      { error: "Failed to create menu" },
      { status: 500 },
    );
  }
}

import { NextResponse, type NextRequest } from "next/server";
import prisma from "@/lib/db";

// ---------------------------------------------------------------------------
// GET /api/admin/categories - List categories with hierarchy
// ---------------------------------------------------------------------------

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const flat = searchParams.get("flat") === "true";
    const parentId = searchParams.get("parentId") || undefined;
    const includeInactive = searchParams.get("includeInactive") === "true";

    const where: Record<string, unknown> = {};

    if (!includeInactive) {
      where.isActive = true;
    }

    if (flat) {
      // Return flat list with pagination
      const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
      const limit = Math.min(
        100,
        Math.max(1, parseInt(searchParams.get("limit") || "50", 10)),
      );

      const [categories, total] = await Promise.all([
        prisma.category.findMany({
          where,
          skip: (page - 1) * limit,
          take: limit,
          orderBy: [{ level: "asc" }, { sortOrder: "asc" }, { name: "asc" }],
          include: {
            parent: { select: { id: true, name: true } },
            _count: { select: { products: true, children: true } },
          },
        }),
        prisma.category.count({ where }),
      ]);

      return NextResponse.json({
        data: categories,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      });
    }

    // Return hierarchical tree (top-level categories with nested children)
    if (parentId) {
      where.parentId = parentId;
    } else {
      where.parentId = null;
    }

    const categories = await prisma.category.findMany({
      where,
      orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
      include: {
        children: {
          orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
          include: {
            children: {
              orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
              include: {
                _count: { select: { products: true, children: true } },
              },
            },
            _count: { select: { products: true, children: true } },
          },
        },
        _count: { select: { products: true, children: true } },
      },
    });

    return NextResponse.json({ data: categories });
  } catch (error) {
    console.error("GET /api/admin/categories error:", error);
    return NextResponse.json(
      { error: "Failed to fetch categories" },
      { status: 500 },
    );
  }
}

// ---------------------------------------------------------------------------
// POST /api/admin/categories - Create a new category
// ---------------------------------------------------------------------------

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const {
      name,
      slug,
      description,
      image,
      bannerImage,
      icon,
      parentId,
      sortOrder = 0,
      isActive = true,
      isFeatured = false,
      seoTitle,
      seoDescription,
    } = body;

    if (!name || !slug) {
      return NextResponse.json(
        { error: "Name and slug are required" },
        { status: 400 },
      );
    }

    // Check for duplicate slug
    const existing = await prisma.category.findUnique({
      where: { slug },
    });
    if (existing) {
      return NextResponse.json(
        { error: "A category with this slug already exists" },
        { status: 409 },
      );
    }

    // Determine level based on parent
    let level = 0;
    if (parentId) {
      const parent = await prisma.category.findUnique({
        where: { id: parentId },
      });
      if (!parent) {
        return NextResponse.json(
          { error: "Parent category not found" },
          { status: 400 },
        );
      }
      level = parent.level + 1;
    }

    const category = await prisma.category.create({
      data: {
        name,
        slug,
        description,
        image,
        bannerImage,
        icon,
        parentId: parentId || null,
        level,
        sortOrder,
        isActive,
        isFeatured,
        seoTitle,
        seoDescription,
      },
      include: {
        parent: { select: { id: true, name: true } },
        _count: { select: { products: true, children: true } },
      },
    });

    return NextResponse.json({ data: category }, { status: 201 });
  } catch (error) {
    console.error("POST /api/admin/categories error:", error);
    return NextResponse.json(
      { error: "Failed to create category" },
      { status: 500 },
    );
  }
}

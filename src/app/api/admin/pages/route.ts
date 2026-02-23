import { NextResponse, type NextRequest } from "next/server";
import prisma from "@/lib/db";
import { validateBody, createPageSchema } from "@/lib/validation";

// ---------------------------------------------------------------------------
// GET /api/admin/pages - List pages with filtering and pagination
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
    const template = searchParams.get("template") || undefined;
    const sortBy = searchParams.get("sortBy") || "createdAt";
    const sortOrder = searchParams.get("sortOrder") === "asc" ? "asc" : "desc";

    const where: Record<string, unknown> = {};

    if (search) {
      where.OR = [
        { title: { contains: search, mode: "insensitive" } },
        { slug: { contains: search, mode: "insensitive" } },
        { content: { contains: search, mode: "insensitive" } },
      ];
    }

    if (status) {
      where.status = status;
    }

    if (template) {
      where.template = template;
    }

    const allowedSortFields = [
      "createdAt",
      "updatedAt",
      "title",
      "sortOrder",
      "publishedAt",
    ];
    const safeSortBy = allowedSortFields.includes(sortBy)
      ? sortBy
      : "createdAt";

    const [pages, total] = await Promise.all([
      prisma.page.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { [safeSortBy]: sortOrder },
      }),
      prisma.page.count({ where }),
    ]);

    return NextResponse.json({
      data: pages,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("GET /api/admin/pages error:", error);
    return NextResponse.json(
      { error: "Failed to fetch pages" },
      { status: 500 },
    );
  }
}

// ---------------------------------------------------------------------------
// POST /api/admin/pages - Create a new page
// ---------------------------------------------------------------------------

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validation = validateBody(createPageSchema, body);

    if (!validation.success) {
      return NextResponse.json(
        { error: "Validation failed", details: validation.errors },
        { status: 400 },
      );
    }

    const data = validation.data;

    const existing = await prisma.page.findUnique({
      where: { slug: data.slug },
    });
    if (existing) {
      return NextResponse.json(
        { error: "A page with this slug already exists" },
        { status: 409 },
      );
    }

    const page = await prisma.page.create({
      data: {
        ...data,
        publishedAt:
          data.status === "PUBLISHED"
            ? data.publishedAt
              ? new Date(data.publishedAt)
              : new Date()
            : null,
      },
    });

    return NextResponse.json({ data: page }, { status: 201 });
  } catch (error) {
    console.error("POST /api/admin/pages error:", error);
    return NextResponse.json(
      { error: "Failed to create page" },
      { status: 500 },
    );
  }
}

// ---------------------------------------------------------------------------
// DELETE /api/admin/pages - Bulk delete pages
// ---------------------------------------------------------------------------

export async function DELETE(request: NextRequest) {
  try {
    const body = await request.json();
    const { ids } = body;

    if (!Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json(
        { error: "ids array is required" },
        { status: 400 },
      );
    }

    await prisma.page.deleteMany({
      where: { id: { in: ids } },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE /api/admin/pages error:", error);
    return NextResponse.json(
      { error: "Failed to delete pages" },
      { status: 500 },
    );
  }
}

import { NextResponse, type NextRequest } from "next/server";
import prisma from "@/lib/db";

// ---------------------------------------------------------------------------
// GET /api/admin/projects - List all projects
// ---------------------------------------------------------------------------

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const status = searchParams.get("status") || undefined;
    const category = searchParams.get("category") || undefined;
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
    const limit = Math.min(
      100,
      Math.max(1, parseInt(searchParams.get("limit") || "50", 10)),
    );

    const where: Record<string, unknown> = {};
    if (status) where.status = status;
    if (category) where.category = category;

    const [projects, total] = await Promise.all([
      prisma.completedProject.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
        include: {
          media: { orderBy: { sortOrder: "asc" }, take: 1 },
        },
      }),
      prisma.completedProject.count({ where }),
    ]);

    return NextResponse.json({
      data: projects,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("GET /api/admin/projects error:", error);
    return NextResponse.json(
      { error: "Failed to fetch projects" },
      { status: 500 },
    );
  }
}

// ---------------------------------------------------------------------------
// POST /api/admin/projects - Create a new project
// ---------------------------------------------------------------------------

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const {
      title,
      slug,
      description,
      category,
      location,
      clientName,
      completedAt,
      status = "DRAFT",
      isFeatured = false,
      sortOrder = 0,
      media = [],
    } = body;

    if (!title || !slug) {
      return NextResponse.json(
        { error: "Title and slug are required" },
        { status: 400 },
      );
    }

    // Check slug uniqueness
    const existing = await prisma.completedProject.findUnique({
      where: { slug },
    });
    if (existing) {
      return NextResponse.json(
        { error: "A project with this slug already exists" },
        { status: 409 },
      );
    }

    const project = await prisma.completedProject.create({
      data: {
        title,
        slug,
        description,
        category,
        location,
        clientName,
        completedAt: completedAt ? new Date(completedAt) : null,
        status,
        isFeatured,
        sortOrder,
        media: {
          create: media.map(
            (
              m: {
                url: string;
                type?: string;
                caption?: string;
                alt?: string;
                sortOrder?: number;
                isDefault?: boolean;
              },
              i: number,
            ) => ({
              url: m.url,
              type: m.type || "IMAGE",
              caption: m.caption || null,
              alt: m.alt || "",
              sortOrder: m.sortOrder ?? i,
              isDefault: m.isDefault ?? i === 0,
            }),
          ),
        },
      },
      include: { media: true },
    });

    return NextResponse.json({ data: project }, { status: 201 });
  } catch (error) {
    console.error("POST /api/admin/projects error:", error);
    return NextResponse.json(
      { error: "Failed to create project" },
      { status: 500 },
    );
  }
}

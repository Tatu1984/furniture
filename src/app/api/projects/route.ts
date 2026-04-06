import { NextResponse, type NextRequest } from "next/server";
import prisma from "@/lib/db";

// ---------------------------------------------------------------------------
// GET /api/projects - Public: list published projects
// ---------------------------------------------------------------------------

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const category = searchParams.get("category") || undefined;
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
    const limit = Math.min(
      50,
      Math.max(1, parseInt(searchParams.get("limit") || "12", 10)),
    );

    const where: Record<string, unknown> = { status: "PUBLISHED" };
    if (category) where.category = category;

    const [projects, total] = await Promise.all([
      prisma.completedProject.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: [{ isFeatured: "desc" }, { sortOrder: "asc" }, { completedAt: "desc" }],
        include: {
          media: { orderBy: { sortOrder: "asc" } },
        },
      }),
      prisma.completedProject.count({ where }),
    ]);

    // Get distinct categories for filters
    const categories = await prisma.completedProject.findMany({
      where: { status: "PUBLISHED" },
      select: { category: true },
      distinct: ["category"],
    });

    return NextResponse.json({
      data: projects,
      categories: categories
        .map((c) => c.category)
        .filter(Boolean) as string[],
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("GET /api/projects error:", error);
    return NextResponse.json(
      { error: "Failed to fetch projects" },
      { status: 500 },
    );
  }
}

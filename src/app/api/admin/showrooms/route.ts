import { NextResponse, type NextRequest } from "next/server";
import prisma from "@/lib/db";

// ---------------------------------------------------------------------------
// GET /api/admin/showrooms - List all showrooms
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
    const isActive = searchParams.get("isActive");
    const city = searchParams.get("city") || undefined;
    const state = searchParams.get("state") || undefined;

    const where: Record<string, unknown> = {};

    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { city: { contains: search, mode: "insensitive" } },
        { state: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
      ];
    }

    if (isActive !== null && isActive !== undefined) {
      where.isActive = isActive === "true";
    }

    if (city) {
      where.city = { contains: city, mode: "insensitive" };
    }

    if (state) {
      where.state = { contains: state, mode: "insensitive" };
    }

    const [showrooms, total] = await Promise.all([
      prisma.showroom.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { name: "asc" },
      }),
      prisma.showroom.count({ where }),
    ]);

    return NextResponse.json({
      data: showrooms,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("GET /api/admin/showrooms error:", error);
    return NextResponse.json(
      { error: "Failed to fetch showrooms" },
      { status: 500 },
    );
  }
}

// ---------------------------------------------------------------------------
// POST /api/admin/showrooms - Create a new showroom
// ---------------------------------------------------------------------------

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const {
      name,
      slug,
      description,
      phone,
      email,
      line1,
      line2,
      city,
      state,
      postalCode,
      country = "IN",
      latitude,
      longitude,
      hours,
      images = [],
      isActive = true,
    } = body;

    if (!name || !slug || !line1 || !city || !state || !postalCode) {
      return NextResponse.json(
        {
          error:
            "Name, slug, address line 1, city, state, and postal code are required",
        },
        { status: 400 },
      );
    }

    // Check for duplicate slug
    const existing = await prisma.showroom.findUnique({
      where: { slug },
    });
    if (existing) {
      return NextResponse.json(
        { error: "A showroom with this slug already exists" },
        { status: 409 },
      );
    }

    const showroom = await prisma.showroom.create({
      data: {
        name,
        slug,
        description,
        phone,
        email,
        line1,
        line2,
        city,
        state,
        postalCode,
        country,
        latitude,
        longitude,
        hours,
        images,
        isActive,
      },
    });

    return NextResponse.json({ data: showroom }, { status: 201 });
  } catch (error) {
    console.error("POST /api/admin/showrooms error:", error);
    return NextResponse.json(
      { error: "Failed to create showroom" },
      { status: 500 },
    );
  }
}

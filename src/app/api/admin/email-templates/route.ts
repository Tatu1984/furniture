import { NextResponse, type NextRequest } from "next/server";
import prisma from "@/lib/db";

// ---------------------------------------------------------------------------
// GET /api/admin/email-templates - List email templates
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

    const where: Record<string, unknown> = {};

    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { subject: { contains: search, mode: "insensitive" } },
      ];
    }

    if (isActive !== null && isActive !== undefined) {
      where.isActive = isActive === "true";
    }

    const [templates, total] = await Promise.all([
      prisma.emailTemplate.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { name: "asc" },
      }),
      prisma.emailTemplate.count({ where }),
    ]);

    return NextResponse.json({
      data: templates,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("GET /api/admin/email-templates error:", error);
    return NextResponse.json(
      { error: "Failed to fetch email templates" },
      { status: 500 },
    );
  }
}

// ---------------------------------------------------------------------------
// POST /api/admin/email-templates - Create a new email template
// ---------------------------------------------------------------------------

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const {
      name,
      subject,
      bodyHtml,
      bodyText,
      isActive = true,
    } = body;

    if (!name || !subject || !bodyHtml) {
      return NextResponse.json(
        { error: "Name, subject, and bodyHtml are required" },
        { status: 400 },
      );
    }

    // Check for duplicate name
    const existing = await prisma.emailTemplate.findUnique({
      where: { name },
    });
    if (existing) {
      return NextResponse.json(
        { error: "An email template with this name already exists" },
        { status: 409 },
      );
    }

    const template = await prisma.emailTemplate.create({
      data: {
        name,
        subject,
        bodyHtml,
        bodyText,
        isActive,
      },
    });

    return NextResponse.json({ data: template }, { status: 201 });
  } catch (error) {
    console.error("POST /api/admin/email-templates error:", error);
    return NextResponse.json(
      { error: "Failed to create email template" },
      { status: 500 },
    );
  }
}

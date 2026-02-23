import { NextResponse, type NextRequest } from "next/server";
import prisma from "@/lib/db";
import { validateBody, createPageSchema } from "@/lib/validation";

// ---------------------------------------------------------------------------
// GET /api/admin/pages/[id]
// ---------------------------------------------------------------------------

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;

    const page = await prisma.page.findUnique({
      where: { id },
    });

    if (!page) {
      return NextResponse.json(
        { error: "Page not found" },
        { status: 404 },
      );
    }

    return NextResponse.json({ data: page });
  } catch (error) {
    console.error("GET /api/admin/pages/[id] error:", error);
    return NextResponse.json(
      { error: "Failed to fetch page" },
      { status: 500 },
    );
  }
}

// ---------------------------------------------------------------------------
// PUT /api/admin/pages/[id]
// ---------------------------------------------------------------------------

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const updateSchema = createPageSchema.partial();
    const validation = validateBody(updateSchema, body);

    if (!validation.success) {
      return NextResponse.json(
        { error: "Validation failed", details: validation.errors },
        { status: 400 },
      );
    }

    const existing = await prisma.page.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json(
        { error: "Page not found" },
        { status: 404 },
      );
    }

    if (body.slug && body.slug !== existing.slug) {
      const slugExists = await prisma.page.findFirst({
        where: { slug: body.slug, id: { not: id } },
      });
      if (slugExists) {
        return NextResponse.json(
          { error: "A page with this slug already exists" },
          { status: 409 },
        );
      }
    }

    const data = validation.data;
    const updateData: Record<string, unknown> = { ...data };

    if (data.status === "PUBLISHED" && existing.status !== "PUBLISHED") {
      updateData.publishedAt = data.publishedAt
        ? new Date(data.publishedAt)
        : new Date();
    }

    if (data.publishedAt) {
      updateData.publishedAt = new Date(data.publishedAt);
    }

    const page = await prisma.page.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json({ data: page });
  } catch (error) {
    console.error("PUT /api/admin/pages/[id] error:", error);
    return NextResponse.json(
      { error: "Failed to update page" },
      { status: 500 },
    );
  }
}

// ---------------------------------------------------------------------------
// DELETE /api/admin/pages/[id]
// ---------------------------------------------------------------------------

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;

    const existing = await prisma.page.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json(
        { error: "Page not found" },
        { status: 404 },
      );
    }

    await prisma.page.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE /api/admin/pages/[id] error:", error);
    return NextResponse.json(
      { error: "Failed to delete page" },
      { status: 500 },
    );
  }
}

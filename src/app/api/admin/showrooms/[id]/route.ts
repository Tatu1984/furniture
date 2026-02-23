import { NextResponse, type NextRequest } from "next/server";
import prisma from "@/lib/db";

// ---------------------------------------------------------------------------
// GET /api/admin/showrooms/[id]
// ---------------------------------------------------------------------------

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;

    const showroom = await prisma.showroom.findUnique({
      where: { id },
    });

    if (!showroom) {
      return NextResponse.json(
        { error: "Showroom not found" },
        { status: 404 },
      );
    }

    return NextResponse.json({ data: showroom });
  } catch (error) {
    console.error("GET /api/admin/showrooms/[id] error:", error);
    return NextResponse.json(
      { error: "Failed to fetch showroom" },
      { status: 500 },
    );
  }
}

// ---------------------------------------------------------------------------
// PUT /api/admin/showrooms/[id]
// ---------------------------------------------------------------------------

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const body = await request.json();

    const existing = await prisma.showroom.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json(
        { error: "Showroom not found" },
        { status: 404 },
      );
    }

    // Check slug uniqueness if changed
    if (body.slug && body.slug !== existing.slug) {
      const slugExists = await prisma.showroom.findFirst({
        where: { slug: body.slug, id: { not: id } },
      });
      if (slugExists) {
        return NextResponse.json(
          { error: "A showroom with this slug already exists" },
          { status: 409 },
        );
      }
    }

    const showroom = await prisma.showroom.update({
      where: { id },
      data: body,
    });

    return NextResponse.json({ data: showroom });
  } catch (error) {
    console.error("PUT /api/admin/showrooms/[id] error:", error);
    return NextResponse.json(
      { error: "Failed to update showroom" },
      { status: 500 },
    );
  }
}

// ---------------------------------------------------------------------------
// DELETE /api/admin/showrooms/[id]
// ---------------------------------------------------------------------------

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;

    const existing = await prisma.showroom.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json(
        { error: "Showroom not found" },
        { status: 404 },
      );
    }

    await prisma.showroom.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE /api/admin/showrooms/[id] error:", error);
    return NextResponse.json(
      { error: "Failed to delete showroom" },
      { status: 500 },
    );
  }
}

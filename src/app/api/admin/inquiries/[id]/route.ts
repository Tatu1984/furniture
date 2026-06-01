import { NextResponse, type NextRequest } from "next/server";
import prisma from "@/lib/db";
import { validateBody, updateInquirySchema } from "@/lib/validation";

// ---------------------------------------------------------------------------
// GET /api/admin/inquiries/[id] — full inquiry details
// ---------------------------------------------------------------------------

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const inquiry = await prisma.orderInquiry.findUnique({
      where: { id },
      include: {
        product: {
          select: {
            id: true,
            name: true,
            slug: true,
            sku: true,
            price: true,
            images: {
              orderBy: { sortOrder: "asc" },
              take: 1,
              select: { url: true },
            },
          },
        },
      },
    });

    if (!inquiry) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    return NextResponse.json({ data: inquiry });
  } catch (error) {
    console.error("GET /api/admin/inquiries/[id] error:", error);
    return NextResponse.json(
      { error: "Failed to fetch inquiry" },
      { status: 500 },
    );
  }
}

// ---------------------------------------------------------------------------
// PATCH /api/admin/inquiries/[id] — update status / notes / assignment
// ---------------------------------------------------------------------------

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const validation = validateBody(updateInquirySchema, body);

    if (!validation.success) {
      return NextResponse.json(
        { error: "Validation failed", details: validation.errors },
        { status: 400 },
      );
    }

    const data = validation.data;

    const updated = await prisma.orderInquiry.update({
      where: { id },
      data: {
        status: data.status,
        internalNotes: data.internalNotes,
        assignedTo: data.assignedTo,
        lastContactedAt: data.lastContactedAt
          ? new Date(data.lastContactedAt)
          : undefined,
      },
    });

    return NextResponse.json({ data: updated });
  } catch (error) {
    console.error("PATCH /api/admin/inquiries/[id] error:", error);
    return NextResponse.json(
      { error: "Failed to update inquiry" },
      { status: 500 },
    );
  }
}

// ---------------------------------------------------------------------------
// DELETE /api/admin/inquiries/[id]
// ---------------------------------------------------------------------------

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    await prisma.orderInquiry.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE /api/admin/inquiries/[id] error:", error);
    return NextResponse.json(
      { error: "Failed to delete inquiry" },
      { status: 500 },
    );
  }
}

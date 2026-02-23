import { NextResponse, type NextRequest } from "next/server";
import prisma from "@/lib/db";

// ---------------------------------------------------------------------------
// GET /api/admin/email-templates/[id]
// ---------------------------------------------------------------------------

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;

    const template = await prisma.emailTemplate.findUnique({
      where: { id },
    });

    if (!template) {
      return NextResponse.json(
        { error: "Email template not found" },
        { status: 404 },
      );
    }

    return NextResponse.json({ data: template });
  } catch (error) {
    console.error("GET /api/admin/email-templates/[id] error:", error);
    return NextResponse.json(
      { error: "Failed to fetch email template" },
      { status: 500 },
    );
  }
}

// ---------------------------------------------------------------------------
// PUT /api/admin/email-templates/[id]
// ---------------------------------------------------------------------------

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const body = await request.json();

    const existing = await prisma.emailTemplate.findUnique({
      where: { id },
    });
    if (!existing) {
      return NextResponse.json(
        { error: "Email template not found" },
        { status: 404 },
      );
    }

    // Check name uniqueness if changed
    if (body.name && body.name !== existing.name) {
      const nameExists = await prisma.emailTemplate.findFirst({
        where: { name: body.name, id: { not: id } },
      });
      if (nameExists) {
        return NextResponse.json(
          { error: "An email template with this name already exists" },
          { status: 409 },
        );
      }
    }

    const template = await prisma.emailTemplate.update({
      where: { id },
      data: body,
    });

    return NextResponse.json({ data: template });
  } catch (error) {
    console.error("PUT /api/admin/email-templates/[id] error:", error);
    return NextResponse.json(
      { error: "Failed to update email template" },
      { status: 500 },
    );
  }
}

// ---------------------------------------------------------------------------
// DELETE /api/admin/email-templates/[id]
// ---------------------------------------------------------------------------

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;

    const existing = await prisma.emailTemplate.findUnique({
      where: { id },
    });
    if (!existing) {
      return NextResponse.json(
        { error: "Email template not found" },
        { status: 404 },
      );
    }

    await prisma.emailTemplate.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE /api/admin/email-templates/[id] error:", error);
    return NextResponse.json(
      { error: "Failed to delete email template" },
      { status: 500 },
    );
  }
}

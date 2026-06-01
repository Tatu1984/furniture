import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import prisma from "@/lib/db";
import { sendEmail } from "@/lib/email";
import { validateBody } from "@/lib/validation";

const replySchema = z.object({
  subject: z.string().min(1).max(300),
  bodyHtml: z.string().min(1).max(50000),
  newStatus: z
    .enum(["NEW", "CONTACTED", "QUOTED", "CONFIRMED", "CLOSED", "CANCELLED"])
    .optional(),
});

// ---------------------------------------------------------------------------
// POST /api/admin/inquiries/[id]/reply — send an email to the customer and
// optionally bump the inquiry status (defaults to CONTACTED).
// ---------------------------------------------------------------------------

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const validation = validateBody(replySchema, body);

    if (!validation.success) {
      return NextResponse.json(
        { error: "Validation failed", details: validation.errors },
        { status: 400 },
      );
    }

    const inquiry = await prisma.orderInquiry.findUnique({
      where: { id },
      select: { id: true, customerEmail: true, status: true },
    });

    if (!inquiry) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const result = await sendEmail(
      inquiry.customerEmail,
      validation.data.subject,
      validation.data.bodyHtml,
    );

    if (!result.success) {
      return NextResponse.json(
        { error: result.error ?? "Email failed" },
        { status: 500 },
      );
    }

    const nextStatus =
      validation.data.newStatus ??
      (inquiry.status === "NEW" ? "CONTACTED" : inquiry.status);

    await prisma.orderInquiry.update({
      where: { id },
      data: {
        status: nextStatus,
        lastContactedAt: new Date(),
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("POST /api/admin/inquiries/[id]/reply error:", error);
    return NextResponse.json(
      { error: "Failed to send reply" },
      { status: 500 },
    );
  }
}

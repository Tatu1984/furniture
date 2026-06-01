import { NextResponse, type NextRequest } from "next/server";
import prisma from "@/lib/db";
import { validateBody, createInquirySchema } from "@/lib/validation";
import { sendEmail } from "@/lib/email";
import { env } from "@/lib/env";

// ---------------------------------------------------------------------------
// POST /api/inquiries — public submission of an order inquiry / quote request
// ---------------------------------------------------------------------------

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validation = validateBody(createInquirySchema, body);

    if (!validation.success) {
      return NextResponse.json(
        { error: "Validation failed", details: validation.errors },
        { status: 400 },
      );
    }

    const data = validation.data;

    const product = await prisma.product.findUnique({
      where: { id: data.productId },
      select: {
        id: true,
        name: true,
        slug: true,
        sku: true,
        price: true,
        currency: true,
        status: true,
        images: {
          where: { isDefault: true },
          take: 1,
          select: { url: true },
        },
      },
    });

    if (!product || product.status !== "PUBLISHED") {
      return NextResponse.json(
        { error: "Product not available" },
        { status: 404 },
      );
    }

    const inquiryNumber = `INQ-${Date.now()}-${Math.random()
      .toString(36)
      .substring(2, 7)
      .toUpperCase()}`;

    const ipAddress =
      request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      request.headers.get("x-real-ip") ||
      undefined;
    const userAgent = request.headers.get("user-agent") || undefined;

    const inquiry = await prisma.orderInquiry.create({
      data: {
        inquiryNumber,
        productId: product.id,
        productName: product.name,
        productSlug: product.slug,
        productSku: product.sku,
        productImage: product.images[0]?.url ?? null,
        unitPrice: product.price,
        currency: product.currency,
        quantity: data.quantity,
        selectedColor: data.selectedColor,
        selectedSize: data.selectedSize,
        selectedMaterial: data.selectedMaterial,
        variantId: data.variantId,
        preferences: (data.preferences as object | undefined) ?? undefined,
        customerName: data.customerName,
        customerEmail: data.customerEmail,
        customerPhone: data.customerPhone,
        shippingAddress: data.shippingAddress,
        shippingCity: data.shippingCity,
        shippingState: data.shippingState,
        shippingPostal: data.shippingPostal,
        shippingCountry: data.shippingCountry,
        notes: data.notes,
        preferredDeliveryTimeline: data.preferredDeliveryTimeline,
        preferredContact: data.preferredContact,
        ipAddress,
        userAgent,
      },
    });

    // Fire-and-forget acknowledgement to the customer; do not fail the request
    // if email delivery fails.
    void sendEmail(
      data.customerEmail,
      `We received your inquiry — ${inquiryNumber}`,
      `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color:#333;">Thanks for your inquiry!</h1>
        <p>Hi ${escape(data.customerName)},</p>
        <p>We've received your request for <strong>${escape(product.name)}</strong> (qty ${data.quantity}). Our team will reach out shortly with pricing and availability.</p>
        <p><strong>Reference:</strong> ${inquiryNumber}</p>
        <p style="color:#666;font-size:12px;">${env.FROM_NAME ?? "FSOW Furniture"}</p>
      </div>`,
    );

    // Notify admin if a notification address is configured
    const adminEmail = env.ADMIN_NOTIFICATION_EMAIL ?? env.FROM_EMAIL;
    if (adminEmail) {
      void sendEmail(
        adminEmail,
        `New inquiry — ${inquiryNumber} (${product.name})`,
        `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>New order inquiry</h2>
          <p><strong>${escape(data.customerName)}</strong> &lt;${escape(data.customerEmail)}&gt;</p>
          <p><strong>Product:</strong> ${escape(product.name)} (qty ${data.quantity})</p>
          ${data.notes ? `<p><strong>Notes:</strong> ${escape(data.notes)}</p>` : ""}
          <p><a href="${env.NEXT_PUBLIC_APP_URL ?? ""}/admin/inquiries/${inquiry.id}">Open in admin →</a></p>
        </div>`,
      );
    }

    return NextResponse.json(
      {
        data: {
          id: inquiry.id,
          inquiryNumber: inquiry.inquiryNumber,
          status: inquiry.status,
        },
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("POST /api/inquiries error:", error);
    return NextResponse.json(
      { error: "Failed to submit inquiry" },
      { status: 500 },
    );
  }
}

function escape(s: string): string {
  return s.replace(
    /[&<>"']/g,
    (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        c
      ] ?? c,
  );
}

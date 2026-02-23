import { NextResponse, type NextRequest } from "next/server";
import prisma from "@/lib/db";

// ---------------------------------------------------------------------------
// GET /api/admin/orders/[id]
// ---------------------------------------------------------------------------

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            phone: true,
            avatar: true,
          },
        },
        items: {
          include: {
            product: {
              select: { id: true, name: true, slug: true },
            },
            variant: {
              select: { id: true, name: true, sku: true },
            },
          },
        },
        shippingAddress: true,
        billingAddress: true,
        notes: { orderBy: { createdAt: "desc" } },
        refunds: {
          include: { items: true },
          orderBy: { createdAt: "desc" },
        },
        shipments: { orderBy: { createdAt: "desc" } },
        timeline: { orderBy: { createdAt: "desc" } },
        coupon: {
          select: { id: true, code: true, name: true, type: true, value: true },
        },
      },
    });

    if (!order) {
      return NextResponse.json(
        { error: "Order not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ data: order });
  } catch (error) {
    console.error("GET /api/admin/orders/[id] error:", error);
    return NextResponse.json(
      { error: "Failed to fetch order" },
      { status: 500 }
    );
  }
}

// ---------------------------------------------------------------------------
// PUT /api/admin/orders/[id] - Update status, add notes, update tracking
// ---------------------------------------------------------------------------

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const userId = request.headers.get("x-user-id") || undefined;

    const existing = await prisma.order.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json(
        { error: "Order not found" },
        { status: 404 }
      );
    }

    const {
      status,
      paymentStatus,
      fulfillmentStatus,
      trackingNumber,
      trackingUrl,
      carrier,
      shippingMethod,
      estimatedDeliveryDate,
      internalNotes,
      customerNote,
      note,
      noteType,
    } = body;

    // Build update data
    const updateData: Record<string, unknown> = {};

    if (status !== undefined) {
      updateData.status = status;
      // Set timestamp fields based on status change
      const now = new Date();
      switch (status) {
        case "CONFIRMED":
          updateData.confirmedAt = now;
          break;
        case "SHIPPED":
          updateData.shippedAt = now;
          break;
        case "DELIVERED":
          updateData.deliveredAt = now;
          updateData.completedAt = now;
          break;
        case "CANCELLED":
          updateData.cancelledAt = now;
          break;
        case "REFUNDED":
          updateData.refundedAt = now;
          break;
      }
    }

    if (paymentStatus !== undefined) {
      updateData.paymentStatus = paymentStatus;
      if (paymentStatus === "CAPTURED" && !existing.paidAt) {
        updateData.paidAt = new Date();
      }
    }

    if (fulfillmentStatus !== undefined) {
      updateData.fulfillmentStatus = fulfillmentStatus;
    }

    if (trackingNumber !== undefined) updateData.trackingNumber = trackingNumber;
    if (trackingUrl !== undefined) updateData.trackingUrl = trackingUrl;
    if (carrier !== undefined) updateData.carrier = carrier;
    if (shippingMethod !== undefined) updateData.shippingMethod = shippingMethod;
    if (estimatedDeliveryDate !== undefined) {
      updateData.estimatedDeliveryDate = estimatedDeliveryDate
        ? new Date(estimatedDeliveryDate)
        : null;
    }
    if (internalNotes !== undefined) updateData.internalNotes = internalNotes;
    if (customerNote !== undefined) updateData.customerNote = customerNote;

    // Use a transaction to update order and optionally add note/timeline
    const order = await prisma.$transaction(async (tx) => {
      const updatedOrder = await tx.order.update({
        where: { id },
        data: updateData,
        include: {
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
            },
          },
          items: true,
          timeline: { orderBy: { createdAt: "desc" }, take: 5 },
          notes: { orderBy: { createdAt: "desc" }, take: 5 },
        },
      });

      // Add a note if provided
      if (note) {
        await tx.orderNote.create({
          data: {
            orderId: id,
            content: note,
            type: noteType || "PRIVATE",
            addedBy: userId,
          },
        });
      }

      // Add timeline entry if status changed
      if (status && status !== existing.status) {
        await tx.orderTimeline.create({
          data: {
            orderId: id,
            status,
            title: `Status changed to ${status}`,
            description: `Order status updated from ${existing.status} to ${status}`,
            createdBy: userId,
          },
        });
      }

      return updatedOrder;
    });

    return NextResponse.json({ data: order });
  } catch (error) {
    console.error("PUT /api/admin/orders/[id] error:", error);
    return NextResponse.json(
      { error: "Failed to update order" },
      { status: 500 }
    );
  }
}

// ---------------------------------------------------------------------------
// DELETE /api/admin/orders/[id]
// ---------------------------------------------------------------------------

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const existing = await prisma.order.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json(
        { error: "Order not found" },
        { status: 404 }
      );
    }

    await prisma.order.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE /api/admin/orders/[id] error:", error);
    return NextResponse.json(
      { error: "Failed to delete order" },
      { status: 500 }
    );
  }
}

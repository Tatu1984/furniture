import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { getAuthUser } from "@/lib/auth";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const authPayload = await getAuthUser(request);
    if (!authPayload) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    const order = await prisma.order.findUnique({
      where: { id },
      select: {
        id: true,
        orderNumber: true,
        email: true,
        phone: true,
        status: true,
        paymentStatus: true,
        fulfillmentStatus: true,
        subtotal: true,
        discount: true,
        shippingCost: true,
        tax: true,
        taxRate: true,
        total: true,
        currency: true,
        couponCode: true,
        customerNote: true,
        shippingMethod: true,
        estimatedDeliveryDate: true,
        trackingNumber: true,
        trackingUrl: true,
        carrier: true,
        paymentMethod: true,
        paymentMethodTitle: true,
        cardLast4: true,
        cardBrand: true,
        createdAt: true,
        updatedAt: true,
        confirmedAt: true,
        paidAt: true,
        shippedAt: true,
        deliveredAt: true,
        cancelledAt: true,
        userId: true,
        shippingAddress: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            company: true,
            phone: true,
            line1: true,
            line2: true,
            city: true,
            state: true,
            postalCode: true,
            country: true,
          },
        },
        billingSnapshot: true,
        items: {
          select: {
            id: true,
            name: true,
            sku: true,
            slug: true,
            image: true,
            price: true,
            quantity: true,
            total: true,
            tax: true,
            attributes: true,
            width: true,
            height: true,
            depth: true,
            weight: true,
            assemblyRequired: true,
            fulfillmentStatus: true,
            trackingNumber: true,
            carrier: true,
          },
        },
        timeline: {
          orderBy: { createdAt: "desc" },
          select: {
            id: true,
            status: true,
            title: true,
            description: true,
            createdAt: true,
          },
        },
        shipments: {
          select: {
            id: true,
            trackingNumber: true,
            carrier: true,
            trackingUrl: true,
            status: true,
            shippedAt: true,
            deliveredAt: true,
          },
        },
        notes: {
          where: { type: "CUSTOMER" },
          orderBy: { createdAt: "desc" },
          select: {
            id: true,
            content: true,
            createdAt: true,
          },
        },
      },
    });

    if (!order) {
      return NextResponse.json(
        { error: "Order not found" },
        { status: 404 }
      );
    }

    // Ensure the order belongs to the authenticated user
    if (order.userId !== authPayload.userId) {
      return NextResponse.json(
        { error: "Order not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ order }, { status: 200 });
  } catch (error) {
    console.error("Get order detail error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

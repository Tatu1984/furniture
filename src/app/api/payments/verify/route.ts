import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { getAuthUser } from "@/lib/auth";
import { env } from "@/lib/env";
import { createOrderFromCart, OrderError } from "@/lib/services/order-service";

export async function POST(request: NextRequest) {
  try {
    const authPayload = await getAuthUser(request);
    if (!authPayload) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      addressId,
      shippingMethod,
      customerNote,
    } = body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return NextResponse.json(
        { error: "Missing payment details" },
        { status: 400 }
      );
    }

    // Verify Razorpay signature
    const expectedSignature = crypto
      .createHmac("sha256", env.RAZORPAY_KEY_SECRET)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest("hex");

    if (expectedSignature !== razorpay_signature) {
      return NextResponse.json(
        { error: "Payment verification failed" },
        { status: 400 }
      );
    }

    // Create the order
    const order = await createOrderFromCart({
      userId: authPayload.userId,
      shippingAddressId: addressId,
      paymentMethod: "UPI", // Razorpay handles the actual method
      shippingMethod: shippingMethod || null,
      customerNote: customerNote || null,
      gateway: "razorpay",
      gatewayOrderId: razorpay_order_id,
      gatewayPaymentId: razorpay_payment_id,
      paymentStatus: "CAPTURED",
      ipAddress:
        request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
        request.headers.get("x-real-ip") ??
        null,
      userAgent: request.headers.get("user-agent") ?? null,
    });

    return NextResponse.json(
      {
        message: "Payment verified and order created",
        order: {
          id: order.id,
          orderNumber: order.orderNumber,
          status: order.status,
          total: order.total,
          items: order.items,
          createdAt: order.createdAt,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Payment verification error:", error);
    if (error instanceof OrderError) {
      return NextResponse.json(
        { error: error.message },
        { status: error.status }
      );
    }
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

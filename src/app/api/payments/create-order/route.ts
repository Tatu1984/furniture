import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@/lib/auth";
import { getRazorpay } from "@/lib/razorpay";
import prisma from "@/lib/db";
import { calculateCartTotal } from "@/lib/services/order-service";

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
    const { firstName, lastName, email, phone, address, apt, city, state, zip, country } = body;

    // Validate required shipping fields
    if (!firstName || !lastName || !address || !city || !state || !zip) {
      return NextResponse.json(
        { error: "All shipping address fields are required" },
        { status: 400 }
      );
    }

    // Create or find address for this user
    const shippingAddress = await prisma.address.create({
      data: {
        userId: authPayload.userId,
        firstName,
        lastName,
        line1: address,
        line2: apt || null,
        city,
        state,
        postalCode: zip,
        country: country || "IN",
        phone: phone || null,
        type: "SHIPPING",
        isDefault: true,
      },
    });

    // Calculate cart totals
    const totals = await calculateCartTotal(authPayload.userId);

    // Create Razorpay order (amount in paise)
    const rzpOrder = await getRazorpay().orders.create({
      amount: Math.round(totals.total * 100),
      currency: "INR",
      receipt: `rcpt_${Date.now()}`,
      notes: {
        userId: authPayload.userId,
        addressId: shippingAddress.id,
      },
    });

    return NextResponse.json({
      razorpayOrderId: rzpOrder.id,
      amount: rzpOrder.amount,
      currency: rzpOrder.currency,
      keyId: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
      addressId: shippingAddress.id,
      totals,
    });
  } catch (error) {
    console.error("Create payment order error:", error);
    const message =
      error instanceof Error ? error.message : "Internal server error";
    const status = (error as { status?: number }).status || 500;
    return NextResponse.json({ error: message }, { status });
  }
}

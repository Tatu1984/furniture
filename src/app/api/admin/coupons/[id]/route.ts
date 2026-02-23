import { NextResponse, type NextRequest } from "next/server";
import prisma from "@/lib/db";

// ---------------------------------------------------------------------------
// GET /api/admin/coupons/[id]
// ---------------------------------------------------------------------------

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;

    const coupon = await prisma.coupon.findUnique({
      where: { id },
      include: {
        products: true,
        categories: {
          include: {
            category: { select: { id: true, name: true, slug: true } },
          },
        },
        _count: { select: { orders: true, usages: true } },
      },
    });

    if (!coupon) {
      return NextResponse.json(
        { error: "Coupon not found" },
        { status: 404 },
      );
    }

    return NextResponse.json({ data: coupon });
  } catch (error) {
    console.error("GET /api/admin/coupons/[id] error:", error);
    return NextResponse.json(
      { error: "Failed to fetch coupon" },
      { status: 500 },
    );
  }
}

// ---------------------------------------------------------------------------
// PUT /api/admin/coupons/[id]
// ---------------------------------------------------------------------------

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const body = await request.json();

    const existing = await prisma.coupon.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json(
        { error: "Coupon not found" },
        { status: 404 },
      );
    }

    // Check code uniqueness if changed
    if (body.code && body.code.toUpperCase() !== existing.code) {
      const codeExists = await prisma.coupon.findFirst({
        where: { code: body.code.toUpperCase(), id: { not: id } },
      });
      if (codeExists) {
        return NextResponse.json(
          { error: "A coupon with this code already exists" },
          { status: 409 },
        );
      }
      body.code = body.code.toUpperCase();
    }

    const { productIds, categoryIds, ...couponData } = body;

    // Convert date strings
    if (couponData.startsAt) couponData.startsAt = new Date(couponData.startsAt);
    if (couponData.expiresAt)
      couponData.expiresAt = new Date(couponData.expiresAt);

    const updateData: Record<string, unknown> = { ...couponData };

    if (productIds !== undefined) {
      updateData.products = {
        deleteMany: {},
        create: productIds.map((productId: string) => ({
          productId,
          type: "INCLUDE",
        })),
      };
    }

    if (categoryIds !== undefined) {
      updateData.categories = {
        deleteMany: {},
        create: categoryIds.map((categoryId: string) => ({
          categoryId,
          type: "INCLUDE",
        })),
      };
    }

    const coupon = await prisma.coupon.update({
      where: { id },
      data: updateData,
      include: {
        products: true,
        categories: {
          include: {
            category: { select: { id: true, name: true } },
          },
        },
      },
    });

    return NextResponse.json({ data: coupon });
  } catch (error) {
    console.error("PUT /api/admin/coupons/[id] error:", error);
    return NextResponse.json(
      { error: "Failed to update coupon" },
      { status: 500 },
    );
  }
}

// ---------------------------------------------------------------------------
// DELETE /api/admin/coupons/[id]
// ---------------------------------------------------------------------------

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;

    const existing = await prisma.coupon.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json(
        { error: "Coupon not found" },
        { status: 404 },
      );
    }

    await prisma.coupon.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE /api/admin/coupons/[id] error:", error);
    return NextResponse.json(
      { error: "Failed to delete coupon" },
      { status: 500 },
    );
  }
}

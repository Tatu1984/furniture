import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { getAuthUser } from "@/lib/auth";

// ── GET: Get user's wishlist ──────────────────────────────────────────────
export async function GET(request: NextRequest) {
  try {
    const authPayload = await getAuthUser(request);
    if (!authPayload) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    const wishlistItems = await prisma.wishlistItem.findMany({
      where: { userId: authPayload.userId },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        productId: true,
        createdAt: true,
        product: {
          select: {
            id: true,
            name: true,
            slug: true,
            price: true,
            compareAtPrice: true,
            currency: true,
            stockStatus: true,
            status: true,
            images: {
              where: { isDefault: true },
              take: 1,
              select: { id: true, url: true, alt: true },
            },
            reviews: {
              where: { status: "APPROVED" },
              select: { rating: true },
            },
          },
        },
      },
    });

    const items = wishlistItems
      .filter((item) => item.product.status === "PUBLISHED")
      .map((item) => {
        const ratings = item.product.reviews.map((r) => r.rating);
        const avgRating =
          ratings.length > 0
            ? Math.round(
                (ratings.reduce((a, b) => a + b, 0) / ratings.length) * 10
              ) / 10
            : 0;

        return {
          id: item.id,
          productId: item.productId,
          addedAt: item.createdAt,
          product: {
            id: item.product.id,
            name: item.product.name,
            slug: item.product.slug,
            price: item.product.price,
            compareAtPrice: item.product.compareAtPrice,
            currency: item.product.currency,
            stockStatus: item.product.stockStatus,
            image: item.product.images[0] || null,
            rating: {
              average: avgRating,
              count: ratings.length,
            },
          },
        };
      });

    return NextResponse.json(
      { wishlist: items, count: items.length },
      { status: 200 }
    );
  } catch (error) {
    console.error("Get wishlist error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// ── POST: Toggle product in wishlist ──────────────────────────────────────
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
    const { productId } = body;

    if (!productId || typeof productId !== "string") {
      return NextResponse.json(
        { error: "productId is required" },
        { status: 400 }
      );
    }

    // Validate product exists
    const product = await prisma.product.findUnique({
      where: { id: productId },
      select: { id: true, status: true },
    });

    if (!product || product.status !== "PUBLISHED") {
      return NextResponse.json(
        { error: "Product not found" },
        { status: 404 }
      );
    }

    // Check if already in wishlist (toggle behavior)
    const existing = await prisma.wishlistItem.findUnique({
      where: {
        userId_productId: {
          userId: authPayload.userId,
          productId,
        },
      },
    });

    if (existing) {
      // Remove from wishlist
      await prisma.wishlistItem.delete({ where: { id: existing.id } });
      return NextResponse.json(
        { message: "Removed from wishlist", added: false },
        { status: 200 }
      );
    }

    // Add to wishlist
    const item = await prisma.wishlistItem.create({
      data: {
        userId: authPayload.userId,
        productId,
      },
      select: {
        id: true,
        productId: true,
        createdAt: true,
      },
    });

    return NextResponse.json(
      { message: "Added to wishlist", added: true, item },
      { status: 201 }
    );
  } catch (error) {
    console.error("Toggle wishlist error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// ── DELETE: Remove from wishlist ──────────────────────────────────────────
export async function DELETE(request: NextRequest) {
  try {
    const authPayload = await getAuthUser(request);
    if (!authPayload) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const productId = searchParams.get("productId");

    if (!productId) {
      return NextResponse.json(
        { error: "productId query parameter is required" },
        { status: 400 }
      );
    }

    const existing = await prisma.wishlistItem.findUnique({
      where: {
        userId_productId: {
          userId: authPayload.userId,
          productId,
        },
      },
    });

    if (!existing) {
      return NextResponse.json(
        { error: "Item not found in wishlist" },
        { status: 404 }
      );
    }

    await prisma.wishlistItem.delete({ where: { id: existing.id } });

    return NextResponse.json(
      { message: "Removed from wishlist" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Remove from wishlist error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

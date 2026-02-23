import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { getAuthUser } from "@/lib/auth";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const { searchParams } = new URL(request.url);

    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
    const limit = Math.min(50, Math.max(1, parseInt(searchParams.get("limit") || "10", 10)));
    const sort = searchParams.get("sort") || "recent";
    const skip = (page - 1) * limit;

    // ── Find product ────────────────────────────────────────────────────
    const product = await prisma.product.findUnique({
      where: { slug },
      select: { id: true },
    });

    if (!product) {
      return NextResponse.json(
        { error: "Product not found" },
        { status: 404 }
      );
    }

    // ── Order by ────────────────────────────────────────────────────────
    let orderBy: Record<string, string>;
    switch (sort) {
      case "helpful":
        orderBy = { helpfulCount: "desc" };
        break;
      case "rating_high":
        orderBy = { rating: "desc" };
        break;
      case "rating_low":
        orderBy = { rating: "asc" };
        break;
      case "oldest":
        orderBy = { createdAt: "asc" };
        break;
      case "recent":
      default:
        orderBy = { createdAt: "desc" };
        break;
    }

    const where = {
      productId: product.id,
      status: "APPROVED" as const,
    };

    const [reviews, total] = await Promise.all([
      prisma.review.findMany({
        where,
        skip,
        take: limit,
        orderBy,
        select: {
          id: true,
          rating: true,
          title: true,
          content: true,
          isVerified: true,
          helpfulCount: true,
          createdAt: true,
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              avatar: true,
            },
          },
          images: {
            select: {
              id: true,
              url: true,
            },
          },
          reply: {
            select: {
              id: true,
              content: true,
              createdAt: true,
              user: {
                select: {
                  firstName: true,
                  lastName: true,
                },
              },
            },
          },
        },
      }),
      prisma.review.count({ where }),
    ]);

    // ── Rating summary ──────────────────────────────────────────────────
    const allRatings = await prisma.review.findMany({
      where: { productId: product.id, status: "APPROVED" },
      select: { rating: true },
    });

    const ratings = allRatings.map((r) => r.rating);
    const avgRating =
      ratings.length > 0
        ? Math.round((ratings.reduce((a, b) => a + b, 0) / ratings.length) * 10) / 10
        : 0;

    const distribution: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    for (const r of ratings) {
      if (r >= 1 && r <= 5) {
        distribution[r]++;
      }
    }

    return NextResponse.json(
      {
        reviews,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
        rating: {
          average: avgRating,
          count: ratings.length,
          distribution,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Get reviews error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;

    // ── Authentication ──────────────────────────────────────────────────
    const authPayload = await getAuthUser(request);
    if (!authPayload) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    // ── Find product ────────────────────────────────────────────────────
    const product = await prisma.product.findUnique({
      where: { slug },
      select: { id: true },
    });

    if (!product) {
      return NextResponse.json(
        { error: "Product not found" },
        { status: 404 }
      );
    }

    // ── Check for existing review ───────────────────────────────────────
    const existingReview = await prisma.review.findUnique({
      where: {
        productId_userId: {
          productId: product.id,
          userId: authPayload.userId,
        },
      },
    });

    if (existingReview) {
      return NextResponse.json(
        { error: "You have already reviewed this product" },
        { status: 409 }
      );
    }

    // ── Parse body ──────────────────────────────────────────────────────
    const body = await request.json();
    const { rating, title, content } = body;

    // ── Validation ──────────────────────────────────────────────────────
    if (!rating || typeof rating !== "number" || rating < 1 || rating > 5) {
      return NextResponse.json(
        { error: "Rating must be a number between 1 and 5" },
        { status: 400 }
      );
    }

    if (title && typeof title === "string" && title.trim().length > 200) {
      return NextResponse.json(
        { error: "Title must be 200 characters or fewer" },
        { status: 400 }
      );
    }

    if (content && typeof content === "string" && content.trim().length > 5000) {
      return NextResponse.json(
        { error: "Content must be 5000 characters or fewer" },
        { status: 400 }
      );
    }

    // ── Check verified purchase ─────────────────────────────────────────
    const purchasedOrder = await prisma.orderItem.findFirst({
      where: {
        productId: product.id,
        order: {
          userId: authPayload.userId,
          status: { in: ["DELIVERED", "CONFIRMED", "PROCESSING", "SHIPPED"] },
        },
      },
      select: { id: true },
    });

    const isVerified = !!purchasedOrder;

    // ── Create review ───────────────────────────────────────────────────
    const review = await prisma.review.create({
      data: {
        productId: product.id,
        userId: authPayload.userId,
        rating: Math.round(rating),
        title: title?.trim() || null,
        content: content?.trim() || null,
        isVerified,
        status: "PENDING",
      },
      select: {
        id: true,
        rating: true,
        title: true,
        content: true,
        isVerified: true,
        status: true,
        createdAt: true,
      },
    });

    return NextResponse.json(
      {
        message: "Review submitted successfully. It will be visible after moderation.",
        review,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Submit review error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

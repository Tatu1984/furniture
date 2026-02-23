import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { getAuthUser } from "@/lib/auth";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;

    const product = await prisma.product.findUnique({
      where: { slug },
      select: {
        id: true,
        name: true,
        slug: true,
        sku: true,
        description: true,
        shortDescription: true,
        type: true,
        status: true,
        visibility: true,
        price: true,
        compareAtPrice: true,
        costPrice: true,
        currency: true,
        stockStatus: true,
        stockQuantity: true,
        manageStock: true,
        backorderMode: true,
        materials: true,
        width: true,
        height: true,
        depth: true,
        dimensionUnit: true,
        weight: true,
        weightUnit: true,
        assemblyRequired: true,
        assemblyTime: true,
        careInstructions: true,
        warranty: true,
        madeIn: true,
        requiresShipping: true,
        isFreeShipping: true,
        estimatedDeliveryDays: true,
        isFeatured: true,
        isNewArrival: true,
        isBestseller: true,
        tags: true,
        collections: true,
        relatedProductIds: true,
        crossSellProductIds: true,
        seoTitle: true,
        seoDescription: true,
        seoKeywords: true,
        publishedAt: true,
        createdAt: true,
        updatedAt: true,
        images: {
          orderBy: { sortOrder: "asc" },
          select: {
            id: true,
            url: true,
            alt: true,
            sortOrder: true,
            isDefault: true,
            roomScene: true,
            variantId: true,
          },
        },
        variants: {
          where: { isActive: true },
          orderBy: { sortOrder: "asc" },
          select: {
            id: true,
            sku: true,
            name: true,
            price: true,
            compareAtPrice: true,
            stockQuantity: true,
            stockStatus: true,
            backorderMode: true,
            weight: true,
            width: true,
            height: true,
            depth: true,
            image: true,
            isDefault: true,
            attributeValues: {
              select: {
                attributeTerm: {
                  select: {
                    id: true,
                    name: true,
                    slug: true,
                    value: true,
                    attribute: {
                      select: {
                        id: true,
                        name: true,
                        slug: true,
                        type: true,
                      },
                    },
                  },
                },
              },
            },
          },
        },
        attributes: {
          where: { isVisible: true },
          orderBy: { sortOrder: "asc" },
          select: {
            id: true,
            isVariation: true,
            attribute: {
              select: {
                id: true,
                name: true,
                slug: true,
                type: true,
              },
            },
            terms: {
              select: {
                attributeTerm: {
                  select: {
                    id: true,
                    name: true,
                    slug: true,
                    value: true,
                  },
                },
              },
            },
          },
        },
        specifications: {
          orderBy: { sortOrder: "asc" },
          select: {
            id: true,
            groupName: true,
            name: true,
            value: true,
          },
        },
        reviews: {
          where: { status: "APPROVED" },
          orderBy: { createdAt: "desc" },
          take: 10,
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
        },
        category: {
          select: {
            id: true,
            name: true,
            slug: true,
            parent: {
              select: {
                id: true,
                name: true,
                slug: true,
              },
            },
          },
        },
      },
    });

    if (!product || product.status !== "PUBLISHED") {
      return NextResponse.json(
        { error: "Product not found" },
        { status: 404 }
      );
    }

    // ── Rating summary ──────────────────────────────────────────────────
    const allApprovedReviews = await prisma.review.findMany({
      where: { productId: product.id, status: "APPROVED" },
      select: { rating: true },
    });

    const ratings = allApprovedReviews.map((r) => r.rating);
    const avgRating =
      ratings.length > 0
        ? Math.round((ratings.reduce((a, b) => a + b, 0) / ratings.length) * 10) / 10
        : 0;

    const ratingDistribution: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    for (const r of ratings) {
      if (r >= 1 && r <= 5) {
        ratingDistribution[r]++;
      }
    }

    // ── Track product view ──────────────────────────────────────────────
    const authPayload = await getAuthUser(request);
    const sessionId =
      request.cookies.get("session-id")?.value ??
      request.headers.get("x-session-id") ??
      null;

    await prisma.productView.create({
      data: {
        productId: product.id,
        userId: authPayload?.userId ?? null,
        sessionId,
      },
    });

    // ── Related products ────────────────────────────────────────────────
    let relatedProducts: Array<{
      id: string;
      name: string;
      slug: string;
      price: unknown;
      images: Array<{ url: string; alt: string }>;
    }> = [];

    if (product.relatedProductIds.length > 0) {
      relatedProducts = await prisma.product.findMany({
        where: {
          id: { in: product.relatedProductIds },
          status: "PUBLISHED",
        },
        select: {
          id: true,
          name: true,
          slug: true,
          price: true,
          compareAtPrice: true,
          stockStatus: true,
          images: {
            where: { isDefault: true },
            take: 1,
            select: { url: true, alt: true },
          },
        },
      });
    }

    // ── Group specifications ────────────────────────────────────────────
    const specGroups: Record<string, Array<{ name: string; value: string }>> = {};
    for (const spec of product.specifications) {
      if (!specGroups[spec.groupName]) {
        specGroups[spec.groupName] = [];
      }
      specGroups[spec.groupName].push({ name: spec.name, value: spec.value });
    }

    return NextResponse.json(
      {
        product: {
          ...product,
          specifications: specGroups,
          rating: {
            average: avgRating,
            count: ratings.length,
            distribution: ratingDistribution,
          },
          relatedProducts,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Get product error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

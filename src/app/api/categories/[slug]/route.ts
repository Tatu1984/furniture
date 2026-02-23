import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { Prisma } from "@prisma/client";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const { searchParams } = new URL(request.url);

    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") || "20", 10)));
    const sort = searchParams.get("sort") || "newest";
    const minPrice = parseFloat(searchParams.get("minPrice") || "0");
    const maxPrice = parseFloat(searchParams.get("maxPrice") || "0");
    const materials = searchParams.get("materials")
      ? searchParams.get("materials")!.split(",").map((m) => m.trim()).filter(Boolean)
      : [];
    const inStock = searchParams.get("inStock");
    const skip = (page - 1) * limit;

    // ── Find category ───────────────────────────────────────────────────
    const category = await prisma.category.findUnique({
      where: { slug },
      select: {
        id: true,
        name: true,
        slug: true,
        description: true,
        image: true,
        bannerImage: true,
        icon: true,
        level: true,
        isFeatured: true,
        seoTitle: true,
        seoDescription: true,
        parent: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
        children: {
          where: { isActive: true },
          orderBy: { sortOrder: "asc" },
          select: {
            id: true,
            name: true,
            slug: true,
            image: true,
            _count: {
              select: {
                products: { where: { status: "PUBLISHED" } },
              },
            },
          },
        },
      },
    });

    if (!category) {
      return NextResponse.json(
        { error: "Category not found" },
        { status: 404 }
      );
    }

    // ── Collect this category + child category IDs ──────────────────────
    const categoryIds = [category.id, ...category.children.map((c) => c.id)];

    // ── Build product where clause ──────────────────────────────────────
    const where: Prisma.ProductWhereInput = {
      status: "PUBLISHED",
      categoryId: { in: categoryIds },
    };

    if (minPrice > 0) {
      where.price = { ...(where.price as object), gte: minPrice };
    }

    if (maxPrice > 0) {
      where.price = { ...(where.price as object), lte: maxPrice };
    }

    if (materials.length > 0) {
      where.materials = { hasSome: materials };
    }

    if (inStock === "true") {
      where.stockStatus = { in: ["IN_STOCK", "LOW_STOCK"] };
    }

    // ── Order by ────────────────────────────────────────────────────────
    let orderBy: Prisma.ProductOrderByWithRelationInput;
    switch (sort) {
      case "price_asc":
        orderBy = { price: "asc" };
        break;
      case "price_desc":
        orderBy = { price: "desc" };
        break;
      case "name_asc":
        orderBy = { name: "asc" };
        break;
      case "name_desc":
        orderBy = { name: "desc" };
        break;
      case "featured":
        orderBy = { isFeatured: "desc" };
        break;
      case "newest":
      default:
        orderBy = { createdAt: "desc" };
        break;
    }

    // ── Execute queries ─────────────────────────────────────────────────
    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        skip,
        take: limit,
        orderBy,
        select: {
          id: true,
          name: true,
          slug: true,
          sku: true,
          shortDescription: true,
          price: true,
          compareAtPrice: true,
          currency: true,
          stockStatus: true,
          materials: true,
          isFeatured: true,
          isNewArrival: true,
          isBestseller: true,
          createdAt: true,
          images: {
            where: { isDefault: true },
            take: 1,
            select: {
              id: true,
              url: true,
              alt: true,
            },
          },
          reviews: {
            where: { status: "APPROVED" },
            select: { rating: true },
          },
        },
      }),
      prisma.product.count({ where }),
    ]);

    const formattedProducts = products.map((product) => {
      const ratings = product.reviews.map((r) => r.rating);
      const avgRating =
        ratings.length > 0
          ? Math.round((ratings.reduce((a, b) => a + b, 0) / ratings.length) * 10) / 10
          : 0;

      return {
        id: product.id,
        name: product.name,
        slug: product.slug,
        sku: product.sku,
        shortDescription: product.shortDescription,
        price: product.price,
        compareAtPrice: product.compareAtPrice,
        currency: product.currency,
        stockStatus: product.stockStatus,
        materials: product.materials,
        isFeatured: product.isFeatured,
        isNewArrival: product.isNewArrival,
        isBestseller: product.isBestseller,
        createdAt: product.createdAt,
        image: product.images[0] || null,
        rating: {
          average: avgRating,
          count: ratings.length,
        },
      };
    });

    return NextResponse.json(
      {
        category: {
          id: category.id,
          name: category.name,
          slug: category.slug,
          description: category.description,
          image: category.image,
          bannerImage: category.bannerImage,
          icon: category.icon,
          level: category.level,
          isFeatured: category.isFeatured,
          seoTitle: category.seoTitle,
          seoDescription: category.seoDescription,
          parent: category.parent,
          children: category.children.map((c) => ({
            id: c.id,
            name: c.name,
            slug: c.slug,
            image: c.image,
            productCount: c._count.products,
          })),
        },
        products: formattedProducts,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Get category error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

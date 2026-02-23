import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { Prisma } from "@prisma/client";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    const q = (searchParams.get("q") || "").trim();
    const category = searchParams.get("category") || "";
    const minPrice = parseFloat(searchParams.get("minPrice") || "0");
    const maxPrice = parseFloat(searchParams.get("maxPrice") || "0");
    const materials = searchParams.get("materials")
      ? searchParams.get("materials")!.split(",").map((m) => m.trim()).filter(Boolean)
      : [];
    const sort = searchParams.get("sort") || "relevance";
    const inStock = searchParams.get("inStock");
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") || "20", 10)));
    const skip = (page - 1) * limit;

    if (!q) {
      return NextResponse.json(
        { error: "Search query (q) is required" },
        { status: 400 }
      );
    }

    // ── Build where clause ──────────────────────────────────────────────
    const where: Prisma.ProductWhereInput = {
      status: "PUBLISHED",
      visibility: { in: ["VISIBLE", "SEARCH"] },
      OR: [
        { name: { contains: q, mode: "insensitive" } },
        { description: { contains: q, mode: "insensitive" } },
        { shortDescription: { contains: q, mode: "insensitive" } },
        { tags: { hasSome: [q.toLowerCase()] } },
        { sku: { contains: q, mode: "insensitive" } },
        { materials: { hasSome: [q.toLowerCase()] } },
        {
          category: {
            name: { contains: q, mode: "insensitive" },
          },
        },
      ],
    };

    if (category) {
      const cat = await prisma.category.findUnique({
        where: { slug: category },
        select: { id: true },
      });
      if (cat) {
        where.categoryId = cat.id;
      }
    }

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

    // ── Build orderBy ───────────────────────────────────────────────────
    let orderBy: Prisma.ProductOrderByWithRelationInput;
    switch (sort) {
      case "price_asc":
        orderBy = { price: "asc" };
        break;
      case "price_desc":
        orderBy = { price: "desc" };
        break;
      case "newest":
        orderBy = { createdAt: "desc" };
        break;
      case "name_asc":
        orderBy = { name: "asc" };
        break;
      case "name_desc":
        orderBy = { name: "desc" };
        break;
      case "bestseller":
        orderBy = { isBestseller: "desc" };
        break;
      case "relevance":
      default:
        orderBy = { isFeatured: "desc" };
        break;
    }

    // ── Execute queries in parallel ─────────────────────────────────────
    const [products, total, categoryFacets, priceAgg] = await Promise.all([
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
          tags: true,
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
          category: {
            select: {
              id: true,
              name: true,
              slug: true,
            },
          },
          reviews: {
            where: { status: "APPROVED" },
            select: { rating: true },
          },
        },
      }),
      prisma.product.count({ where }),
      // Category facets with counts
      prisma.category.findMany({
        where: {
          isActive: true,
          products: {
            some: {
              status: "PUBLISHED",
              OR: [
                { name: { contains: q, mode: "insensitive" } },
                { description: { contains: q, mode: "insensitive" } },
                { tags: { hasSome: [q.toLowerCase()] } },
              ],
            },
          },
        },
        select: {
          id: true,
          name: true,
          slug: true,
          _count: {
            select: {
              products: {
                where: {
                  status: "PUBLISHED",
                  OR: [
                    { name: { contains: q, mode: "insensitive" } },
                    { description: { contains: q, mode: "insensitive" } },
                    { tags: { hasSome: [q.toLowerCase()] } },
                  ],
                },
              },
            },
          },
        },
        orderBy: { name: "asc" },
      }),
      // Price range facet
      prisma.product.aggregate({
        where,
        _min: { price: true },
        _max: { price: true },
      }),
    ]);

    // ── Format products with ratings ────────────────────────────────────
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
        tags: product.tags,
        createdAt: product.createdAt,
        image: product.images[0] || null,
        category: product.category,
        rating: {
          average: avgRating,
          count: ratings.length,
        },
      };
    });

    // ── Build facets ────────────────────────────────────────────────────
    const facets = {
      categories: categoryFacets
        .filter((c) => c._count.products > 0)
        .map((c) => ({
          id: c.id,
          name: c.name,
          slug: c.slug,
          count: c._count.products,
        })),
      priceRange: {
        min: priceAgg._min.price ? Number(priceAgg._min.price) : 0,
        max: priceAgg._max.price ? Number(priceAgg._max.price) : 0,
      },
    };

    return NextResponse.json(
      {
        query: q,
        products: formattedProducts,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
        facets,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Search error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

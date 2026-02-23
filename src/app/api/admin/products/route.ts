import { NextResponse, type NextRequest } from "next/server";
import prisma from "@/lib/db";

// ---------------------------------------------------------------------------
// GET /api/admin/products - List products with filtering, search, pagination
// ---------------------------------------------------------------------------

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
    const limit = Math.min(
      100,
      Math.max(1, parseInt(searchParams.get("limit") || "20", 10))
    );
    const search = searchParams.get("search") || undefined;
    const status = searchParams.get("status") || undefined;
    const categoryId = searchParams.get("categoryId") || undefined;
    const stockStatus = searchParams.get("stockStatus") || undefined;
    const sortBy = searchParams.get("sortBy") || "createdAt";
    const sortOrder = searchParams.get("sortOrder") === "asc" ? "asc" : "desc";
    const isFeatured = searchParams.get("isFeatured");
    const type = searchParams.get("type") || undefined;

    // Build where clause
    const where: Record<string, unknown> = {};

    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { sku: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
      ];
    }

    if (status) {
      where.status = status;
    }

    if (categoryId) {
      where.categoryId = categoryId;
    }

    if (stockStatus) {
      where.stockStatus = stockStatus;
    }

    if (isFeatured !== null && isFeatured !== undefined) {
      where.isFeatured = isFeatured === "true";
    }

    if (type) {
      where.type = type;
    }

    // Validate sortBy against allowed fields
    const allowedSortFields = [
      "createdAt",
      "updatedAt",
      "name",
      "price",
      "stockQuantity",
      "sortOrder",
    ];
    const safeSortBy = allowedSortFields.includes(sortBy)
      ? sortBy
      : "createdAt";

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { [safeSortBy]: sortOrder },
        select: {
          id: true,
          name: true,
          slug: true,
          sku: true,
          type: true,
          status: true,
          visibility: true,
          price: true,
          compareAtPrice: true,
          costPrice: true,
          currency: true,
          stockQuantity: true,
          stockStatus: true,
          isFeatured: true,
          isNewArrival: true,
          isBestseller: true,
          createdAt: true,
          updatedAt: true,
          category: {
            select: { id: true, name: true, slug: true },
          },
          images: {
            where: { isDefault: true },
            take: 1,
            select: { id: true, url: true, alt: true },
          },
          _count: {
            select: { variants: true, reviews: true, orderItems: true },
          },
        },
      }),
      prisma.product.count({ where }),
    ]);

    return NextResponse.json({
      data: products,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("GET /api/admin/products error:", error);
    return NextResponse.json(
      { error: "Failed to fetch products" },
      { status: 500 }
    );
  }
}

// ---------------------------------------------------------------------------
// POST /api/admin/products - Create a new product
// ---------------------------------------------------------------------------

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const {
      name,
      slug,
      sku,
      description,
      shortDescription,
      type = "SIMPLE",
      status = "DRAFT",
      visibility = "VISIBLE",
      price,
      compareAtPrice,
      costPrice,
      currency = "USD",
      categoryId,
      tags = [],
      collections = [],
      manageStock = true,
      stockQuantity = 0,
      lowStockThreshold = 5,
      stockStatus = "IN_STOCK",
      backorderMode = "NO",
      materials = [],
      width,
      height,
      depth,
      dimensionUnit = "cm",
      weight,
      weightUnit = "kg",
      assemblyRequired = false,
      assemblyTime,
      careInstructions,
      warranty,
      madeIn,
      requiresShipping = true,
      shippingClassId,
      isFreeShipping = false,
      estimatedDeliveryDays,
      isFeatured = false,
      isNewArrival = false,
      isBestseller = false,
      sortOrder = 0,
      seoTitle,
      seoDescription,
      seoKeywords = [],
      relatedProductIds = [],
      crossSellProductIds = [],
      images = [],
      variants = [],
      specifications = [],
    } = body;

    // Validate required fields
    if (!name || !slug || !sku || price === undefined) {
      return NextResponse.json(
        { error: "Name, slug, SKU, and price are required" },
        { status: 400 }
      );
    }

    // Check for duplicate slug or SKU
    const existing = await prisma.product.findFirst({
      where: { OR: [{ slug }, { sku }] },
    });

    if (existing) {
      return NextResponse.json(
        {
          error:
            existing.slug === slug
              ? "A product with this slug already exists"
              : "A product with this SKU already exists",
        },
        { status: 409 }
      );
    }

    const product = await prisma.product.create({
      data: {
        name,
        slug,
        sku,
        description,
        shortDescription,
        type,
        status,
        visibility,
        price,
        compareAtPrice,
        costPrice,
        currency,
        categoryId: categoryId || null,
        tags,
        collections,
        manageStock,
        stockQuantity,
        lowStockThreshold,
        stockStatus,
        backorderMode,
        materials,
        width,
        height,
        depth,
        dimensionUnit,
        weight,
        weightUnit,
        assemblyRequired,
        assemblyTime,
        careInstructions,
        warranty,
        madeIn,
        requiresShipping,
        shippingClassId: shippingClassId || null,
        isFreeShipping,
        estimatedDeliveryDays,
        isFeatured,
        isNewArrival,
        isBestseller,
        sortOrder,
        seoTitle,
        seoDescription,
        seoKeywords,
        relatedProductIds,
        crossSellProductIds,
        publishedAt: status === "PUBLISHED" ? new Date() : null,
        images: {
          create: images.map(
            (
              img: {
                url: string;
                alt?: string;
                sortOrder?: number;
                isDefault?: boolean;
                roomScene?: string;
              },
              index: number
            ) => ({
              url: img.url,
              alt: img.alt || "",
              sortOrder: img.sortOrder ?? index,
              isDefault: img.isDefault ?? index === 0,
              roomScene: img.roomScene,
            })
          ),
        },
        variants: {
          create: variants.map(
            (v: {
              sku: string;
              name: string;
              price: number;
              compareAtPrice?: number;
              costPrice?: number;
              stockQuantity?: number;
              lowStockThreshold?: number;
              stockStatus?: string;
              weight?: number;
              width?: number;
              height?: number;
              depth?: number;
              image?: string;
              sortOrder?: number;
              isActive?: boolean;
              isDefault?: boolean;
            }) => ({
              sku: v.sku,
              name: v.name,
              price: v.price,
              compareAtPrice: v.compareAtPrice,
              costPrice: v.costPrice,
              stockQuantity: v.stockQuantity ?? 0,
              lowStockThreshold: v.lowStockThreshold ?? 5,
              stockStatus: v.stockStatus ?? "IN_STOCK",
              weight: v.weight,
              width: v.width,
              height: v.height,
              depth: v.depth,
              image: v.image,
              sortOrder: v.sortOrder ?? 0,
              isActive: v.isActive ?? true,
              isDefault: v.isDefault ?? false,
            })
          ),
        },
        specifications: {
          create: specifications.map(
            (spec: {
              groupName: string;
              name: string;
              value: string;
              sortOrder?: number;
            }) => ({
              groupName: spec.groupName,
              name: spec.name,
              value: spec.value,
              sortOrder: spec.sortOrder ?? 0,
            })
          ),
        },
      },
      include: {
        category: { select: { id: true, name: true } },
        images: true,
        variants: true,
        specifications: true,
      },
    });

    return NextResponse.json({ data: product }, { status: 201 });
  } catch (error) {
    console.error("POST /api/admin/products error:", error);
    return NextResponse.json(
      { error: "Failed to create product" },
      { status: 500 }
    );
  }
}

// ---------------------------------------------------------------------------
// DELETE /api/admin/products - Bulk delete products
// ---------------------------------------------------------------------------

export async function DELETE(request: NextRequest) {
  try {
    const body = await request.json();
    const { ids } = body;

    if (!Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json(
        { error: "ids array is required" },
        { status: 400 }
      );
    }

    await prisma.product.deleteMany({
      where: { id: { in: ids } },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE /api/admin/products error:", error);
    return NextResponse.json(
      { error: "Failed to delete products" },
      { status: 500 }
    );
  }
}

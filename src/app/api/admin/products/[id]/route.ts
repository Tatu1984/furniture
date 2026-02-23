import { NextResponse, type NextRequest } from "next/server";
import prisma from "@/lib/db";

// ---------------------------------------------------------------------------
// GET /api/admin/products/[id]
// ---------------------------------------------------------------------------

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        category: { select: { id: true, name: true, slug: true } },
        images: { orderBy: { sortOrder: "asc" } },
        variants: {
          orderBy: { sortOrder: "asc" },
          include: {
            attributeValues: {
              include: {
                attributeTerm: {
                  include: { attribute: { select: { id: true, name: true } } },
                },
              },
            },
          },
        },
        attributes: {
          include: {
            attribute: true,
            terms: { include: { attributeTerm: true } },
          },
        },
        specifications: { orderBy: { sortOrder: "asc" } },
        shippingClass: true,
        _count: {
          select: {
            reviews: true,
            orderItems: true,
            wishlistItems: true,
            inventoryLogs: true,
          },
        },
      },
    });

    if (!product) {
      return NextResponse.json(
        { error: "Product not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ data: product });
  } catch (error) {
    console.error("GET /api/admin/products/[id] error:", error);
    return NextResponse.json(
      { error: "Failed to fetch product" },
      { status: 500 }
    );
  }
}

// ---------------------------------------------------------------------------
// PUT /api/admin/products/[id]
// ---------------------------------------------------------------------------

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    const existing = await prisma.product.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json(
        { error: "Product not found" },
        { status: 404 }
      );
    }

    // Check slug uniqueness if changed
    if (body.slug && body.slug !== existing.slug) {
      const slugExists = await prisma.product.findFirst({
        where: { slug: body.slug, id: { not: id } },
      });
      if (slugExists) {
        return NextResponse.json(
          { error: "A product with this slug already exists" },
          { status: 409 }
        );
      }
    }

    // Check SKU uniqueness if changed
    if (body.sku && body.sku !== existing.sku) {
      const skuExists = await prisma.product.findFirst({
        where: { sku: body.sku, id: { not: id } },
      });
      if (skuExists) {
        return NextResponse.json(
          { error: "A product with this SKU already exists" },
          { status: 409 }
        );
      }
    }

    // Handle images update: delete existing and recreate if provided
    const { images, variants, specifications, ...productData } = body;

    // Set publishedAt if transitioning to PUBLISHED
    if (
      productData.status === "PUBLISHED" &&
      existing.status !== "PUBLISHED"
    ) {
      productData.publishedAt = new Date();
    }

    const updateData: Record<string, unknown> = { ...productData };

    if (images !== undefined) {
      updateData.images = {
        deleteMany: {},
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
      };
    }

    if (variants !== undefined) {
      updateData.variants = {
        deleteMany: {},
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
      };
    }

    if (specifications !== undefined) {
      updateData.specifications = {
        deleteMany: {},
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
      };
    }

    const product = await prisma.product.update({
      where: { id },
      data: updateData,
      include: {
        category: { select: { id: true, name: true } },
        images: { orderBy: { sortOrder: "asc" } },
        variants: { orderBy: { sortOrder: "asc" } },
        specifications: { orderBy: { sortOrder: "asc" } },
      },
    });

    return NextResponse.json({ data: product });
  } catch (error) {
    console.error("PUT /api/admin/products/[id] error:", error);
    return NextResponse.json(
      { error: "Failed to update product" },
      { status: 500 }
    );
  }
}

// ---------------------------------------------------------------------------
// DELETE /api/admin/products/[id]
// ---------------------------------------------------------------------------

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const existing = await prisma.product.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json(
        { error: "Product not found" },
        { status: 404 }
      );
    }

    await prisma.product.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE /api/admin/products/[id] error:", error);
    return NextResponse.json(
      { error: "Failed to delete product" },
      { status: 500 }
    );
  }
}

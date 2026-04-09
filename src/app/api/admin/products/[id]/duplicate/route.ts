import { NextResponse, type NextRequest } from "next/server";
import prisma from "@/lib/db";

// ---------------------------------------------------------------------------
// POST /api/admin/products/[id]/duplicate
// Clones a product (and its images, variants, specifications) as a new
// DRAFT product with unique slug + SKU.
// ---------------------------------------------------------------------------

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;

    const source = await prisma.product.findUnique({
      where: { id },
      include: {
        images: { orderBy: { sortOrder: "asc" } },
        variants: { orderBy: { sortOrder: "asc" } },
        specifications: { orderBy: { sortOrder: "asc" } },
      },
    });

    if (!source) {
      return NextResponse.json(
        { error: "Product not found" },
        { status: 404 },
      );
    }

    // Generate unique slug
    const baseSlug = `${source.slug}-copy`;
    let slug = baseSlug;
    let counter = 1;
    while (await prisma.product.findUnique({ where: { slug } })) {
      counter += 1;
      slug = `${baseSlug}-${counter}`;
    }

    // Generate unique SKU
    const baseSku = `${source.sku}-COPY`;
    let sku = baseSku;
    let skuCounter = 1;
    while (await prisma.product.findUnique({ where: { sku } })) {
      skuCounter += 1;
      sku = `${baseSku}-${skuCounter}`;
    }

    // Generate unique variant SKUs (variants must also be unique within the
    // products schema if there's a unique constraint; safest to suffix).
    const variantSkuSeen = new Set<string>();
    async function uniqueVariantSku(base: string) {
      let candidate = `${base}-COPY`;
      let n = 1;
      while (
        variantSkuSeen.has(candidate) ||
        (await prisma.productVariant.findUnique({ where: { sku: candidate } }))
      ) {
        n += 1;
        candidate = `${base}-COPY-${n}`;
      }
      variantSkuSeen.add(candidate);
      return candidate;
    }

    const newVariants = await Promise.all(
      source.variants.map(async (v) => ({
        sku: await uniqueVariantSku(v.sku),
        name: v.name,
        price: v.price,
        compareAtPrice: v.compareAtPrice,
        costPrice: v.costPrice,
        stockQuantity: v.stockQuantity,
        lowStockThreshold: v.lowStockThreshold,
        stockStatus: v.stockStatus,
        weight: v.weight,
        width: v.width,
        height: v.height,
        depth: v.depth,
        image: v.image,
        sortOrder: v.sortOrder,
        isActive: v.isActive,
        isDefault: v.isDefault,
      })),
    );

    const created = await prisma.product.create({
      data: {
        name: `${source.name} (Copy)`,
        slug,
        sku,
        description: source.description,
        shortDescription: source.shortDescription,
        type: source.type,
        status: "DRAFT",
        visibility: source.visibility,
        price: source.price,
        compareAtPrice: source.compareAtPrice,
        costPrice: source.costPrice,
        currency: source.currency,
        categoryId: source.categoryId,
        tags: source.tags,
        collections: source.collections,
        manageStock: source.manageStock,
        stockQuantity: source.stockQuantity,
        lowStockThreshold: source.lowStockThreshold,
        stockStatus: source.stockStatus,
        backorderMode: source.backorderMode,
        materials: source.materials,
        width: source.width,
        height: source.height,
        depth: source.depth,
        dimensionUnit: source.dimensionUnit,
        weight: source.weight,
        weightUnit: source.weightUnit,
        assemblyRequired: source.assemblyRequired,
        assemblyTime: source.assemblyTime,
        careInstructions: source.careInstructions,
        warranty: source.warranty,
        madeIn: source.madeIn,
        requiresShipping: source.requiresShipping,
        shippingClassId: source.shippingClassId,
        isFreeShipping: source.isFreeShipping,
        estimatedDeliveryDays: source.estimatedDeliveryDays,
        isFeatured: false,
        isNewArrival: source.isNewArrival,
        isBestseller: false,
        sortOrder: source.sortOrder,
        menuOrder: source.menuOrder,
        seoTitle: source.seoTitle,
        seoDescription: source.seoDescription,
        seoKeywords: source.seoKeywords,
        relatedProductIds: source.relatedProductIds,
        crossSellProductIds: source.crossSellProductIds,
        images: {
          create: source.images.map((img) => ({
            url: img.url,
            alt: img.alt,
            sortOrder: img.sortOrder,
            isDefault: img.isDefault,
            roomScene: img.roomScene,
          })),
        },
        variants: { create: newVariants },
        specifications: {
          create: source.specifications.map((s) => ({
            groupName: s.groupName,
            name: s.name,
            value: s.value,
            sortOrder: s.sortOrder,
          })),
        },
      },
      select: { id: true, name: true, slug: true, sku: true },
    });

    return NextResponse.json({ data: created }, { status: 201 });
  } catch (error) {
    console.error("POST /api/admin/products/[id]/duplicate error:", error);
    const message =
      error instanceof Error ? error.message : "Failed to duplicate product";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

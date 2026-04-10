import { notFound } from "next/navigation";
import prisma from "@/lib/db";
import { ProductDetailContent } from "@/components/storefront/product-detail-content";

export const dynamic = "force-dynamic";

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
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
      status: true,
      price: true,
      compareAtPrice: true,
      currency: true,
      stockStatus: true,
      stockQuantity: true,
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
      estimatedDeliveryDays: true,
      isFeatured: true,
      isBestseller: true,
      tags: true,
      images: {
        orderBy: { sortOrder: "asc" },
        select: { url: true, alt: true },
      },
      specifications: {
        orderBy: { sortOrder: "asc" },
        select: { groupName: true, name: true, value: true },
      },
      category: {
        select: { id: true, name: true, slug: true },
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
          createdAt: true,
          user: {
            select: { firstName: true, lastName: true, avatar: true },
          },
        },
      },
      _count: { select: { reviews: true } },
    },
  });

  if (!product || product.status !== "PUBLISHED") {
    notFound();
  }

  // Serialize for the client component (Decimal → number, Date → string)
  const serialized = {
    id: product.id,
    name: product.name,
    slug: product.slug,
    sku: product.sku,
    description: product.description ?? "",
    shortDescription: product.shortDescription ?? "",
    price: Number(product.price),
    compareAtPrice: product.compareAtPrice
      ? Number(product.compareAtPrice)
      : null,
    currency: product.currency,
    stockStatus: product.stockStatus,
    stockQuantity: product.stockQuantity,
    materials: product.materials,
    assemblyRequired: product.assemblyRequired,
    assemblyTime: product.assemblyTime,
    careInstructions: product.careInstructions,
    warranty: product.warranty,
    madeIn: product.madeIn,
    estimatedDeliveryDays: product.estimatedDeliveryDays,
    images: product.images.map((img) => ({
      url: img.url,
      alt: img.alt ?? "",
    })),
    specifications: product.specifications.map((s) => ({
      groupName: s.groupName,
      name: s.name,
      value: s.value,
    })),
    category: product.category,
    reviews: product.reviews.map((r) => ({
      id: r.id,
      rating: r.rating,
      title: r.title,
      content: r.content,
      createdAt: r.createdAt.toISOString(),
      user: r.user,
    })),
    reviewCount: product._count.reviews,
  };

  return <ProductDetailContent product={serialized} />;
}

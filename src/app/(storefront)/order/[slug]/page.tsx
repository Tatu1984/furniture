import { notFound } from "next/navigation";
import prisma from "@/lib/db";
import { OrderInquiryForm } from "@/components/storefront/order-inquiry-form";

export const dynamic = "force-dynamic";

export default async function OrderInquiryPage({
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
      price: true,
      compareAtPrice: true,
      currency: true,
      shortDescription: true,
      materials: true,
      assemblyRequired: true,
      assemblyTime: true,
      estimatedDeliveryDays: true,
      status: true,
      images: {
        orderBy: { sortOrder: "asc" },
        take: 1,
        select: { url: true, alt: true },
      },
      category: { select: { name: true, slug: true } },
      variants: {
        where: { isActive: true },
        orderBy: { sortOrder: "asc" },
        select: {
          id: true,
          name: true,
          price: true,
          image: true,
        },
      },
    },
  });

  if (!product || product.status !== "PUBLISHED") {
    notFound();
  }

  const serialized = {
    id: product.id,
    name: product.name,
    slug: product.slug,
    sku: product.sku,
    price: Number(product.price),
    compareAtPrice: product.compareAtPrice
      ? Number(product.compareAtPrice)
      : null,
    currency: product.currency,
    shortDescription: product.shortDescription ?? "",
    materials: product.materials,
    assemblyRequired: product.assemblyRequired,
    assemblyTime: product.assemblyTime,
    estimatedDeliveryDays: product.estimatedDeliveryDays,
    image: product.images[0]?.url ?? "/placeholder.svg",
    imageAlt: product.images[0]?.alt ?? product.name,
    category: product.category,
    variants: product.variants.map((v) => ({
      id: v.id,
      name: v.name,
      price: Number(v.price),
      image: v.image,
    })),
  };

  return <OrderInquiryForm product={serialized} />;
}

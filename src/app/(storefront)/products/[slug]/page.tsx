import { ProductDetailContent } from "@/components/storefront/product-detail-content";

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  return <ProductDetailContent slug={slug} />;
}

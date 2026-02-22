import { ProductDetailContent } from "@/components/storefront/product-detail-content";

// ---------------------------------------------------------------------------
// Static params for known product slugs
// ---------------------------------------------------------------------------

export function generateStaticParams() {
  return [
    { slug: "modern-sofa" },
    { slug: "leather-armchair" },
    { slug: "oak-coffee-table" },
    { slug: "walnut-bookshelf" },
    { slug: "dining-table-set" },
    { slug: "platform-bed" },
    { slug: "oak-nightstand" },
    { slug: "wide-dresser" },
    { slug: "standing-desk" },
    { slug: "ergonomic-chair" },
    { slug: "teak-lounge-chair" },
    { slug: "ceramic-planter" },
  ];
}

// ---------------------------------------------------------------------------
// Metadata
// ---------------------------------------------------------------------------

const productNames: Record<string, string> = {
  "modern-sofa": "Modern Sectional Sofa",
  "leather-armchair": "Leather Lounge Armchair",
  "oak-coffee-table": "Oak Coffee Table",
  "walnut-bookshelf": "Walnut Standing Bookshelf",
  "dining-table-set": "Dining Table Set for 6",
  "platform-bed": "Walnut Platform Bed Frame",
  "oak-nightstand": "Oak Nightstand",
  "wide-dresser": "Wide 6-Drawer Dresser",
  "standing-desk": "Adjustable Standing Desk",
  "ergonomic-chair": "Ergonomic Mesh Office Chair",
  "teak-lounge-chair": "Teak Outdoor Lounge Chair",
  "ceramic-planter": "Large Ceramic Planter",
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const name =
    productNames[slug] ??
    slug
      .split("-")
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(" ");
  return {
    title: `${name} | FSOW Furniture`,
    description: `Shop the ${name} at FSOW. Premium furniture with free delivery.`,
  };
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  return <ProductDetailContent slug={slug} />;
}

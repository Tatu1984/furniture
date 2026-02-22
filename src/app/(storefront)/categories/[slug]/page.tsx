import { CategoryDetailContent } from "@/components/storefront/category-detail-content";

// ---------------------------------------------------------------------------
// Static params for the 6 category slugs
// ---------------------------------------------------------------------------

export function generateStaticParams() {
  return [
    { slug: "living-room" },
    { slug: "bedroom" },
    { slug: "dining" },
    { slug: "office" },
    { slug: "outdoor" },
    { slug: "decor" },
  ];
}

// ---------------------------------------------------------------------------
// Metadata
// ---------------------------------------------------------------------------

const categoryNames: Record<string, string> = {
  "living-room": "Living Room",
  bedroom: "Bedroom",
  dining: "Dining",
  office: "Office",
  outdoor: "Outdoor",
  decor: "Decor",
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const name = categoryNames[slug] ?? slug;
  return {
    title: `${name} Furniture | FSOW`,
    description: `Shop our ${name.toLowerCase()} furniture collection at FSOW.`,
  };
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default async function CategoryDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  return <CategoryDetailContent slug={slug} />;
}

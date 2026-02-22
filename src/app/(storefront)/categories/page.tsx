import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { categories } from "@/lib/mock-data/categories";
import { SectionHeading } from "@/components/shared/section-heading";

// ---------------------------------------------------------------------------
// Metadata
// ---------------------------------------------------------------------------

export const metadata = {
  title: "Shop by Category | FSOW",
  description:
    "Browse our curated furniture categories — from living room essentials to outdoor favorites.",
};

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function CategoriesPage() {
  return (
    <section className="container mx-auto px-4 py-12 md:py-20">
      <SectionHeading
        title="Shop by Category"
        subtitle="Explore our curated collections of premium furniture for every room in your home."
      />

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {categories.map((cat) => (
          <Link
            key={cat.id}
            href={`/categories/${cat.slug}`}
            className="group relative overflow-hidden rounded-2xl"
          >
            {/* Background image */}
            <div className="relative aspect-[3/2] w-full overflow-hidden">
              <Image
                src={`https://picsum.photos/seed/category-${cat.slug}/600/400`}
                alt={cat.name}
                fill
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                className="object-cover transition-transform duration-500 group-hover:scale-110"
              />

              {/* Gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
            </div>

            {/* Text overlay */}
            <div className="absolute inset-x-0 bottom-0 flex flex-col gap-1 p-6">
              <h3 className="text-xl font-bold text-white md:text-2xl">
                {cat.name}
              </h3>
              <p className="line-clamp-2 text-sm text-white/80">
                {cat.description}
              </p>
              <div className="mt-2 flex items-center gap-1 text-sm font-medium text-white/90 transition-colors group-hover:text-white">
                {cat.productCount} products
                <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}

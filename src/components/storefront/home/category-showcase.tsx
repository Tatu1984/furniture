import Image from "next/image";
import Link from "next/link";
import { SectionHeading } from "@/components/shared/section-heading";
import prisma from "@/lib/db";

export async function CategoryShowcase() {
  // Top-level active categories from DB, ordered by sortOrder
  const dbCategories = await prisma.category.findMany({
    where: { isActive: true, parentId: null },
    orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
    take: 6,
    select: {
      id: true,
      name: true,
      slug: true,
      _count: {
        select: { products: { where: { status: "PUBLISHED" } } },
      },
    },
  });

  const displayCategories = dbCategories.map((c) => ({
    id: c.id,
    name: c.name,
    slug: c.slug,
    productCount: c._count.products,
  }));

  return (
    <section className="container mx-auto px-4 py-20">
      <SectionHeading
        title="Shop by Room"
        subtitle="Find the perfect pieces for every space in your home."
      />

      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 md:gap-6">
        {displayCategories.map((category, index) => {
          // First 2 items span full column height on larger screens
          const isLarge = index < 2;

          return (
            <Link
              key={category.id}
              href={`/categories/${category.slug}`}
              className={`group relative overflow-hidden rounded-xl ${
                isLarge ? "row-span-2 min-h-[300px] md:min-h-[400px]" : "min-h-[200px] md:min-h-[250px]"
              }`}
            >
              <Image
                src={`https://picsum.photos/seed/${category.slug}/600/400`}
                alt={category.name}
                fill
                sizes={isLarge ? "(max-width: 768px) 50vw, 33vw" : "(max-width: 768px) 50vw, 33vw"}
                className="object-cover transition-transform duration-500 group-hover:scale-110"
              />

              {/* Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent transition-colors duration-300 group-hover:from-black/80" />

              {/* Content */}
              <div className="absolute bottom-0 left-0 right-0 p-4 md:p-6">
                <h3 className="text-lg font-bold text-white md:text-xl">
                  {category.name}
                </h3>
                <p className="mt-1 text-sm text-white/80">
                  {category.productCount} Products
                </p>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}

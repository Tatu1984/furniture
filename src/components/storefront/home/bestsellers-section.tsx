"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "motion/react";
import { SectionHeading } from "@/components/shared/section-heading";
import { PriceDisplay } from "@/components/shared/price-display";
import { RatingStars } from "@/components/shared/rating-stars";

const bestsellers = [
  {
    id: "bs-1",
    slug: "nordic-lounge-chair",
    name: "Nordic Lounge Chair",
    price: 699,
    compareAtPrice: 899,
    rating: 4.9,
    reviewCount: 312,
    image: "https://picsum.photos/seed/nordic-chair/600/600",
  },
  {
    id: "bs-2",
    slug: "cedar-dining-set",
    name: "Cedar 6-Seat Dining Set",
    price: 2299,
    compareAtPrice: 2799,
    rating: 4.8,
    reviewCount: 189,
    image: "https://picsum.photos/seed/cedar-dining/600/600",
  },
  {
    id: "bs-3",
    slug: "cloud-comfort-mattress",
    name: "Cloud Comfort Mattress",
    price: 1199,
    compareAtPrice: 1499,
    rating: 4.7,
    reviewCount: 456,
    image: "https://picsum.photos/seed/cloud-mattress/600/600",
  },
  {
    id: "bs-4",
    slug: "modular-storage-unit",
    name: "Modular Storage Unit",
    price: 549,
    compareAtPrice: 699,
    rating: 4.6,
    reviewCount: 234,
    image: "https://picsum.photos/seed/modular-storage/600/600",
  },
];

export function BestsellersSection() {
  return (
    <section className="bg-secondary/30 py-20">
      <div className="container mx-auto px-4">
        <SectionHeading
          title="Bestsellers"
          subtitle="Our most loved pieces, chosen by thousands of happy customers."
        />

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {bestsellers.map((product, index) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{
                duration: 0.5,
                delay: index * 0.1,
                ease: "easeOut",
              }}
            >
              <Link
                href={`/products/${product.slug}`}
                className="group block overflow-hidden rounded-xl border bg-card shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
              >
                <div className="relative aspect-square overflow-hidden">
                  <Image
                    src={product.image}
                    alt={product.name}
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute left-3 top-3">
                    <span className="rounded-full bg-destructive px-2.5 py-1 text-xs font-semibold text-white">
                      Bestseller
                    </span>
                  </div>
                </div>

                <div className="flex flex-col gap-2 p-4">
                  <h3 className="line-clamp-1 font-semibold text-foreground">
                    {product.name}
                  </h3>

                  <RatingStars
                    rating={product.rating}
                    size="sm"
                    showValue
                    reviewCount={product.reviewCount}
                  />

                  <PriceDisplay
                    price={product.price}
                    compareAtPrice={product.compareAtPrice}
                  />
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

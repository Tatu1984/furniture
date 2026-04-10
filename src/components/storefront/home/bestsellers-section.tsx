"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "motion/react";
import { SectionHeading } from "@/components/shared/section-heading";
import { PriceDisplay } from "@/components/shared/price-display";

type BestsellerProduct = {
  id: string;
  slug: string;
  name: string;
  price: number;
  compareAtPrice: number | null;
  image: string | null;
};

export function BestsellersSection() {
  const [products, setProducts] = React.useState<BestsellerProduct[]>([]);

  React.useEffect(() => {
    fetch("/api/products?bestseller=true&limit=4")
      .then((r) => (r.ok ? r.json() : null))
      .then((json) => {
        if (!json?.data || json.data.length === 0) {
          // Fallback to latest products
          fetch("/api/products?limit=4")
            .then((r) => (r.ok ? r.json() : null))
            .then((j) => {
              if (j?.data) mapAndSet(j.data);
            });
          return;
        }
        mapAndSet(json.data);
      })
      .catch(() => {});

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    function mapAndSet(data: any[]) {
      setProducts(
        data.map((p) => ({
          id: p.id,
          slug: p.slug,
          name: p.name,
          price: Number(p.price ?? 0),
          compareAtPrice: p.compareAtPrice ? Number(p.compareAtPrice) : null,
          image: p.images?.[0]?.url ?? null,
        })),
      );
    }
  }, []);

  if (products.length === 0) return null;

  return (
    <section className="bg-secondary/30 py-20">
      <div className="container mx-auto px-4">
        <SectionHeading
          title="Bestsellers"
          subtitle="Our most loved pieces, chosen by thousands of happy customers."
        />

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {products.map((product, index) => (
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
                <div className="relative aspect-square overflow-hidden bg-muted">
                  {product.image ? (
                    <Image
                      src={product.image}
                      alt={product.name}
                      fill
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                      unoptimized
                    />
                  ) : (
                    <div className="size-full flex items-center justify-center text-muted-foreground text-xs">
                      No image
                    </div>
                  )}
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
                  <PriceDisplay
                    price={product.price}
                    compareAtPrice={product.compareAtPrice ?? undefined}
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

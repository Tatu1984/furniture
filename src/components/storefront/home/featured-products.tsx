"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselPrevious,
  CarouselNext,
} from "@/components/ui/carousel";
import { SectionHeading } from "@/components/shared/section-heading";
import { PriceDisplay } from "@/components/shared/price-display";
import { useCartStore } from "@/stores/cart-store";

type FeaturedProduct = {
  id: string;
  slug: string;
  name: string;
  price: number;
  image: string | null;
};

export function FeaturedProducts() {
  const addItem = useCartStore((s) => s.addItem);
  const [products, setProducts] = React.useState<FeaturedProduct[]>([]);

  React.useEffect(() => {
    fetch("/api/products?featured=true&limit=8")
      .then((r) => (r.ok ? r.json() : null))
      .then((json) => {
        if (!json?.data) {
          // Fallback: fetch latest published products
          fetch("/api/products?limit=8")
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
          image: p.images?.[0]?.url ?? null,
        })),
      );
    }
  }, []);

  if (products.length === 0) return null;

  return (
    <section className="container mx-auto px-4 py-20">
      <SectionHeading
        title="Featured Collection"
        subtitle="Handpicked pieces that define modern living."
      />

      <div className="mx-auto max-w-[calc(100%-6rem)]">
        <Carousel
          opts={{ align: "start", loop: true }}
          className="w-full"
        >
          <CarouselContent className="-ml-4">
            {products.map((product) => (
              <CarouselItem
                key={product.id}
                className="pl-4 basis-full sm:basis-1/2 lg:basis-1/3 xl:basis-1/4"
              >
                <div className="group rounded-xl border bg-card shadow-sm transition-shadow hover:shadow-md">
                  <Link
                    href={`/products/${product.slug}`}
                    className="relative block aspect-square overflow-hidden rounded-t-xl bg-muted"
                  >
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
                  </Link>

                  <div className="flex flex-col gap-2 p-4">
                    <Link
                      href={`/products/${product.slug}`}
                      className="line-clamp-1 font-semibold text-foreground transition-colors hover:text-primary"
                    >
                      {product.name}
                    </Link>

                    <div className="mt-1 flex items-center justify-between">
                      <PriceDisplay price={product.price} />
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() =>
                          addItem({
                            productId: product.id,
                            name: product.name,
                            slug: product.slug,
                            image: product.image ?? "",
                            price: product.price,
                            variant: {},
                          })
                        }
                      >
                        <ShoppingCart className="h-4 w-4" />
                        <span className="sr-only sm:not-sr-only sm:ml-1">
                          Add
                        </span>
                      </Button>
                    </div>
                  </div>
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious />
          <CarouselNext />
        </Carousel>
      </div>
    </section>
  );
}
